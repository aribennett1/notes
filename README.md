# Private Notes MVP

Angular client that encrypts notes in the browser and stores only encrypted envelopes in Google Cloud Storage. The client uses Argon2id to derive a key-encryption key and AES-256-GCM with fresh random nonces for key wrapping and workspace encryption.

## Run

Install dependencies with `npm install`, then run `npm start`. Set `GOOGLE_OAUTH_CLIENT_ID` in `src/app/core/app-config.ts` to the public OAuth web-client ID. Configure an authorized JavaScript origin of `https://aribennett1.github.io` (plus localhost for development). Tokens remain only in memory.

## Deployment notes

Enable uniform bucket-level access, public access prevention, versioning, and lifecycle rules on `bennett-notes-storage`. Grant the intended Google user Storage Object User access. Set bucket CORS for `https://aribennett1.github.io`, headers `Authorization, Content-Type`, and methods `GET, POST, PUT, HEAD`. Build for Pages with `npm run build -- --base-href /notes/`. GitHub Pages runs public JavaScript, so XSS or a compromised deployment can expose unlocked notes; this is not a HIPAA-compliance claim.
