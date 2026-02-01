# API Endpoint Customization Guide
# API 端点自定义指南

## Overview / 概述

All Model Chat allows you to customize the Gemini API endpoint that the SDK uses for requests. This feature enables you to:

All Model Chat 允许您自定义 SDK 用于请求的 Gemini API 端点。此功能使您能够：

- Use proxy servers / 使用代理服务器
- Access regional mirrors / 访问区域镜像
- Route traffic through custom endpoints / 通过自定义端点路由流量
- Use Vertex AI instead of the standard Gemini API / 使用 Vertex AI 而非标准 Gemini API

## How It Works / 工作原理

The application uses two complementary mechanisms to modify the API endpoint:

应用程序使用两种互补机制来修改 API 端点：

1. **SDK Native BaseURL Support**: The `@google/genai` SDK supports a `baseUrl` configuration parameter that allows changing the API endpoint directly.
   
   **SDK 原生 BaseURL 支持**：`@google/genai` SDK 支持 `baseUrl` 配置参数，允许直接更改 API 端点。

2. **Network Interceptor**: A custom fetch interceptor that rewrites URLs for additional flexibility and compatibility with various proxy configurations.
   
   **网络拦截器**：自定义 fetch 拦截器，用于重写 URL，以提供额外的灵活性和与各种代理配置的兼容性。

## Configuration / 配置

### Via Settings UI / 通过设置界面

1. Open Settings (⚙️) / 打开设置 (⚙️)
2. Navigate to "API Configuration" section / 导航到"API 配置"部分
3. Enable "Use Custom API Configuration" / 启用"使用自定义 API 配置"
4. Enable "Custom API Endpoint" toggle / 启用"自定义 API 端点"开关
5. Choose from preset endpoints or enter your custom URL / 从预设端点中选择或输入自定义 URL

### Preset Endpoints / 预设端点

The application provides quick access to common endpoints:

应用程序提供对常用端点的快速访问：

| Preset Name | URL | Description |
|------------|-----|-------------|
| Google Default<br>Google 默认 | `https://generativelanguage.googleapis.com/v1beta` | Official Google Gemini API<br>Google Gemini 官方 API |
| Vertex AI | `https://aiplatform.googleapis.com/v1` | Google Cloud Vertex AI<br>谷歌云 Vertex AI |
| Example Proxy<br>示例代理 | `https://api-proxy.de/gemini/v1beta` | Example third-party proxy (placeholder URL)<br>示例第三方代理（占位符 URL）|

### Custom Endpoint Format / 自定义端点格式

When entering a custom endpoint, use the following format:

输入自定义端点时，请使用以下格式：

```
https://your-proxy-domain.com/path/to/api
```

**Important Notes / 重要说明:**

- Include the protocol (`https://` or `http://`) / 包含协议（`https://` 或 `http://`）
- Do not include a trailing slash / 不要包含末尾斜杠
- The path should point to the API base, not including `/models/...` / 路径应指向 API 基础，不包括 `/models/...`

**Example / 示例:**
```
✓ Correct: https://api.example.com/gemini/v1beta
✗ Wrong: https://api.example.com/gemini/v1beta/
✗ Wrong: api.example.com/gemini/v1beta (missing protocol)
```

## Use Cases / 使用场景

### 1. Using a Proxy Server / 使用代理服务器

If you're in a region where Google APIs are restricted, you can use a proxy server:

如果您所在的地区限制访问 Google API，您可以使用代理服务器：

1. Set up or obtain access to a proxy server
2. Enter the proxy URL in the custom endpoint field
3. Enable the custom endpoint toggle

### 2. Using Vertex AI / 使用 Vertex AI

Vertex AI offers additional features and regional availability:

Vertex AI 提供额外功能和区域可用性：

1. Click the "Vertex Express" button for quick setup
2. Or manually enter: `https://aiplatform.googleapis.com/v1`
3. Ensure your API key is configured for Vertex AI access

### 3. Regional Mirrors / 区域镜像

Some providers offer regional mirrors for better performance:

某些提供商提供区域镜像以获得更好的性能：

1. Obtain the mirror URL from your provider
2. Enter it as a custom endpoint
3. Test the connection before use

## Testing the Connection / 测试连接

After configuring your custom endpoint:

配置自定义端点后：

1. Click the "Test Connection" button / 点击"测试连通性"按钮
2. The application will attempt a simple API call / 应用程序将尝试简单的 API 调用
3. Check the result:
   - ✓ Green checkmark: Connection successful / 连接成功
   - ✗ Red X: Connection failed (check the error message) / 连接失败（查看错误消息）

