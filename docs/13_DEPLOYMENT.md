# Deployment and Operations

## MVP

Static frontend deployment is sufficient. No Python backend, database, secret, or external ML API is required. The production output is `dist/`. No hosting provider, custom domain, or CI deployment workflow is currently configured, so a public deployment has not been verified.

## Development commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

Use `npm ci` in CI, commit the lockfile, document the supported Node.js version, and pin toolchain versions as appropriate.

## Static hosting

Configure the chosen static host to run `npm ci` and `npm run build`, and publish `dist/`. No environment variables are required. Use the host's default HTTPS and immutable asset caching; serve `index.html` as the site entry point. Before public release, connect the repository to the host, validate its build from a clean checkout, then check the deployed URL and primary student workflow. Record the provider, URL, and release revision in `docs/20_PHASE6_RELEASE.md`.

## CI steps

1. Install dependencies from lockfile.
2. Lint and type-check.
3. Run deterministic unit tests.
4. Build for production.
5. Run browser-flow tests when configured.
6. Run dependency/security audit according to maintenance policy.

## Runtime performance

Profile point addition, model run, and boundary redraw on a lower-powered laptop. Use a Web Worker for larger supported data sizes if needed. Keep a documented point/grid limit so users do not accidentally lock the browser.

## Data and privacy

If no telemetry or backend is integrated, say so in the app's privacy note. If error reporting is later added, avoid capturing point-level experiment data, user-entered text, or browser identifiers unless a reviewed purpose and notice justify it.

## Rollback

Deploy from tagged releases and retain the previous static build. If a model or metric bug reaches production, roll back and invalidate affected experiment result caches by algorithm version.
