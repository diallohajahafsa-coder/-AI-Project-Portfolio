# AI Project Portfolio

A responsive full-stack portfolio. The frontend is served by an Express backend, which provides a projects API and saves contact form submissions in SQLite.

**GitHub account:** [@diallohajahafsa-coder](https://github.com/diallohajahafsa-coder)

**Project repository:** [AI Project Portfolio](https://github.com/diallohajahafsa-coder/-AI-Project-Portfolio)

## Run locally

1. Install Node.js 22.13 or newer.
2. From this folder, run `npm install`.
3. Run `npm start`.
4. Open [http://localhost:3000](http://localhost:3000).

The local database is created at `data/portfolio.db`. Project data is refreshed from `server.js` at startup. Contact messages are validated, rate-limited, and stored on the server; they are not emailed automatically.

## Test

Run `npm test` to exercise the projects API and contact form endpoint.

## Personalize the portfolio

Update the name, introduction, skills, contact details, and social links in `index.html`. The Projects section includes all 19 public, non-fork GitHub repositories on the account (excluding this portfolio) as of November 2026. Each card links to its source repository; a live-demo button is shown only when the demo is publicly accessible. Update `projectSeeds` in `server.js` when adding or changing projects.

## Deploy the full-stack site to Render

This repository includes a `render.yaml` Blueprint. Sign in to Render, create a **New Blueprint Instance**, and connect this GitHub repository. Review the service and persistent-disk plan before deploying; Render may charge for a web service with persistent storage. The disk keeps SQLite data between restarts.

The app serves both the frontend and API from one Render URL. GitHub Pages can only host static frontend files and cannot run this backend. If Pages is enabled, the contact form and live projects API will require the backend to be separately hosted and configured.

## API

- `GET /api/health` — deployment health check
- `GET /api/projects` — portfolio projects
- `POST /api/contact` — store a message (`name`, `email`, and `message` as JSON)
