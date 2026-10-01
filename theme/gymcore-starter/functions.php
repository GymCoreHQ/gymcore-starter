<?php
/**
 * Local translation catalog support for private theme distributions.
 *
 * @package GymCore_Starter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Register the bundled catalog path without evaluating translated strings early. */
function gymcore_starter_load_textdomain(): void {
	load_theme_textdomain( 'gymcore-starter', get_template_directory() . '/languages' );
}
add_action( 'after_setup_theme', 'gymcore_starter_load_textdomain' );
