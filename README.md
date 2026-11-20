# Private Notes

Angular encrypts notes in the browser and authenticates with Firebase Google Sign-In. A Cloud Run API verifies a single authorized Firebase UID and stores the encrypted envelope in the private Cloud Storage bucket.

## Deploy API

Find the intended user's Firebase UID in Firebase Console → Authentication → Users. The API refuses to start without `ALLOWED_UID`.

In Google Cloud Shell, clone this repository and run the following from its root. Replace the UID placeholder and confirm the `notes-api` service account has bucket object read/write access:

```sh
gcloud run deploy notes-api --source backend --project project-451073f3-822e-4c9a-a60 --region us-east1 --service-account notes-api@project-451073f3-822e-4c9a-a60.iam.gserviceaccount.com --allow-unauthenticated --set-env-vars ALLOWED_UID=REPLACE_WITH_FIREBASE_UID
```

Set `API_URL` in `src/app/core/app-config.ts` to the resulting HTTPS Cloud Run URL (without a trailing slash), commit and push that change. GitHub Actions builds and deploys the frontend to GitHub Pages. Locally, build using `npm ci && npm run build -- --base-href /notes/`.

Cloud Run must be publicly invokable for browsers; Firebase ID token verification and the UID allowlist protect the API. Only encrypted envelopes are sent to the API. This project is not a HIPAA compliance claim.
