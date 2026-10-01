<?php
/** Runs only in the disposable locale fixture. */
require '/wordpress/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';
activate_plugin( 'gymcore-starter-kit/gymcore-starter-kit.php' );
switch_theme( 'gymcore-starter' );
wp_set_password( 'disposable-locale-test-only', 1 );
update_user_meta( 1, 'show_welcome_panel', 0 );
update_option( 'blogname', 'Locale test academy' );
update_option( 'timezone_string', 'UTC' );
update_option( 'time_format', 'H:i' );
foreach ( array( '09:00', '18:30' ) as $time ) {
	$id = wp_insert_post( array( 'post_type' => 'gym_class', 'post_status' => 'publish', 'post_title' => 'TEST — مجموعة اختبار طويلة — Beispielkurs' ) );
	foreach ( array( '_gym_class_status' => 'active', '_gym_class_recurrence' => 'weekly', '_gym_class_day_of_week' => 'monday', '_gym_class_start_time' => $time ) as $key => $value ) {
		update_post_meta( $id, $key, $value );
	}
}
$page = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_name' => 'locale-schedule', 'post_title' => 'TEST — الجدول الأسبوعي — Wochenplan', 'post_content' => '<!-- wp:gymcore-starter/weekly-schedule {"headingLevel":2} /-->' ) );
echo 'GCS_LOCALE_SETUP=' . wp_json_encode( array( 'page_id' => $page, 'locale' => get_locale() ) );
