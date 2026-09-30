# Contributor contract

Use an isolated branch and pull request. Preserve user content and WordPress-native editing. Theme owns presentation; plugin owns functionality. Never copy customer records, credentials, source-site media/branding, entitlement exemptions or provider deployments. Do not publish, deploy, enable secrets or change visibility without separate owner authorization.

Run `python3 tools/audit.py`, `composer lint`, isolated WordPress tests and `python3 tools/package.py` before review. Recheck packaged contents and current official directory requirements. Record precise versions, limitations and skipped tests; never replace a licensed integration test with a bypass. Tests use fresh local data only.
