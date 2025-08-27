# PODFY Security Policy
_Last updated: 2025-08-27_

We take the security of our users and their Proof-of-Delivery (POD) data seriously. This policy explains how to report vulnerabilities to us and what you can expect in return.

## Scope
This policy covers vulnerabilities discovered in:
- **podfy.net** (marketing site served on Cloudflare Pages)
- **podfy.app** (operational application)

If you believe a vulnerability affects a third-party provider we use (e.g., hosting, form processor, email), please report it to us first and, if appropriate, also to the vendor.

## Reporting a vulnerability
Email: **info@podfy.net**  
Please include:
- A clear description of the issue and where it can be observed (URL, endpoint, parameters).
- Step-by-step reproduction instructions and any proof-of-concept code or screenshots.
- Expected vs. actual behavior.
- Impact assessment (what could an attacker do?).
- Your preferred contact details for follow-up.

If your report contains sensitive details, indicate this in the subject line. We can arrange an encrypted channel if required.

## Our commitment & timelines
- **Acknowledgement:** within **3 business days**.
- **Triage & initial assessment:** within **7 business days**.
- **Remediation targets** (guideline; actual timelines may vary with complexity/risk):
  - Critical: **7 days**
  - High: **30 days**
  - Medium: **90 days**
  - Low: **180 days**
- **Coordinated disclosure:** we prefer disclosure **after a fix is available**. If no fix is ready after **90 days**, we’ll agree on a reasonable disclosure plan with you.

## Rules of engagement (good-faith testing)
To protect users and data, please:
- Do **not** access, modify, or exfiltrate data that does not belong to you.
- Avoid actions that degrade availability (no DoS, stress tests, automated scanning at high rates).
- Do not attempt phishing, social engineering, or physical attacks.
- Use test inputs and your own accounts only. If you need a test account, contact us.
- Stop testing and notify us immediately if you encounter personal data.

## In-scope examples
- Auth/session issues (e.g., broken auth, IDOR).
- Access control and multi-tenant isolation flaws.
- Injection (SQL/NoSQL, template, command) and stored XSS.
- Misconfigured headers/CSP, insecure direct object references, SSRF.
- File upload handling and signed-URL misuse.

## Out-of-scope examples
- Reports without a security impact (UI/UX, typos).
- Rate-limiting or brute-force reports without demonstrated impact.
- Best-practice recommendations without a concrete exploit path.
- Use of **automated scanners** without a reproducible vulnerability.
- Denial-of-service and volumetric attacks.
- Issues in third-party services not controlled by PODFY (please report to the vendor).

## Safe harbor
We will not pursue legal action against researchers who:
- Act in **good faith**, follow this policy, and avoid privacy violations and service disruption.
- Make a **good-faith** effort to report promptly and allow reasonable time for remediation.
- Do not access or retain more data than necessary to demonstrate the issue.

This safe-harbor statement does not waive rights of affected users or third parties.

## Severity classification
We use CVSS v3.1 to prioritize fixes. If you provide a CVSS vector, include it in your report.

## Credit
If you’d like recognition after remediation, tell us how to credit you (name, handle, or anonymous).

---
**Contact:** security / vulnerability reports — **security@podfy.net**
