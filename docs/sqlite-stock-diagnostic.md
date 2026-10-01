# SQLite managed-stock checkout diagnostic

On 2026-10-01, the same reservation failure reproduced with the starter enabled and with bundled Twenty Twenty-Five active and the companion inactive, in both HPOS and legacy posts storage. The observed failure therefore does not require the starter in this tested matrix. The captured driver error points to SQL translation in the tested SQLite adapter; this is a bounded diagnosis, not a claim that every SQLite/WooCommerce version fails or that an upstream fix has been identified.

## Reproduce safely

Install the repository's locked Node dependencies and a Playwright browser, then run:

```sh
node tests/sqlite-stock-diagnostic.mjs
# Or use an installed Chrome:
GCS_BROWSER_CHANNEL=chrome node tests/sqlite-stock-diagnostic.mjs
```

The runner uses loopback port **9498** and four independent disposable sites. It downloads official WordPress/WooCommerce packages, mounts the starter source, and activates it only in the starter variants. The default variants use Twenty Twenty-Five and explicitly deactivate the companion. All checkout details are fictional `.invalid` data. Only WooCommerce's offline check gateway is enabled; no funds move. WordPress outbound HTTP and mail, and browser off-host requests, are blocked. A read-only query filter returns each original query unchanged and records reservation SQL plus actual database errors. There are no vendor patches, licensing changes, stock-reservation bypasses, or production connections.

`tests/sqlite-stock-diagnostic.php` records actual order storage, theme/companion state, stock, checkout-order state and reservation rows. The setup uses `tests/commerce-fixture.php` with its normal managed-stock variant; it does not run the unrelated two-unit CRUD order. Each browser attempts to buy one unit from a fresh 20-unit virtual product through the real Checkout block.

Reports and screenshots are ignored under `test-results/sqlite-stock-*`. Exit zero means the diagnostic collected all four configured observations successfully. It does **not** mean checkout passed. `comparison.sameReservationSyntaxFailure` separately states whether all four runs reproduced the captured failure; a future fixed adapter may make that value false.

## Verified result

Application baseline: `698bb8d0f6f243457631cc9e4423a77e545755ec`. WordPress **7.1.2**, WooCommerce **11.1.2**, PHP-WASM **8.3.32**, Playground CLI **3.1.52**, Chrome **154.0.8037.58**. The database class was `WP_SQLite_DB`; its reported SQL compatibility string was **8.0.38-mysql-on-sqlite-3.0.0**, not a native MySQL server. The separate SQLite plugin package version and bundled default-theme version were not recorded, so neither is inferred from that compatibility string.

| Real order storage | Active theme | Companion active | Checkout result | Stock before/after |
| --- | --- | --- | --- | --- |
| HPOS | gymcore-starter | Yes | HTTP403, reservation error | 20 / 20 |
| HPOS | twentytwentyfive | No | HTTP403, reservation error | 20 / 20 |
| Legacy posts | gymcore-starter | Yes | HTTP403, reservation error | 20 / 20 |
| Legacy posts | twentytwentyfive | No | HTTP403, reservation error | 20 / 20 |

Each Store API response had code `woocommerce_product_not_enough_stock` and said the fictional product had insufficient units. Each database retained only a $25 `checkout-draft` order with `cheque` selected; no reservation row was saved. Actual stock remained 20. The completed report has `configurationVerified: true` and `sameReservationSyntaxFailure: true`; all four server disposals succeeded and the disposable runtime directory was removed.

## Concrete SQL evidence

WooCommerce's reservation query attempted an `INSERT INTO wp_wc_reserved_stock … SELECT …` with expiry expression `( NOW() + INTERVAL 60 MINUTE )`. Its adapter error trace showed a generated SQLite selection containing:

```sql
( CURRENT_TIMESTAMP + INTERVAL 60 MINUTE )
```

That generated query failed with:

```text
SQLSTATE[HY000]: General error: 1 near "60": syntax error
```

The trace connects the failure to `WooCommerce\Checkout\Helpers\ReserveStock::reserve_stock_for_product()` in `ReserveStock.php:242`, through `WP_SQLite_DB` and `WP_MySQL_On_SQLite`. All four cases captured the same reservation-query syntax error. The raw report also includes a separate attribute-table lookup error during initial WooCommerce activation; that earlier schema lookup is not the reservation error used for this conclusion.

This is stronger evidence than the generic “insufficient stock” response alone: the underlying reservation SQL failed before saving a reservation, and the failure persists with starter functionality inactive. The evidence supports an adapter translation incompatibility for this query/build. It does not establish which upstream revision introduced it, whether another SQLite engine/build is affected, or which patch would fix it.

## Minimal manual comparison

1. Start a fresh WordPress7.1.2 Playground site with WooCommerce11.1.2, its bundled SQLite adapter and Twenty Twenty-Five; leave the starter companion inactive.
2. Enable guest checkout and the offline check gateway, create normal WooCommerce pages, and publish a $25 virtual simple product with managed stock20.
3. Add one unit and submit the native Checkout block with fictional billing details.
4. Observe the Store API403 and capture the reservation query's SQLite syntax error. Repeat with HPOS disabled, then compare the same configurations with the starter theme/companion active.

The automated fixture implements this comparison and records the SQL without replacing the gateway, modifying reservation behavior, or substituting direct order creation for checkout.

The native MariaDB result remains independent: both real storage modes passed managed-stock checkout and stock/idempotency checks there (see [commerce readiness](commerce-readiness.md)). No starter application change is indicated by this SQLite reproduction, and this diagnostic does not certify SQLite commerce support.

Official references inspected 2026-10-01: [WooCommerce11.1.2 reservation implementation](https://github.com/woocommerce/woocommerce/blob/11.1.2/plugins/woocommerce/src/Checkout/Helpers/ReserveStock.php) and [WordPress SQLite integration architecture](https://github.com/WordPress/sqlite-database-integration). The runtime trace, rather than the current upstream branch, is the evidence for the tested failure.
