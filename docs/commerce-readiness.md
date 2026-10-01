# Commerce readiness

This is a finite functional coexistence test of the starter theme and companion with official WooCommerce 11.1.2. It does not enable real payment providers, load licensed GymCore features, or certify all WooCommerce extensions.

## Reproduce

With Docker running and locked Node dependencies installed:

```sh
GCS_BROWSER_CHANNEL=chrome node tests/commerce-run.mjs
```

Omit `GCS_BROWSER_CHANNEL` to use Playwright's installed Chromium. The harness reserves loopback port **9492**. It creates a unique Docker Compose project, uses separate fresh MariaDB databases for HPOS and legacy posts storage, mounts the starter sources read-only and copies them into its disposable site volume, and removes only its own containers, network and volumes. It downloads WordPress 7.1.2 and WooCommerce 11.1.2 from official sources into disposable scratch. Official image tags are resolved at execution and their actual IDs/digests recorded in the JSON report.

The Docker bridge network provides local browser access. A fixture-only must-use plugin rejects WordPress outbound HTTP and suppresses email; the browser rejects off-host requests. Only fictional `.invalid` customer addresses and an offline check-payment method are used. No external payment, license activation, real customer, or provider credentials are involved.

## Coverage

- The starter theme and companion are active with WooCommerce.
- Separate fictional virtual products cover managed-stock CRUD and browser checkout. Native browser checkout uses managed stock; Playground browser checkout uses an ordinary non-stock-managed service. Both use WooCommerce CRUD.
- Requested HPOS or legacy storage is verified through `OrderUtil` on a fresh database.
- A fictional two-unit order persists its total and metadata through WooCommerce CRUD.
- WooCommerce's real offline check gateway places the order on hold, with exactly one stock reduction; repeating the stock-reduction operation does not double-decrement stock.
- Browser rendering covers the product, shop and My Account pages, native Cart and Checkout blocks, and a guest checkout that reaches the order-received page.
- The resulting browser order is read through WooCommerce CRUD to verify status, gateway, total and line count. The native variant additionally verifies exact stock decrement, repeated-reduction protection, and the purchased product and quantity.
- Page JavaScript errors and horizontal overflow fail the run. A fixture failure or incomplete mode cannot count as success.

Machine-readable results and diagnostic checkout screenshots are saved in ignored `test-results/commerce*`. The executed scope and exceptions are recorded below; results from different database engines are not combined.

## Boundaries

Offline check orders are deliberately unpaid and on hold. This does not test funds transfer, external gateways, webhooks, refunds, taxes, shipping, subscriptions, entitlement changes, GymCore memberships, or paid GymCore integrations. No compatibility declaration should be inferred for an untested extension or configuration.

The fixture follows WooCommerce's [HPOS recipe book](https://developer.woocommerce.com/docs/features/orders/high-performance-order-storage/recipe-book/) for order CRUD and storage detection, and uses the documented [offline check gateway](https://woocommerce.com/document/cheque/). Sources consulted 2026-10-01.

## Native fixture initialization history — 2026-10-01

The bounded Docker attempt did **not** execute commerce assertions. Its uniquely named WordPress and MariaDB containers remained in `Starting` until the 240-second startup timeout. The harness removed its own project resources successfully. Later retries exposed fixture initialization races and an explicit `wp` command requirement in the official CLI image. The runner now seeds its disposable volume, waits for MariaDB health, and invokes `wp` explicitly. `test-results/commerce-native-initialization-blocked.json` preserves the last initialization blocker. An initial functional run completed both browser flows but correctly failed its completion guard because WP-CLI’s local evaluation scope produced empty assertion arrays; `test-results/commerce-native-assertion-scope-failed.json` preserves that result. Assertion collection now uses a dedicated global array in both execution environments. Existing unrelated containers were not changed.

A separate fallback, `GCS_BROWSER_CHANNEL=chrome node tests/commerce-playground.mjs`, exercises the same PHP fixtures and browser flow against Playground SQLite/PHP-WASM. Results from that engine are reported separately and cannot be counted as native MariaDB verification.

