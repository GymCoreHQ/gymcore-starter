# Security

Report suspected vulnerabilities privately to the GymCoreHQ repository owners. Do not post credentials, member details or exploit payloads containing real data in public issues.

The starter has no production access, remote service integration, payment handling or automatic updates. Setup actions require an administrator, CSRF protection and explicit opt-in. The schedule exposes only the owning plugin's public class fields. Any change that widens visibility, accesses personal data, changes entitlements or introduces external requests needs a fresh security review and tests.

Development tools are not shipped in the installable ZIPs. Run disposable tests on loopback, with synthetic content and no production credentials. Dependency audits and source scanners reduce risk but do not prove the absence of vulnerabilities.
