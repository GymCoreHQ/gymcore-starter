<?php
/** Disposable commerce fixtures, executed only through WP-CLI. */
$phase = $args[0] ?? 'setup';
$mode = $args[1] ?? 'hpos';
$checks = array();
/** Record a meaningful assertion without hiding later failures. */
function gcs_commerce_assert( $condition, $name ) { global $checks; $checks[] = array( 'name' => $name, 'pass' => (bool) $condition ); }
if ( 'setup' === $phase ) {
 update_option( 'woocommerce_custom_orders_table_enabled', 'hpos' === $mode ? 'yes' : 'no' );
 update_option( 'woocommerce_custom_orders_table_data_sync_enabled', 'no' );
 update_option( 'woocommerce_store_address', '100 Fictional Training Way' );
 update_option( 'woocommerce_store_city', 'Example City' );
 update_option( 'woocommerce_default_country', 'US:CA' );
 update_option( 'woocommerce_store_postcode', '90001' );
 update_option( 'woocommerce_currency', 'USD' );
 update_option( 'woocommerce_enable_guest_checkout', 'yes' );
 update_option( 'woocommerce_coming_soon', 'no' );
 update_option( 'woocommerce_cheque_settings', array( 'enabled'=>'yes', 'title'=>'Offline test check', 'description'=>'Fictional fixture. No money is transferred.' ) );
 WC_Install::create_pages();
 $product = new WC_Product_Simple();
 $product->set_name( 'Fictional Inventory Fixture' ); $product->set_slug('fictional-inventory-fixture');
 $product->set_status( 'publish' ); $product->set_virtual( true ); $product->set_regular_price( '25.00' );
 $product->set_description( 'Synthetic commerce test product. Not an actual membership.' );
 $product->set_manage_stock( true ); $product->set_stock_quantity( 20 ); $product->save();
 update_option( 'gcs_commerce_product', $product->get_id() );
 $browser_product = new WC_Product_Simple();
 $browser_product->set_name('Fictional Training Pass'); $browser_product->set_slug('fictional-training-pass');
 $browser_product->set_status('publish'); $browser_product->set_virtual(true); $browser_product->set_regular_price('25.00');
 $browser_product->set_manage_stock(false); $browser_product->set_description('Synthetic non-stock-managed service used for browser checkout.'); $browser_product->save();
 flush_rewrite_rules();
 echo wp_json_encode(array('product'=>$browser_product->get_id(),'managed_stock_product'=>$product->get_id(),'browser_product_manages_stock'=>$browser_product->get_manage_stock(),'cart_block'=>has_block('woocommerce/cart',get_post(wc_get_page_id('cart'))),'checkout_block'=>has_block('woocommerce/checkout',get_post(wc_get_page_id('checkout'))),'shop'=>get_permalink(wc_get_page_id('shop')),'cart'=>wc_get_cart_url(),'checkout'=>wc_get_checkout_url(),'account'=>get_permalink(wc_get_page_id('myaccount')),'product_url'=>get_permalink($browser_product->get_id())));
 return;
}
if ( 'verify-browser-order' === $phase ) {
 $orders = wc_get_orders( array('billing_email'=>'shopper@example.invalid','limit'=>10) );
 $order = $orders ? $orders[0] : null;
 gcs_commerce_assert( $order && 'on-hold' === $order->get_status(), 'Browser checkout saved on-hold offline order' );
 gcs_commerce_assert( $order && 'cheque' === $order->get_payment_method(), 'Browser order used real offline check gateway' );
 gcs_commerce_assert( $order && '25.00' === $order->get_total(), 'Browser order total persisted as 25.00 USD' );
 gcs_commerce_assert( $order && 1 === count($order->get_items()), 'Browser order has one product line' );
} else {
 $hpos=Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled();
 gcs_commerce_assert( $hpos === ('hpos' === $mode), 'Actual order storage matches requested mode' );
 gcs_commerce_assert( is_plugin_active('gymcore-starter-kit/gymcore-starter-kit.php') && 'gymcore-starter' === get_stylesheet(), 'Theme and companion active together with WooCommerce' );
 $product=wc_get_product(get_option('gcs_commerce_product'));
 gcs_commerce_assert( $product && '25.00' === $product->get_price() && $product->is_purchasable(), 'Product CRUD persists purchasable virtual product' );
 $order=wc_create_order(); $order->add_product($product,2); $order->set_billing_email('crud@example.invalid');
 $order->set_payment_method('cheque'); $order->update_meta_data('_gcs_fixture','synthetic');
 $order->calculate_totals(); $order->save();
 $loaded=wc_get_order($order->get_id());
 gcs_commerce_assert( '50.00' === $loaded->get_total() && 2 === $loaded->get_item_count(), 'Order CRUD persists two units and 50.00 USD total' );
 gcs_commerce_assert( 'synthetic' === $loaded->get_meta('_gcs_fixture'), 'Order metadata persists through WooCommerce CRUD' );
 wc_load_cart();
 $gateway=WC()->payment_gateways()->payment_gateways()['cheque'];
 $result=$gateway->process_payment($order->get_id());
 $loaded=wc_get_order($order->get_id());
 gcs_commerce_assert( 'success' === $result['result'] && 'on-hold' === $loaded->get_status(), 'Real offline gateway transitions order to on-hold' );
 $stock=wc_get_product($product->get_id())->get_stock_quantity();
 wc_reduce_stock_levels($order->get_id());
 gcs_commerce_assert( $stock === wc_get_product($product->get_id())->get_stock_quantity(), 'Repeated stock reduction does not double-decrement' );
 gcs_commerce_assert( 18 === $stock, 'Offline order reduces stock by exactly two' );
}
global $wpdb;
echo wp_json_encode(array('phase'=>$phase,'mode'=>$mode,'wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION,'woocommerce'=>WC_VERSION,'database'=>$wpdb->get_var('SELECT VERSION()'),'order_store'=>get_class(WC_Data_Store::load('order')),'hpos'=>Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled(),'checks'=>$checks), JSON_PRETTY_PRINT);
