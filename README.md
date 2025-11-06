# Amdox Website

Lightweight certificate management + job-portal demo application (Node/Express + MongoDB backend, React + Vite frontend).

This README explains how to access, run and test the project, and documents the main work that was done while building it.

## Quick overview
- Backend: Node.js + Express, Mongoose (MongoDB). JWT auth, role-based access (jobseeker, employer, admin). Resume uploads via multer. Static serving for uploaded files.
- Frontend: React + Vite. AuthContext for token/user, pages for jobs, applications, profile, certificate upload/verify.

## Prerequisites
- Node.js (v16+ recommended)
- npm
- MongoDB (local or Atlas)

## Environment variables
Create a `.env` file in the `Server` folder (do NOT commit it). Typical vars:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/amdocs
JWT_SECRET=your_jwt_secret
```

Adjust values to match your environment (Atlas connection string if using cloud DB).

## How to run (local development)

1) Start the backend

```powershell
cd "D:\Amdox Website\Server"
npm install
npm run dev
```

The server listens on `http://localhost:5000` by default (see `Server/src/index.js`). Uploaded files are served under `http://localhost:5000/uploads/...`.

2) Start the frontend

```powershell
cd "D:\Amdox Website\Client"
npm install
npm run dev
```

The Vite dev server typically serves the app at `http://localhost:5173` (it may pick a nearby port if 5173 is busy).

3) Open the app in the browser

- Public pages: `/` (home), `/jobs` (browse)
- Authenticated pages (login required): `/profile`, `/jobs/:jobId/apply`, `/jobs/:jobId/applications` (employer only)

## Useful endpoints (backend)
- POST /api/auth/register — register (include `role`: "jobseeker" | "employer" | "admin")
- POST /api/auth/login — login
- GET /api/me — get current user (protected)
- POST /api/jobs — create job (employer only)
- GET /api/jobs — list open jobs
- GET /api/jobs/:jobId/applications — employer: applications for a job
- POST /api/jobs/:jobId/apply — jobseeker apply (multipart/form-data with `resume`)

## What was implemented (short)
- Authentication (JWT) + AuthContext on the client.
- Role-based flows: jobseeker, employer, admin where relevant.
- Job portal: create/list jobs, apply with resume upload, employer view applications and update statuses.
- Resume uploads handled by `multer` and stored under `Server/uploads/resumes`. Server serves `/uploads` statically.
- Certificate import + PDF generation endpoints (admin flows) and a public certificate verification endpoint.
- Security middleware: Helmet and basic rate limiting applied on the server.
- Client UX improvements: demo sample jobs when DB empty, guarded profile fetch, profile edit form, and CreateJob `company` fix.

## Notes about Git / pushing
- `.gitignore` already updated to ignore `node_modules/`, `**/node_modules/`, `.env`, `Server/uploads`, and common noise files. If `node_modules` or uploads were previously tracked, they were removed from the git index (kept locally) and committed.
- If you need to remove large files from the repository history, use `git filter-repo` or the BFG Repo Cleaner (advanced; requires force-push).

## Troubleshooting
- If the frontend can't load resume files, ensure the backend is running and `Server/uploads` files exist. Resume links are served from `http://localhost:5000/uploads/resumes/<filename>`.
- If `npm run dev` errors on the server: ensure required packages are installed (`multer`, `puppeteer`, `helmet`, etc.) and that port 5000 is not used by another process.
- If `git push` is rejected: fetch/pull remote branch first, resolve conflicts, then push. A `local-backup` branch was created automatically in case of merge conflicts.

## Next steps / enhancements
- Seed demo data (jobs & applications) for smoother testing.
- Add server-side endpoint that returns absolute resume URLs so clients don't need to prefix the backend origin.
- Add tests for core flows (auth, job apply, certificate import/generation).
- Harden file size/type checks, add virus scanning for uploads, and add monitoring/logging for imports.

---

If you want, I can:
- create a small seed script to insert sample jobs and sample applications (with a sample resume file) so you can exercise the flow immediately, or
- rewrite the README with more step-by-step screenshots and sample API curl commands.

One-line contact: to run anything for you locally (git commands, seed insertion, or push helper), tell me and I'll run them.
# Amdox-Website