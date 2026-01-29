



import { logService } from './logService';

const TARGET_HOST = 'generativelanguage.googleapis.com';

/**
 * Sanitize URL to remove sensitive information before displaying in error messages.
 * Removes:
 * - User credentials (username:password)
 * - API keys in query parameters
 * - Sensitive query parameters
 */
const sanitizeUrlForDisplay = (url: string): string => {
    try {
        const urlObj = new URL(url);
        
        // Remove user credentials if present
        if (urlObj.username || urlObj.password) {
            urlObj.username = '';
            urlObj.password = '';
        }
        
        // Remove sensitive query parameters (API keys, tokens, etc.)
        const sensitiveParams = ['key', 'apikey', 'api_key', 'token', 'access_token', 'auth', 'authorization'];
        const params = new URLSearchParams(urlObj.search);
        let hasSensitiveParams = false;
        
        // Use case-insensitive matching for query parameters
        for (const [paramName, paramValue] of params.entries()) {
            const lowerParamName = paramName.toLowerCase();
            if (sensitiveParams.includes(lowerParamName)) {
                params.delete(paramName);
                hasSensitiveParams = true;
            }
        }
        
        urlObj.search = params.toString();
        
        // Add indicator as URL fragment if sensitive params were removed
        if (hasSensitiveParams) {
            urlObj.hash = '#sensitive_params_removed';
        }
        
        return urlObj.toString();
    } catch {
        // If URL parsing fails, don't risk exposing any sensitive data
        // Return a safe placeholder instead of attempting partial sanitization
        return '[malformed URL - unable to sanitize safely]';
    }
};

// Capture the original fetch immediately when the module loads.
// We handle potential HMR re-runs or pre-existing patches by checking the flag.
let originalFetch: typeof window.fetch = window.fetch;

// If the current window.fetch is already our patched version (e.g. after HMR),
// we shouldn't treat it as the original. 
// However, since we can't easily get the 'real' original if it's lost, 
// we assume the first load captured it correctly or we rely on the mount check to prevent nesting.

let currentProxyUrl: string | null = null;
let isInterceptorEnabled = false;

