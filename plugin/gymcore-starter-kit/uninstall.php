<?php
/**
 * Remove only explicitly opted-in settings. Never delete content.
 *
 * @package GymCoreStarter
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}
( static function () {
	$gymcore_starter_remove_settings = static function () {
		$options = get_option( 'gcs_options', array() );
		if ( ! empty( $options['remove_settings'] ) ) {
			delete_option( 'gcs_options' );
			delete_option( 'gcs_demo_manifest' );
			delete_option( 'gcs_setup_lock' );
		}
	};

	if ( is_multisite() ) {
		// Plugin files are removed network-wide; honor each site's individual opt-in.
		$gymcore_starter_offset = 0;
		do {
			$gymcore_starter_site_ids = get_sites(
				array(
					'fields'  => 'ids',
					'number'  => 100,
					'offset'  => $gymcore_starter_offset,
					'orderby' => 'id',
					'order'   => 'ASC',
				)
			);
			foreach ( $gymcore_starter_site_ids as $gymcore_starter_site_id ) {
				switch_to_blog( $gymcore_starter_site_id );
				try {
					$gymcore_starter_remove_settings();
				} finally {
					restore_current_blog();
				}
			}
			$gymcore_starter_offset += 100;
			$gymcore_starter_count   = count( $gymcore_starter_site_ids );
		} while ( 100 === $gymcore_starter_count );
	} else {
		$gymcore_starter_remove_settings();
	}
} )();
