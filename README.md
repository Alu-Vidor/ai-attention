# AI Attention Vite App

This repository contains a minimal [Vite](https://vite.dev/) + [React](https://react.dev/) project that is pre-configured for hosting on GitHub Pages.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (bundled with npm).

## Available scripts

```bash
npm install       # Install dependencies
npm run dev       # Start a local dev server with hot module replacement
npm run lint      # Run ESLint against the project
npm run build     # Create a production build in the dist directory
npm run preview   # Preview the production build locally
npm run deploy    # Publish the dist directory to GitHub Pages
```

## GitHub Pages deployment

1. Make sure the repository is published on GitHub and you have pushed the latest changes.
2. On GitHub, enable GitHub Pages for the `gh-pages` branch in the repository settings (`Settings` → `Pages`).
3. Deploy using the built-in script:
   ```bash
   npm run deploy
   ```

During the build step the Vite configuration automatically sets the correct `base` URL when the `GITHUB_REPOSITORY` environment variable is available (as it is in GitHub Actions). When running locally the app falls back to the root path (`/`).

If you need to deploy from a GitHub Action workflow, use the `GITHUB_REPOSITORY` environment variable or set `BASE_URL` manually before running `npm run build`.

## Project structure

```
├── public/           # Static assets copied as-is to the build output
├── src/              # React source code
│   ├── assets/       # Static assets imported through JavaScript/TypeScript
│   ├── App.jsx       # Main application component
│   ├── index.css     # Global styles
│   └── main.jsx      # Application entry point
├── index.html        # Root HTML template used by Vite
├── vite.config.js    # Vite configuration (includes GitHub Pages base path)
└── package.json      # npm scripts and dependencies
```

You are now ready to extend the application and deploy it to GitHub Pages whenever you're ready.