## Native functional result — 2026-10-01

The final native run exited **0** with WordPress **7.1.2**, WooCommerce **11.1.2**, web PHP **8.3.33**, WP-CLI PHP **8.3.33**, MariaDB **11.8.9-MariaDB-ubu2404**, and Chrome **154.0.8037.58**. Both fresh databases used the requested real order store: HPOS enabled and legacy posts enabled.

Each mode passed eight CRUD assertions and seven persisted browser-order assertions: **30 PHP assertions** total. Four browser progression checks confirmed native Cart content and actual guest Checkout submission to the order-received page. All ten shop/product/account/cart/checkout visits returned 200, showed expected content and had no horizontal overflow. Both checkout scans returned zero targeted axe contrast violations, with no page JavaScript errors or failed HTTP responses.

The browser product uses normal WooCommerce managed inventory: checkout reduced stock from 20 to 19, persisted the expected product and one-unit quantity, and repeating stock reduction left stock at 19. These checks passed for both stores. This satisfies the previously pending native managed-stock checkout gate for this finite matrix; it does not explain or resolve the earlier SQLite reservation failure.

`test-results/commerce.json` records both modes, exact official image IDs/digests, and `cleanupCompleted: true`. The tested application HEAD was `81d70f6c0d220ecdb4f7327b1691af42a3fa8278`, with the reviewed commerce harness changes in the working tree. Tested `theme.json` SHA-256: `1c391babd69fb91bbd31ee999acaed08d49bcf5b0f5e17fdeb59647ab904779c`. No application files were changed during this native test phase.

## Playground functional result — 2026-10-01

Verified WordPress **7.1.2**, PHP **8.3.32**, WooCommerce **11.1.2**, Playground CLI **3.1.52**, and Chrome **154.0.8037.58**, on the Playground SQLite adapter (reported SQL compatibility string `8.0.38-mysql-on-sqlite-3.0.0`, not a native MySQL server).

Both independent fresh instances exercised the actual requested order store: HPOS enabled and legacy posts enabled. Each passed eight managed-product/order CRUD assertions plus four persisted browser-order assertions: **24 PHP assertions** across the two modes. Each browser reached Cart and successfully submitted the real offline check gateway to the order-received page: four progression checks total. Shop, product, My Account, Cart and Checkout each returned 200, showed expected content and had no horizontal overflow or page JavaScript errors in both modes (ten page visits).

The browser service product explicitly uses WooCommerce's normal **Manage stock: off** setting. Managed-stock CRUD, stock decrement and repeat-decrement protection remain separately tested. The earlier managed-stock browser checkout produced WooCommerce's “not enough units” reservation error in this SQLite fixture despite 18 units remaining according to CRUD; that failed run is preserved in `test-results/commerce-playground-managed-stock-blocked.json`. A subsequent [four-configuration diagnostic](sqlite-stock-diagnostic.md) reproduced the same translated reservation SQL syntax error with the starter inactive, identifying a tested adapter translation incompatibility. The separate native result above satisfies managed-stock checkout coverage on MariaDB; no vendor fix or SQLite commerce-support claim is included. No reservation or licensing code was bypassed.

### Checkout contrast

The expanded checkout smoke found nine floating labels inheriting `#f5f7fc` on white fields (axe measured 1.07:1). The theme was corrected only for `.wc-block-components-text-input label[for]` and `.wc-blocks-components-select__label[for]`, preserving dark-background payment labels. A final run checks actual computed colors and fails for any selected checkout color-contrast violation. The final fresh HPOS and legacy-posts rerun exited successfully on 2026-10-01. All nine labels per mode computed `rgb(30, 30, 30)` (`#1e1e1e`), approximately 16.67:1 against white, and both checkout scans had **zero axe color-contrast violations**. All 24 PHP assertions, four browser progression checks and ten page visits passed again against the corrected theme. No page JavaScript errors, failed HTTP responses, activation stderr or fixture PHP stderr were recorded. This is a targeted contrast smoke, not a full WCAG conformance claim.
