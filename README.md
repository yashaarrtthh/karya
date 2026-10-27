# Karya

Karya is a worker-first workforce management prototype designed for the Prompt Wars 2026 challenge. It helps workers understand daily hours and pay, report unsafe conditions, and track skills, while giving employers a clear overview of workforce conditions across two industries: construction and college facilities.

**Work fairly. Work safely. Know your worth.**

## Problem statement

Many workers, especially in time-sensitive and physically demanding roles, are not fully aware of how their hours translate into pay, how safety concerns are being handled, or when fatigue and overtime are building up. Employers often lack a clear, consistent view of workforce conditions without relying on fragmented spreadsheets or verbal updates.

## Proposed solution

Karya combines a simple worker dashboard, transparent pay breakdowns, safety reporting tools, fatigue indicators, and an employer dashboard into one accessible prototype. The application is designed to be easy to demo, mobile-friendly, and multilingual so it maps to real-world operational use without requiring a backend at prototype stage.

## Why the problem matters

The challenge is directly aligned with UN Sustainable Development Goal 8: Decent Work and Economic Growth. Responsible workforce management means clearer shifts, safer sites, better pay transparency, and stronger operational visibility for both labour and management.

## Features implemented

- Worker dashboard with shift start/end simulation, history tracking, and overtime display
- Transparent salary breakdown with regular vs overtime calculations
- Safety reporting form with validation and admin-side review
- Admin dashboard for workforce metrics, report status changes, and anonymous feedback review
- Industry switching between construction and college facilities
- Multilingual interface support for English, Hindi, and Tamil
- Browser-local persistence with seeded demo data and a reset action
- Fatigue indicator logic based on configurable thresholds
- Mobile-responsive, accessibility-conscious UI

## Worker interface

The worker experience includes:

- current shift and clock-in/out actions
- hours worked and overtime calculations
- estimated earnings summary
- recent safety reports and workplace notices
- skill passport overview
- fatigue messages based on configured rules

## Employer / admin interface

The employer dashboard includes:

- total workers, active workers, total recorded hours, and payroll overview
- open safety reports and status management
- searchable workforce table
- anonymous feedback summaries
- safety and fatigue indicators by industry

## Construction use case

Construction teams can use the dashboard to track long shifts, monitor overtime concentration, and quickly escalate hazards such as equipment or environmental risks before they become incidents.

## College facilities use case

Facilities teams can manage maintenance and campus operations, track rest and shift coverage, and review safety issues like infrastructure concerns and access hazards.

## Architecture

The prototype uses a lightweight React + Vite front-end with modular business logic for:

- shift calculations
- payroll calculations
- fatigue detection
- safety report validation
- localStorage persistence
- translation dictionaries

## Technology stack

- React
- Vite
- JavaScript
- Lucide icons
- React Router
- Vitest + Testing Library
- Docker
- Nginx for static production serving

## Local installation

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite in the terminal.

## Testing

```bash
npm run lint
npm run test -- --run
npm run build
```

## Docker build

```bash
docker build -t karya .
docker run --rm -p 8080:8080 karya
```

Then visit http://localhost:8080.

## Google Cloud Run deployment

1. Install the Google Cloud CLI and log in:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

2. Build and push the image:

```bash
docker build -t gcr.io/YOUR_PROJECT_ID/karya .
docker push gcr.io/YOUR_PROJECT_ID/karya
```

3. Deploy to Cloud Run:

```bash
gcloud run deploy karya \
  --image gcr.io/YOUR_PROJECT_ID/karya \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

4. Confirm the service URL in the terminal output.

## Demo limitations

This is a front-end prototype built for demonstration. It intentionally stores data in browser localStorage and does not represent secure production authentication or multi-user, synchronized workforce storage.

## Security considerations

- no secrets or API keys committed to the repository
- browser data remains local and demo-only
- production authentication and server-side authorization would be required before real employee data is used
- the app avoids false claims of secure identity or enterprise-grade data protection

## SDG 8 alignment

The prototype is designed to support decent work by improving:

- pay transparency
- fatigue awareness
- safety reporting
- better operational decision-making
- equitable access to workforce information

## Future improvements

- backend API and real authentication
- role-based authorization
- persistent data storage with database integration
- live analytics and historical reporting
- stronger compliance workflows and safety escalation rules

## Final notes

This project is intentionally focused on the official challenge and demonstrates working user flows, multilingual access, and persistent demo data in a realistic workforce-management setting.