## Technical Details / 技术详情

### Implementation Files / 实现文件

- **SDK Configuration**: `/services/api/baseApi.ts`
  - `getClient()` function accepts `baseUrl` parameter
  - Passed to `GoogleGenAI` constructor
  
- **Network Interceptor**: `/services/networkInterceptor.ts`
  - Intercepts fetch requests to `generativelanguage.googleapis.com`
  - Rewrites URLs to the configured proxy
  - Handles special cases for Vertex AI path formatting

- **UI Components**: `/components/settings/sections/api-config/ApiProxySettings.tsx`
  - Settings interface for endpoint configuration
  - Preset selector dropdown
  - URL preview

### URL Rewriting Examples / URL 重写示例

When custom endpoint is configured, URLs are transformed:

配置自定义端点时，URL 将被转换：

**Original Request / 原始请求:**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

**With Custom Endpoint / 使用自定义端点:**
```
https://your-proxy.com/api/models/gemini-2.5-flash:generateContent
```

## Troubleshooting / 故障排除

### Connection Test Fails / 连接测试失败

1. **Check URL Format**: Ensure the URL includes protocol and has no trailing slash
   
   **检查 URL 格式**：确保 URL 包含协议且末尾没有斜杠

2. **Verify Proxy Server**: Ensure your proxy server is running and accessible
   
   **验证代理服务器**：确保代理服务器正在运行且可访问

3. **Check CORS**: Browser-based proxies must support CORS headers
   
   **检查 CORS**：基于浏览器的代理必须支持 CORS 头

4. **API Key Compatibility**: Ensure your API key works with the chosen endpoint
   
   **API 密钥兼容性**：确保您的 API 密钥与所选端点兼容

### Requests Still Go to Google / 请求仍然发送到 Google

1. Ensure "Custom API Endpoint" toggle is **enabled**
   
   确保"自定义 API 端点"开关已**启用**

2. Ensure "Use Custom API Configuration" is enabled
   
   确保"使用自定义 API 配置"已启用

3. Check browser console for interceptor mount messages
   
   检查浏览器控制台是否有拦截器挂载消息

### Vertex AI Path Issues / Vertex AI 路径问题

The network interceptor includes special handling for Vertex AI paths. If you encounter issues:

网络拦截器包含对 Vertex AI 路径的特殊处理。如果遇到问题：

1. Use the "Vertex Express" quick setup button
2. Ensure the URL is exactly: `https://aiplatform.googleapis.com/v1`
3. Check that your API key has Vertex AI permissions

## Security Considerations / 安全注意事项

When using custom endpoints:

使用自定义端点时：

- **Trust**: Only use endpoints from trusted sources / 只使用来自可信来源的端点
- **HTTPS**: Always use HTTPS for secure communication / 始终使用 HTTPS 进行安全通信
- **API Keys**: Your API keys are sent to the custom endpoint / 您的 API 密钥会发送到自定义端点
- **Data Privacy**: All chat data passes through the custom endpoint / 所有聊天数据都通过自定义端点传递

## FAQ / 常见问题

### Q: Can I use multiple endpoints for different models? / 我可以为不同模型使用多个端点吗？

A: Currently, the application uses one endpoint for all models. Multi-endpoint support may be added in the future.

答：目前，应用程序为所有模型使用一个端点。未来可能会添加多端点支持。

### Q: Does this work with the Live API (audio/video)? / 这适用于 Live API（音频/视频）吗？

A: Yes, the network interceptor handles all API requests, including Live API WebSocket connections.

答：是的，网络拦截器处理所有 API 请求，包括 Live API WebSocket 连接。

### Q: Will my settings be saved? / 我的设置会被保存吗？

A: Yes, all settings including custom endpoints are saved in your browser's IndexedDB and persist across sessions.

答：是的，所有设置（包括自定义端点）都保存在浏览器的 IndexedDB 中，并在会话之间保持。

## Support / 支持

If you encounter issues with API endpoint customization:

如果您在 API 端点自定义方面遇到问题：

1. Check this documentation / 查看此文档
2. Review browser console for error messages / 查看浏览器控制台的错误消息
3. Open an issue on GitHub with details / 在 GitHub 上提交包含详细信息的问题
4. Include your configuration (without API keys) / 包含您的配置（不含 API 密钥）
