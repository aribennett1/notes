# Security & HIPAA Compliance Documentation

**Application:** Private Notes  
**Version:** 1.0  
**Effective date:** November 20, 2026  
**Scope:** Single-user clinical notes application

## 1. Purpose

Private Notes is designed for confidential creation, storage, and retrieval of clinical notes. This document describes its security architecture, safeguards, risks, and operational procedures. It supports, but does not establish, compliance with applicable HIPAA requirements. Compliance depends on technical, administrative, and physical safeguards and the circumstances of use; this document is not a certification or independent assessment.

## 2. System architecture

- **Frontend:** Angular application hosted on GitHub Pages.
- **Authentication:** Google sign-in through Firebase Authentication, with a persistent browser session.
- **Backend:** Node.js API on Google Cloud Run.
- **Cloud storage:** A private Google Cloud Storage bucket containing one encrypted workspace object.
- **Local storage:** An encrypted workspace cache and synchronization metadata in browser IndexedDB.
- **Encryption:** Browser-side AES-256-GCM, with an Argon2id-derived password key.

The browser encrypts the workspace before sending it to the API. The API handles encrypted envelopes and does not need the encryption password or plaintext notes. Plaintext is present in browser memory and the interface while the workspace is unlocked; imported source files also remain wherever the user stored them.

A Google Cloud Business Associate Agreement (BAA) has been accepted. The operator must ensure that each service used for electronic protected health information is covered by the applicable agreement and configured appropriately. GitHub Pages delivers the frontend code; its suitability for this use requires risk assessment because compromised frontend code could expose unlocked information.

## 3. Authentication and access control

The intended deployment has one authorized clinical user. Firebase Authentication establishes the Google identity; the API verifies Firebase ID tokens and checks the token UID against one configured authorized UID. Missing or invalid tokens and other identities are rejected. The API uses its Cloud Run service identity to access the bucket.

The encryption password is separate from Google sign-in. Google OAuth credentials authenticate the user but cannot decrypt the notes or recover the encryption password. A restored authentication session does not itself decrypt the workspace. Sharing and multi-user clinical access are not supported. Protect the Google account and administrative accounts with appropriate access controls and multifactor authentication.

## 4. Encryption and data protection

The browser generates a random AES-256 data-encryption key, encrypts the workspace with AES-GCM, and wraps that key with an Argon2id-derived password key using AES-GCM. Random salts and nonces and the encrypted key are stored in the versioned envelope. The application does not intentionally transmit plaintext client names, note contents, or the encryption password to the API or Cloud Storage, or log them in application logs.

The API uses Cloud Storage generation preconditions for writes. A mismatched generation is rejected instead of blindly overwriting a newer object. The frontend retains encrypted local and remote copies when it detects a conflict; conflict resolution and recovery procedures require operational attention. Encryption does not protect information displayed in an unlocked or compromised browser.

## 5. Security risk assessment

| Risk | Safeguard or response |
|---|---|
| Unauthorized API access | Firebase token verification and a single configured UID |
| Exposure of cloud-stored notes | Client-side authenticated encryption |
| Compromised Google account | A separate encryption password is needed to decrypt the workspace |
| Concurrent overwrite | Generation-based conditional writes and conflict detection |
| Accidental cloud-object deletion | Seven-day Cloud Storage soft deletion |
| Device loss or failure | Encrypted cloud copy can support restoration on another suitable device |
| Permanently lost encryption password and no usable password or key copy | Encrypted notes cannot be recovered; protect access to the encryption password |
| Internet or service interruption | Encrypted local cache where available; secure paper documentation as a contingency |
| Unauthorized physical access | Device security, session locking, and physical safeguards |
| Compromised frontend or browser | Protect GitHub and deployment access, review dependencies, and use trusted devices; assess hosting risks |

This table is not a complete HIPAA Security Rule risk analysis. The [application-specific risk assessment](hipaa-security-risk-assessment.md) records preliminary ratings and recommended actions; responsible-user review and risk acceptance remain pending. Review risks and safeguards when the application, infrastructure, or intended use changes. The adequacy and operation of each control must be evaluated as part of the organization's risk management process.

## 6. Backup and recovery

The encrypted workspace is stored in Cloud Storage, and an encrypted cache may also be retained in IndexedDB. The bucket has seven-day soft deletion enabled. The application does not provide a separate recovery key or password-recovery mechanism.

To recover after device failure, use a suitable device, authenticate as the authorized user, retrieve an intact encrypted workspace, and supply the encryption password. For an accidentally deleted cloud object, an authorized administrator can use the bucket's applicable soft-delete recovery procedure. Verify the restored object and decrypt it in the browser.

Cloud backups and soft deletion restore encrypted data; they cannot decrypt it or recover a lost password. If the encryption password is permanently lost and no usable copy of the password or encryption key remains, the encrypted notes cannot be recovered. This is a known data-availability consequence of client-side encryption, not an application malfunction. Periodic restoration testing is required; completion of such testing has not been confirmed here. See [Cloud Storage soft delete](https://cloud.google.com/storage/docs/soft-delete).

## 7. Emergency and contingency procedures

During an outage or device failure, the clinical user may use temporary paper documentation, kept confidential and physically secure. When access is restored, enter relevant information into Private Notes as appropriate. Handle and dispose of temporary copies securely, consistent with applicable record-retention obligations. Maintain and periodically review the contingency and restoration procedures.

## 8. Audit controls and logging

On November 20, 2026, Cloud Run request logging for `notes-api` was verified in Google Cloud Logs Explorer. Hundreds of log entries were observed, including successful `PUT /notes` requests. Logs include timestamps, HTTP methods, request URLs, response status codes, request durations, and available request metadata such as user agents. Protected API operations require Firebase ID-token verification and authorization against the configured single-user UID.

Audit logging operates at the API request level without recording plaintext clinical information. Notes are encrypted client-side, and the backend does not have access to individual patient records or note contents. Request logs do not identify individual patient changes or conclusively establish the identity of the person making a request.

If unauthorized access or suspicious activity is suspected, the operator will examine Cloud Run request logs in Logs Explorer, comparing timestamps, user agents, IP addresses where available, and request patterns with expected use. The operator will investigate suspicious activity and take appropriate account or system security measures. Log retention settings, the operation of this review procedure in practice, and the adequacy of the controls for applicable requirements have not been independently confirmed.

## 9. Device and operational security

Protect Google and encryption credentials; secure devices against unauthorized access; lock unattended devices and the application; avoid untrusted or public devices; and prevent unauthorized viewing. Maintain appropriate administrative access controls, dependency review, incident response, vulnerability management, and change controls. These are operational responsibilities, not safeguards established solely by this code.

## 10. Documentation and maintenance

Maintain this document in version control and update it when material architecture, controls, or procedures change. [45 CFR §164.316(b)](https://www.ecfr.gov/current/title-45/section-164.316) generally requires retention of required Security Rule documentation for six years from creation or last effective date, whichever is later. Assess applicable requirements and retain other records according to their governing obligations.

## 11. Regulatory references

- [45 CFR §164.308 — Administrative safeguards](https://www.ecfr.gov/current/title-45/section-164.308)
- [45 CFR §164.310 — Physical safeguards](https://www.ecfr.gov/current/title-45/section-164.310)
- [45 CFR §164.312 — Technical safeguards](https://www.ecfr.gov/current/title-45/section-164.312)
- [45 CFR §164.316 — Policies, procedures, and documentation requirements](https://www.ecfr.gov/current/title-45/section-164.316)
- [HHS Security Rule guidance](https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html)
- [Google Cloud HIPAA guidance](https://cloud.google.com/security/compliance/hipaa)
