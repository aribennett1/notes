# Private Notes — HIPAA Security Risk Assessment

**Application:** Private Notes  
**Assessment date:** November 20, 2026  
**Version:** 1.0  
**Assessment scope:** Single-user clinical notes application  
**Assessment status:** Initial application-specific assessment; reviewer approval pending  
**Related document:** `security-and-hipaa-compliance.md`

## 1. Purpose

This initial assessment identifies and evaluates reasonably anticipated threats to the confidentiality, integrity, and availability of electronic protected health information (ePHI) processed by Private Notes.

It documents the application's safeguards, remaining risks, and recommended risk-management actions.

The assessment is intended to support the risk-analysis requirement of 45 CFR §164.308(a)(1)(ii)(A).

It covers the Private Notes application and its supporting infrastructure. It does not replace a broader organizational risk analysis covering other systems or clinical workflows.

## 2. System Scope and Data Flow

Private Notes is designed for one authorized clinical user.

The application uses:

- An Angular frontend hosted on GitHub Pages.
- Firebase Authentication for Google sign-in.
- A Node.js backend hosted on Google Cloud Run.
- A private Google Cloud Storage bucket.
- Browser IndexedDB for encrypted local storage.
- Client-side AES-256-GCM encryption and Argon2id password-based key derivation.

Clinical notes are decrypted and displayed within the browser. They are encrypted before being transmitted to the backend.

The backend stores and retrieves encrypted data without requiring access to plaintext notes or the encryption password.

The application uses a single authorized Firebase UID, validated by the backend.

### Locations where ePHI may exist

| Location | Form of information |
|---|---|
| Browser memory and interface | Plaintext while unlocked |
| Browser IndexedDB | Encrypted workspace |
| Google Cloud Storage | Encrypted workspace |
| Network transmission to API | Encrypted workspace |
| User-created exports or temporary files | Depends on the export or file |
| Temporary paper records | Plaintext, when used |

The frontend delivery system is also security-relevant because the JavaScript executed in the browser can access decrypted information.

## 3. Assessment Methodology

Risks are evaluated using three factors:

**Likelihood**

- Low: Unlikely under ordinary operating conditions.
- Medium: Plausible during normal use or foreseeable failures.
- High: Expected to occur frequently or readily exploitable.

**Impact**

- Low: Limited disruption or exposure.
- Medium: Significant but recoverable disruption or limited disclosure.
- High: Serious confidentiality breach, irreversible loss of required records, or substantial interruption.

**Residual risk** describes the risk remaining after existing safeguards.

Ratings are preliminary qualitative judgments from the supplied assessment, not validated measurements or a substitute for a documented organization-wide risk analysis. The responsible reviewer should confirm the evidence and ratings.

Where an operational control has not been verified, its effectiveness is not assumed.

## 4. Risk Analysis

### Risk 1: Unauthorized access to cloud-stored clinical information

**Threat:** An unauthorized party obtains access to the cloud API or storage.

**Existing safeguards:** Firebase token verification, authorization restricted to one UID, private cloud storage, and client-side encryption.

**Likelihood:** Low  
**Impact:** High  
**Residual risk:** Low to Medium

**Assessment:** The layered controls substantially reduce the likelihood of unauthorized access to readable clinical information. Compromise of cloud storage alone would not ordinarily expose plaintext notes without the encryption credentials.

**Disposition:** Mitigated through existing technical controls. Maintain appropriate cloud IAM permissions and authentication safeguards.

### Risk 2: Compromise of the authorized Google account

**Threat:** An unauthorized person gains control of the authorized Google account.

**Existing safeguards:** A separate encryption password is required to decrypt clinical information.

**Likelihood:** Low to Medium  
**Impact:** High  
**Residual risk:** Medium

**Assessment:** Compromise of the Google account could permit access to encrypted workspace data and authorized API operations. It does not independently provide the encryption password. An attacker might nevertheless disrupt or delete data, subject to available recovery mechanisms.

**Disposition:** Maintain strong Google account security and appropriate multifactor authentication.

