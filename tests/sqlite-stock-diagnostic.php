<?php
/** Read-only observations of a disposable, entirely fictional commerce fixture. */
global $wpdb;
$product = wc_get_product( get_option( 'gcs_commerce_browser_product' ) );
$orders = wc_get_orders( array( 'billing_email' => 'shopper@example.invalid', 'limit' => 10 ) );
$plugins = array();
foreach ( get_plugins() as $file => $metadata ) {
 if ( false !== stripos( $file, 'sqlite' ) || false !== stripos( $file, 'woocommerce' ) ) {
  $plugins[ $file ] = $metadata['Version'];
 }
}
echo wp_json_encode( array(
 'wordpress' => get_bloginfo( 'version' ), 'php' => PHP_VERSION, 'woocommerce' => WC_VERSION,
 'database' => $wpdb->get_var( 'SELECT VERSION()' ), 'database_class' => get_class( $wpdb ),
 'plugins' => $plugins, 'theme' => get_stylesheet(), 'starter_active' => is_plugin_active( 'gymcore-starter-kit/gymcore-starter-kit.php' ),
 'hpos' => Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled(),
 'stock' => $product ? $product->get_stock_quantity() : null,
 'manages_stock' => $product ? $product->get_manage_stock() : null,
 'orders' => array_map( static function( $order ) { return array( 'status' => $order->get_status(), 'total' => $order->get_total(), 'gateway' => $order->get_payment_method() ); }, $orders ),
 'reservations' => $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}wc_reserved_stock", ARRAY_A ),
), JSON_PRETTY_PRINT );
