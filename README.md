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

Update the name, introduction, skills, contact details, and social links in `index.html`. The Projects section includes all 19 public, non-fork GitHub repositories on the account (excluding this portfolio) as of November 2026. Each card links to its source repository; a live-demo button is shown only when the demo is publicly accessible. Update `projects.json` when adding or changing projects.

## Publish the responsive portfolio on GitHub Pages

1. Open this repository's **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select the `main` branch and the `/(root)` folder, then save.
4. Open the published URL shown in the Pages settings.

The static site loads project cards from `projects.json`. GitHub Pages cannot run the Express backend, so the contact form is disabled there.

## Deploy the full-stack site to Render

This repository includes a `render.yaml` Blueprint. Sign in to Render, create a **New Blueprint Instance**, and connect this GitHub repository. Review the service and persistent-disk plan before deploying; Render may charge for a web service with persistent storage. The disk keeps SQLite data between restarts.

The app serves both the frontend and API from one Render URL. Use this option if you want the contact form to submit messages.

## API

- `GET /api/health` — deployment health check
- `GET /api/projects` — portfolio projects
- `POST /api/contact` — store a message (`name`, `email`, and `message` as JSON)