### Risk 3: Device theft or unauthorized physical access

**Threat:** Someone obtains physical access to the user's device.

**Existing safeguards:** Encrypted local storage and separate workspace encryption credentials.

**Likelihood:** Medium  
**Impact:** High  
**Residual risk:** Medium

**Assessment:** Encrypted local storage protects information at rest. However, an unlocked application or compromised browser may expose plaintext information.

**Disposition:** Secure devices and sessions, lock unattended devices, and avoid untrusted devices.

### Risk 4: Permanent loss of encryption password

**Threat:** The authorized user permanently loses the encryption password without retaining another usable copy of the password or encryption key.

**Existing safeguards:** No independent password-recovery mechanism.

**Likelihood:** Not established; depends on credential-handling practices  
**Impact:** High  
**Residual risk:** High

**Assessment:** Client-side encryption intentionally prevents recovery without the required cryptographic credentials. Cloud backups and soft deletion cannot restore decryption capability.

This is an inherent consequence of the current design, not a malfunction.

**Disposition:** Identified availability risk requiring an explicit operational decision. A securely retained copy of the password would reduce this risk without modifying the application. Until such a safeguard is established, permanent loss remains possible.

### Risk 5: Accidental deletion of encrypted cloud data

**Threat:** The encrypted workspace is accidentally deleted.

**Existing safeguards:** Google Cloud Storage seven-day soft deletion.

**Likelihood:** Low  
**Impact:** High  
**Residual risk:** Medium

**Assessment:** Soft deletion provides a defined recovery opportunity. It does not guarantee recovery after the configured period or protect against every corruption scenario.

**Disposition:** Maintain the recovery configuration and verify that restoration procedures work.

### Risk 6: Accidental concurrent overwrite or synchronization conflict

**Threat:** Multiple application sessions or stale local data attempt to overwrite newer information.

**Existing safeguards:** Cloud Storage generation preconditions and frontend conflict detection.

**Likelihood:** Low to Medium  
**Impact:** Medium  
**Residual risk:** Low to Medium

**Assessment:** Conditional writes prevent a stale client from silently replacing a newer cloud generation. User intervention may still be needed to resolve conflicting copies.

**Disposition:** Existing safeguards are appropriate for the single-user design. Maintain synchronization testing when relevant code changes.

### Risk 7: Internet outage, cloud outage, or device failure

**Threat:** The application becomes temporarily unavailable.

**Existing safeguards:** Encrypted local cache where available, cloud-stored encrypted workspace, and temporary paper-based documentation procedures.

**Likelihood:** Medium  
**Impact:** Medium  
**Residual risk:** Low to Medium

**Assessment:** Temporary outages may interrupt access but do not necessarily result in data loss. The clinical user can document information securely on paper and transfer it when access is restored.

**Disposition:** Maintain the contingency procedure and ensure temporary records are protected.

### Risk 8: Malicious or compromised frontend code

**Threat:** An attacker compromises the repository, deployment workflow, a dependency, or delivered JavaScript.

**Existing safeguards:** Browser-side encryption protects stored data but does not protect plaintext from malicious code executing in the unlocked browser.

**Likelihood:** Not established  
**Impact:** High  
**Residual risk:** Undetermined

**Assessment:** The frontend is a significant trust boundary. A malicious deployment could access clinical information after decryption.

**Disposition:** Verify repository permissions, deployment access, dependency-management practices, and account protections. Reassess this risk after those controls are confirmed.

### Risk 9: Inadequate system activity monitoring

**Threat:** Unauthorized activity or system misuse occurs without sufficient records to detect or investigate it.

**Existing safeguards:** Authenticated API requests; potential Google Cloud operational and audit logging.

**Likelihood:** Not established  
**Impact:** Medium to High  
**Residual risk:** Undetermined

**Assessment:** The application does not maintain patient-level clinical change histories. Such histories are not automatically required by the HIPAA Security Rule. However, the rule requires mechanisms to record and examine relevant information-system activity.

