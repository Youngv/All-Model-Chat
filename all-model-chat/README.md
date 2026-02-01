# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Features

### Custom API Endpoint Configuration

You can customize the Gemini API endpoint address that the SDK uses. This allows you to:
- Use proxy servers for restricted regions
- Route through custom endpoints  
- Use Vertex AI instead of standard Gemini API
- Access regional mirrors

**For detailed instructions, see [API Endpoint Customization Guide](docs/API_ENDPOINT_CUSTOMIZATION.md)**

**Quick Setup:**
1. Open Settings → API Configuration
2. Enable "Use Custom API Configuration"
3. Enable "Custom API Endpoint"
4. Select from presets or enter your custom URL

支持自定义 Gemini API 端点地址。详细说明请参阅 [API 端点自定义指南](docs/API_ENDPOINT_CUSTOMIZATION.md)。