export const networkInterceptor = {
    /**
     * Configure the interceptor with current settings.
     */
    configure: (enabled: boolean, proxyUrl: string | null) => {
        isInterceptorEnabled = enabled;
        // Remove trailing slash to ensure clean path concatenation
        currentProxyUrl = proxyUrl ? proxyUrl.replace(/\/$/, '') : null;
        
        if (isInterceptorEnabled && currentProxyUrl) {
            // Validate proxy URL format
            try {
                const url = new URL(currentProxyUrl);
                if (!url.protocol.startsWith('http')) {
                    logService.warn(`[NetworkInterceptor] Invalid proxy URL protocol: ${url.protocol}. Expected http: or https:. Disabling interceptor.`, { category: 'NETWORK' });
                    // Disable interceptor if protocol is invalid
                    isInterceptorEnabled = false;
                    currentProxyUrl = null;
                    return;
                }
                logService.debug(`[NetworkInterceptor] Configured. Target: ${currentProxyUrl}`, { category: 'NETWORK' });
            } catch (e) {
                logService.error(`[NetworkInterceptor] Invalid proxy URL format: ${currentProxyUrl}`, { 
                    error: e, 
                    category: 'NETWORK' 
                });
                logService.warn('[NetworkInterceptor] Proxy interceptor disabled due to invalid URL configuration.', { category: 'NETWORK' });
                // Disable interceptor if URL is invalid
                isInterceptorEnabled = false;
                currentProxyUrl = null;
            }
        }
    },

    /**
     * Mounts the interceptor to window.fetch.
     * Should be called once at app startup.
     */
    mount: () => {
        // Prevent double mounting
        if ((window.fetch as any).__isAllModelChatInterceptor) return;

        // Ensure we have the original fetch
        originalFetch = window.fetch;

        const patchedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
            // Pass through if disabled or no proxy configured
            if (!isInterceptorEnabled || !currentProxyUrl) {
                return originalFetch(input, init);
            }

            let urlStr = '';
            let originalRequest: Request | null = null;

            // Normalize input to string
            if (typeof input === 'string') {
                urlStr = input;
            } else if (input instanceof URL) {
                urlStr = input.toString();
            } else if (input instanceof Request) {
                urlStr = input.url;
                originalRequest = input;
            }

            // Check if the request is targeting the Gemini API host
            if (urlStr.includes(TARGET_HOST)) {
                try {
                    const targetOrigin = "https://generativelanguage.googleapis.com";
                    
                    // Rewrite the URL
                    let newUrl = urlStr.replace(targetOrigin, currentProxyUrl);
                    
                    // Fix Vertex AI Express path issue where SDK sends /v1beta/models but Vertex Express endpoint is /v1/publishers/google/models
                    // This often results in .../publishers/google/v1beta/models which is invalid.
                    
                    // 1. Normalize version for Vertex Express style paths: /v1/v1beta/ -> /v1/
                    // This handles the case where user sets base to .../v1 but SDK requests /v1beta/...
                    if (newUrl.includes('/v1/v1beta/')) {
                        newUrl = newUrl.replace('/v1/v1beta/', '/v1/');
                    } else if (newUrl.includes('/v1/v1/')) {
                        newUrl = newUrl.replace('/v1/v1/', '/v1/');
                    }

                    // 2. Inject publishers/google if missing for models endpoint on aiplatform
                    // If the user uses aiplatform.googleapis.com/v1 as base, SDK requests /v1/models/..., which fails on standard Vertex.
                    if (newUrl.includes('aiplatform.googleapis.com') && !newUrl.includes('publishers/google')) {
                         if (newUrl.includes('/v1/models/')) {
                             newUrl = newUrl.replace('/v1/models/', '/v1/publishers/google/models/');
                         }
                    }

                    // 3. Existing fix for when publishers/google is already in the path or proxy
                    if (newUrl.includes('/publishers/google/v1beta/models')) {
                        newUrl = newUrl.replace('/publishers/google/v1beta/models', '/publishers/google/models');
                    } else if (newUrl.includes('/publishers/google/v1/models')) {
                        // Just in case SDK bumps to v1 but appends to base, handle duplication if it occurs
                        newUrl = newUrl.replace('/publishers/google/v1/models', '/publishers/google/models');
                    }

                    // Heuristic fix: Double version duplication prevention for standard proxies
                    // If the user's proxy URL ends in /v1beta and the SDK path also starts with /v1beta,
                    // we might end up with .../v1beta/v1beta/... which causes 404s.
                    if (newUrl.includes('/v1beta/v1beta')) {
                        newUrl = newUrl.replace('/v1beta/v1beta', '/v1beta');
                    }
                    
                    // Handle double slashes (e.g., https://proxy.com//v1beta) that might occur from concatenation
                    // Preserve the double slash in https://
                    newUrl = newUrl.replace(/([^:]\/)\/+/g, "$1");

                    // logService.debug(`[NetworkInterceptor] Rerouting: ${urlStr} -> ${newUrl}`, { category: 'NETWORK' });

                    try {
                        if (originalRequest) {
                            // Clone the original request with the new URL
                            // We pass the original request as the second argument to preserve body/headers/signals
                            const newReq = new Request(newUrl, originalRequest);
                            return await originalFetch(newReq, init);
                        }
                        
                        return await originalFetch(newUrl, init);
                    } catch (fetchError) {
                        // Enhanced error logging for fetch failures
                        logService.error("[NetworkInterceptor] Fetch request failed after URL rewrite.", {
                            error: fetchError,
                            originalUrl: urlStr,
                            rewrittenUrl: newUrl,
                            proxyUrl: currentProxyUrl,
                            category: 'NETWORK'
                        });
                        
                        // Create detailed error message with troubleshooting info
                        // Sanitize URLs to avoid exposing credentials or API keys
                        const sanitizedProxyUrl = currentProxyUrl ? sanitizeUrlForDisplay(currentProxyUrl) : '[not configured]';
                        const sanitizedTargetUrl = sanitizeUrlForDisplay(newUrl);
                        const originalError = fetchError instanceof Error ? fetchError.message : String(fetchError);
                        
                        const errorDetails = [
                            `Network request failed. Original error: ${originalError}`,
                            ``,
                            `Proxy Configuration:`,
                            `  Proxy URL: ${sanitizedProxyUrl}`,
                            `  Target URL: ${sanitizedTargetUrl}`,
                            ``,
                            `Troubleshooting:`,
                            `  1. Verify proxy server is running and accessible`,
                            `  2. Check proxy URL format is correct (include protocol: http:// or https://)`,
                            `  3. Ensure proxy endpoint path matches your configuration`,
                            `  4. Check network connectivity and firewall settings`,
                            `  5. Verify CORS headers if using browser-based proxy`
                        ].join('\n');
                        
                        const enhancedError = new Error(errorDetails);
                        enhancedError.name = 'NetworkError';
                        throw enhancedError;
                    }
                } catch (e) {
                    // This catches URL rewriting errors, not fetch errors (those are caught above)
                    if (e instanceof Error && e.name === 'NetworkError') {
                        // Re-throw network errors from the inner catch
                        throw e;
                    }
                    logService.error("[NetworkInterceptor] Failed to rewrite URL. Falling back to original URL.", { 
                        error: e, 
                        originalUrl: urlStr,
                        category: 'NETWORK' 
                    });
                    // Fallback to original URL - this might still fail if proxy is misconfigured
                }
            }

            return originalFetch(input, init);
        };
        
        // Mark function to prevent double-wrapping
        (patchedFetch as any).__isAllModelChatInterceptor = true;
        
        try {
            window.fetch = patchedFetch;
        } catch (e) {
            // Handle environments where window.fetch is a getter-only property (e.g., CodeSandbox, some strict environments)
            try {
                Object.defineProperty(window, 'fetch', {
                    value: patchedFetch,
                    writable: true,
                    configurable: true
                });
            } catch (err) {
                console.error("[NetworkInterceptor] Critical: Failed to mount fetch interceptor.", err);
            }
        }
        
        logService.info("[NetworkInterceptor] Network interceptor mounted.", { category: 'SYSTEM' });
    }
};
