# Private Notes MVP

Angular client plus a Cloud Run API that only reads and writes opaque encrypted envelopes. The client uses Argon2id to derive a key-encryption key and AES-256-GCM with fresh random nonces for key wrapping and workspace encryption.

## Run

Install dependencies with `npm install`, then run `npm start`. The backend requires `WORKSPACE_BUCKET`, `IDENTITY_AUDIENCE`, and `ALLOWED_ORIGINS`; run it with `npm run api` (or from `backend`, `npm start`). Google authentication wiring is intentionally environment-configured and must be completed with the approved Identity Platform client configuration.

## Deployment notes

Enable uniform bucket-level access, public access prevention, versioning, and lifecycle rules on the bucket. Give the Cloud Run service account only object read/write access to that bucket. Set a strict CSP and GitHub Pages path base before deploy. This repository is not a HIPAA-compliance claim.
