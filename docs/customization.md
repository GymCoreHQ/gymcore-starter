# Setup, customization and extension

## Native controls

| Need | Control |
| --- | --- |
| Site name, language, timezone, week start and time format | Settings → General |
| Logo | Site Editor → Header → Site Logo; choose an owned image |
| Primary navigation | Site Editor → Navigation; add your own menu items alongside the initial Home link |
| Colors, typography, spacing and widths | Site Editor → Styles; optional Light variation |
| Homepage | Site Editor → Templates → Front Page |
| Pages and blog posts | Pages / Posts, featured images, categories and tags |
| Repeated editable sections | Insert a starter pattern; make a synced pattern if desired |
| Header/footer across site | Site Editor → Patterns → Template Parts |
| Programs, coaches, public contact details | Edit the relevant patterns/pages; no custom field schema required |
| Classes, programs and locations | Owning GymCore administrative screens |
| Schedule filtering | Weekly class schedule block → inspector controls |
| Shop/catalog, cart, checkout, account | Owning WooCommerce blocks/pages/settings |
| Draft setup, reversible removal, uninstall preference | Settings → GymCore Starter |

There is no fake lead form, fabricated testimonial, default member leaderboard or placeholder payment flow. Add a form from a plugin you trust, configure its privacy/consent/retention behavior, and test real delivery separately. Add real testimonials only with permission. Replace all instructional starter copy before launch.

Patterns are copied on insertion: changing their PHP source does not rewrite existing content. Core blocks support normal editor colors, spacing and typography. No content locks force source editing. Navigation uses the core responsive overlay, preserving the mobile-menu lesson from HMA #106. Site Logo uses native image sizing instead of the source site's asset-specific header workaround (#107).

## GymCore recipes

Install GymCore and any optional companion modules through their authorized distribution. Configure their dependencies and entitlement settings normally. This repository does not bundle or install them.

The supplied weekly schedule is a read-only schema adapter, verified against synthetic contract fixtures and the separately authorized canonical version recorded in [canonical integration](canonical-integration.md). Review the exact GymCore version compatibility before production. It uses no private REST endpoints or license override.

Canonical GymCore offers features such as targeted content, trial signup, memberships and member progress. See the [feature map](source-audit.md) for exact existing block/shortcode names. Insert them through the owning plugin's UI only after its own prerequisites and tests pass. Do not advertise the upstream schedule block as certified here: the source audit records rendering/schema concerns. Public rankings may expose personal names, so enable such content only after an explicit privacy review.

For commerce, create products and use native WooCommerce Product Collection, Cart, Checkout and Customer Account tools. This theme does not override WooCommerce templates. A smoke test is not certification of payments, renewals, tax, gateway, subscriptions, checkout extensions or HPOS workflows. Test your actual installed stack independently.

## Developer extension points and exceptions

Normal site operation needs no source edits. Developers can add a child theme or export editor styles/templates for version control. Business extensions belong in their own plugins with unique prefixes, standard capabilities, REST permission callbacks and nonces for browser mutations. Never add member records or license rules to theme files.

The weekly block's data contract is explicit in `includes/schedule.php`. To support a future GymCore schema, update the adapter and its runtime fixtures together, including public visibility and timezone tests. Do not instantiate internal product modules to bypass availability checks. No generalized arbitrary-shortcode or arbitrary-query control is exposed.

An interrupted import lock is the one deliberate WP-CLI maintenance exception; see architecture. Package version changes and translation generation are developer release operations. Translation strings use `gymcore-starter` and `gymcore-starter-kit`; prepare POT/JSON catalogs with official WP-CLI i18n tooling before directory submission.

## WooCommerce field labels

The starter keeps WooCommerce’s default white text/select control surfaces and gives their floating labels a readable dark color. The rule is scoped to WooCommerce control labels, not payment-method labels. If you replace those control surfaces with custom dark styles, review label contrast too; use the Site Editor’s Additional CSS for coordinated control styling. No source edit is required.
