# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Container image

Images are published to GHCR as `ghcr.io/youngv/all-model-chat:latest`. Run with:
`docker run -p 4173:80 ghcr.io/youngv/all-model-chat:latest`
