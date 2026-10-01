# Larger-network verification

`node tests/network-scale.mjs` creates **104 real initialized WordPress sites** in a fresh disposable SQLite/PHP-WASM network. It never mounts an existing site or database. It uses the same production uninstall entrypoint and ordinary WordPress options/content APIs.

Executed with WordPress **7.1.2**, PHP **8.3.32** and Playground CLI **3.1.52**: **211 assertions passed**. Alternating per-site cleanup preferences are respected on both sides of the 100-site query boundary; all fictional draft content remains; the caller's blog and switch stack are restored. A deliberately thrown exception from an option-deletion hook is observable and still restores the original context. The fixture took 26.799 seconds overall; the uninstall portion took 0.391 seconds on this machine. These are observations, not production capacity or timing promises.

The earlier two-site test remains the network activation, importer/reset and site-administrator authorization check. This larger fixture adds pagination and exception coverage. Native MySQL network operation, subdomains/domain mapping, multi-network installations and very large hosting-dependent time limits remain unverified. The test does not suppress normal site initialization or replace WordPress site APIs.

Official API references consulted: [wp_insert_site](https://developer.wordpress.org/reference/functions/wp_insert_site/), [wp_initialize_site](https://developer.wordpress.org/reference/functions/wp_initialize_site/), [get_sites](https://developer.wordpress.org/reference/functions/get_sites/). Results are retained locally in ignored `test-results/network-scale.json`.
