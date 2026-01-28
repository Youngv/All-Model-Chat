/**
 * Utility functions for error handling
 */

/**
 * Check if an error is a network-related error.
 * This includes:
 * - NetworkError (wrapped by network interceptor)
 * - TypeError with "Load failed" (raw fetch error)
 * 
 * @param error - The error to check
 * @returns true if the error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
    if (!(error instanceof Error)) {
        return false;
    }
    
    return error.name === 'NetworkError' || 
           (error instanceof TypeError && error.message.includes('Load failed'));
};

/**
 * Create a standardized network error with a helpful message.
 * 
 * @param contextMessage - Context-specific message (e.g., "File upload failed")
 * @param originalError - The original error for debugging
 * @returns A NetworkError with helpful message
 */
export const createNetworkError = (contextMessage: string, originalError?: unknown): Error => {
    const errorMessage = originalError instanceof Error 
        ? `${contextMessage} Original error: ${originalError.message}`
        : contextMessage;
    
    const networkError = new Error(errorMessage);
    networkError.name = 'NetworkError';
    return networkError;
};