The deployed logging configuration has not yet been established by this assessment.

**Disposition:** Verify existing Cloud Run and Cloud Storage logging, and determine whether the available records and review procedures adequately satisfy the audit-controls requirement.

No plaintext patient names or clinical notes need to be introduced into application logs for this purpose.

### Risk 10: Unauthorized disclosure through user behavior

**Threat:** Clinical information is exposed through an unlocked screen, insecure export, untrusted device, or improperly handled temporary records.

**Existing safeguards:** Encryption at rest and documented device and operational security practices.

**Likelihood:** Medium  
**Impact:** High  
**Residual risk:** Medium

**Assessment:** Client-side encryption does not eliminate risks arising when information is displayed, exported, or copied outside the application.

**Disposition:** Maintain reasonable device security and confidentiality practices. Securely handle temporary records and exports.

## 5. Risk Management Summary

| Risk | Residual assessment | Action |
|---|---|---|
| Unauthorized cloud access | Low–Medium | Maintain controls |
| Google account compromise | Medium | Maintain account security |
| Device theft or access | Medium | Apply device safeguards |
| Lost encryption password | High | Decide and document credential-retention approach |
| Accidental deletion | Medium | Test recovery |
| Synchronization conflicts | Low–Medium | Maintain existing controls |
| Service interruption | Low–Medium | Maintain paper fallback |
| Compromised frontend | Undetermined | Verify deployment protections |
| Inadequate audit controls | Undetermined | Verify logging and review procedures |
| User-related disclosure | Medium | Apply operational safeguards |

The architecture provides meaningful protections against unauthorized access to cloud-stored clinical information.

The most significant remaining availability risk is permanent loss of the encryption password.

The most significant outstanding verification items concern frontend deployment security, audit controls, and practical recovery testing.

## 6. Backup and Contingency Evaluation

The application maintains an encrypted cloud workspace and may retain an encrypted local copy.

Seven-day Cloud Storage soft deletion provides limited recovery from accidental deletion.

If the application is unavailable, the clinical user may temporarily document information on paper, keep it secure, and enter relevant information into the application after service restoration.

A device failure does not inherently prevent recovery because encrypted data is stored remotely.

However, recovery requires valid encryption credentials. The application does not provide independent password recovery.

These arrangements address several foreseeable interruptions, but their effectiveness should be confirmed through an actual restoration test.

## 7. Conclusions

Private Notes uses an architecture that provides substantial technical safeguards for the confidentiality and integrity of clinical information, including authenticated access, client-side encryption, private cloud storage, and conditional writes.

The application's single-user design reduces access-management complexity.

The assessment identifies no inherent requirement to replace the application with a commercial clinical records platform or to introduce patient names and note contents into plaintext audit logs.

The assessment does identify outstanding risks and verification work, particularly encryption-password loss, frontend supply-chain security, audit controls, and recovery testing.

The existing controls and contingency procedures provide a basis for risk management. Whether the remaining risks are acceptable must be determined by the responsible covered entity or authorized practice operator in light of its recordkeeping and availability obligations.

## 8. Review and Approval

**Assessment prepared:** November 20, 2026  
**Assessment scope:** Private Notes application only  
**Responsible reviewer:** To be designated  
**Risk acceptance decision:** Pending responsible-user review

This assessment should be reviewed when significant changes occur to the application's architecture, security controls, hosting arrangements, or clinical use.

The responsible reviewer should record decisions regarding identified residual risks and outstanding actions.

## 9. References

- [45 CFR §164.308 — Administrative safeguards](https://www.ecfr.gov/current/title-45/section-164.308)
- [45 CFR §164.312 — Technical safeguards](https://www.ecfr.gov/current/title-45/section-164.312)
- [45 CFR §164.316 — Documentation](https://www.ecfr.gov/current/title-45/section-164.316)
- [HHS Guidance on Risk Analysis](https://www.hhs.gov/hipaa/for-professionals/security/guidance/guidance-risk-analysis/index.html)
