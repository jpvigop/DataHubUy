# DataHubUy

DataHubUy is a Next.js application for browsing Uruguay's national open data catalog and previewing datastore-backed resources directly in the browser.

Production URL: [https://datahubuy-nu.vercel.app/](https://datahubuy-nu.vercel.app/)

The old `https://urudata-nu.vercel.app/` domain is no longer the active production URL.

## Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Chart.js
- Vercel Hobby

## Runtime Baseline

- Node.js `22.x`
- npm `10.9.2`

You can load the project version with:

```bash
nvm use
```

## Local Development

```bash
git clone https://github.com/jpvigop/DataHubUy.git
cd DataHubUy
npm ci
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

## Architecture Notes

- The catalog page is server-rendered and fetches CKAN data on the server with Next.js revalidation.
- `/api/datastore` is the browser-facing preview proxy for datastore records.
- `/api/datasets` is kept as a compatibility endpoint, but the application no longer relies on it for the main page.
- The app currently does not require custom runtime environment variables.

## Deployment Notes

- Primary host: Vercel Hobby
- Main branch: `master`
- Build command: `npm run build`
- Start command: `npm run start`

If the Vercel project ever needs to be recreated, point it at this repository root with the default Next.js settings.

## Data Source

Data comes from Uruguay's CKAN catalog:

- Base API: [https://catalogodatos.gub.uy/api/3/action](https://catalogodatos.gub.uy/api/3/action)

## Quality Gates

GitHub Actions runs:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

## License

MIT. See [LICENSE](./LICENSE).
