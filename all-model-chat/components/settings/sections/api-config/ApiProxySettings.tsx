
import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Sparkles, RotateCcw, ChevronDown, Info } from 'lucide-react';
import { Toggle } from '../../../shared/Toggle';
import { SETTINGS_INPUT_CLASS } from '../../../../constants/appConstants';

interface ApiProxySettingsProps {
    useApiProxy: boolean;
    setUseApiProxy: (value: boolean) => void;
    apiProxyUrl: string | null;
    setApiProxyUrl: (value: string | null) => void;
    t: (key: string) => string;
    language?: 'en' | 'zh' | 'system';
}

// Preset endpoints for common use cases
const PRESET_ENDPOINTS = [
    {
        id: 'default',
        name: { en: 'Google Default', zh: 'Google 默认' },
        url: 'https://generativelanguage.googleapis.com/v1beta',
        description: { en: 'Official Google Gemini API endpoint', zh: 'Google Gemini 官方 API 端点' }
    },
    {
        id: 'vertex',
        name: { en: 'Vertex AI', zh: 'Vertex AI' },
        url: 'https://aiplatform.googleapis.com/v1',
        description: { en: 'Google Cloud Vertex AI endpoint', zh: 'Google Cloud Vertex AI 端点' }
    },
    {
        id: 'proxy',
        name: { en: 'Example Proxy', zh: '示例代理' },
        url: 'https://api-proxy.de/gemini/v1beta',
        description: { en: 'Example third-party proxy server', zh: '示例第三方代理服务器' }
    }
];

export const ApiProxySettings: React.FC<ApiProxySettingsProps> = ({
    useApiProxy,
    setUseApiProxy,
    apiProxyUrl,
    setApiProxyUrl,
    t,
    language = 'en'
}) => {
    const [showPresets, setShowPresets] = useState(false);
    const inputBaseClasses = "w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-offset-0 text-sm custom-scrollbar font-mono";
    
    const defaultBaseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    const defaultProxyUrl = 'https://api-proxy.de/gemini/v1beta';
    const VERTEX_URL = "https://aiplatform.googleapis.com/v1";
    
    const isVertexExpressActive = useApiProxy && apiProxyUrl === VERTEX_URL;

    const handleSetVertexExpress = () => {
        if (isVertexExpressActive) {
            setUseApiProxy(false);
            setApiProxyUrl(defaultBaseUrl);
        } else {
            setUseApiProxy(true);
            setApiProxyUrl(VERTEX_URL);
        }
    };

    const handleResetProxy = () => {
        setApiProxyUrl(defaultProxyUrl);
    };

    const handleSelectPreset = (url: string) => {
        setApiProxyUrl(url);
        if (!useApiProxy) {
            setUseApiProxy(true);
        }
        setShowPresets(false);
    };

    const getProxyPlaceholder = () => {
        if (!useApiProxy) return 'Enable custom endpoint to set value';
        return 'e.g., https://api-proxy.de/gemini/v1beta';
    };

    const currentBaseUrl = apiProxyUrl?.trim() || defaultBaseUrl;
    const cleanBaseUrl = currentBaseUrl.replace(/\/+$/, '');
    const previewUrl = `${cleanBaseUrl}/models/gemini-2.5-flash:generateContent`;
    
    // Normalize language for preset labels: both 'system' and 'en' default to 'en'
    const displayLanguage: 'en' | 'zh' = language === 'zh' ? 'zh' : 'en';

    return (
        <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                    <label htmlFor="use-api-proxy-toggle" className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-tertiary)] cursor-pointer">
                        {t('apiConfig_customEndpoint')}
                    </label>
                    <button
                        type="button"
                        onClick={handleSetVertexExpress}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors border ${
                            isVertexExpressActive 
                                ? 'bg-[var(--theme-bg-accent)] text-[var(--theme-text-accent)] border-transparent' 
                                : 'text-[var(--theme-text-tertiary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-tertiary)] border-transparent hover:border-[var(--theme-border-secondary)]'
                        }`}
                        title={t('apiConfig_vertexExpress')}
                    >
                        <Sparkles size={10} strokeWidth={isVertexExpressActive ? 2 : 1.5} />
                        <span>{t('apiConfig_vertexExpress_btn')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleResetProxy}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors border text-[var(--theme-text-tertiary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-tertiary)] border-transparent hover:border-[var(--theme-border-secondary)]"
                        title="Reset to default"
                    >
                        <RotateCcw size={10} strokeWidth={1.5} />
                        <span>Reset</span>
                    </button>
                </div>
                <Toggle
                    id="use-api-proxy-toggle"
                    checked={useApiProxy}
                    onChange={(val) => {
                        setUseApiProxy(val);
                    }}
                />
            </div>
            
            {/* Help text explaining the feature */}
            <div className="flex gap-2 text-xs text-[var(--theme-text-tertiary)] bg-[var(--theme-bg-tertiary)]/30 p-2.5 rounded-lg border border-[var(--theme-border-secondary)]">
                <Info size={14} className="flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{t('apiConfig_customEndpoint_help')}</span>
            </div>
            
            <div className={`transition-all duration-200 ${useApiProxy ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="space-y-2">
                    {/* Preset endpoints dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowPresets(!showPresets)}
                            className="w-full flex items-center justify-between p-2 text-xs bg-[var(--theme-bg-tertiary)]/50 hover:bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-secondary)] rounded-lg transition-colors"
                        >
                            <span className="text-[var(--theme-text-secondary)]">{t('apiConfig_endpoint_examples')}</span>
                            <ChevronDown size={14} className={`text-[var(--theme-text-tertiary)] transition-transform ${showPresets ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showPresets && (
                            <div className="absolute z-10 w-full mt-1 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-secondary)] rounded-lg shadow-lg overflow-hidden">
                                {PRESET_ENDPOINTS.map((preset) => (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => handleSelectPreset(preset.url)}
                                        className="w-full text-left p-3 hover:bg-[var(--theme-bg-tertiary)] transition-colors border-b border-[var(--theme-border-secondary)] last:border-b-0"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-[var(--theme-text-primary)]">{preset.name[displayLanguage]}</span>
                                            {apiProxyUrl === preset.url && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--theme-bg-accent)]/20 text-[var(--theme-text-accent)]">
                                                    {displayLanguage === 'zh' ? '当前' : 'Active'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-[var(--theme-text-tertiary)] mb-1">{preset.description[displayLanguage]}</div>
                                        <code className="text-[10px] font-mono text-[var(--theme-text-secondary)] break-all">{preset.url}</code>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <input
                        id="api-proxy-url-input"
                        type="text"
                        value={apiProxyUrl || ''}
                        onChange={(e) => setApiProxyUrl(e.target.value)}
                        className={`${inputBaseClasses} ${SETTINGS_INPUT_CLASS}`}
                        placeholder={getProxyPlaceholder()}
                        aria-label="API Proxy URL"
                    />
                </div>
                
                <div className="mt-3 p-3 rounded-lg bg-[var(--theme-bg-tertiary)]/30 border border-[var(--theme-border-secondary)]">
                    <div className="flex gap-2 text-xs text-[var(--theme-text-tertiary)] mb-1.5">
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span>Preview of actual request URL:</span>
                    </div>
                    <div className="flex items-start gap-2 pl-5">
                        <ArrowRight size={12} className="mt-1 text-[var(--theme-text-tertiary)]" />
                        <code className="font-mono text-[11px] text-[var(--theme-text-primary)] break-all leading-relaxed">
                            {previewUrl}
                        </code>
                    </div>
                </div>
            </div>
        </div>
    );
};
