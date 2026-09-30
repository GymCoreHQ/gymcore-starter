<?php
/**
 * Remove only explicitly opted-in settings. Never delete content.
 *
 * @package GymCoreStarter
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}
$options = get_option( 'gcs_options', array() );
if ( ! empty( $options['remove_settings'] ) ) {
	delete_option( 'gcs_options' );
	delete_option( 'gcs_demo_manifest' );
	delete_option( 'gcs_setup_lock' );
}
