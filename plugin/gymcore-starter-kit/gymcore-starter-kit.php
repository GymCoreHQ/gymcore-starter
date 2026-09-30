<?php
/**
 * Plugin Name: GymCore Starter Kit
 * Description: Optional draft-page setup and a weekly schedule block for GymCore sites.
 * Version: 0.1.0
 * Requires at least: 7.0
 * Requires PHP: 8.3
 * Author: GymCoreHQ
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: gymcore-starter-kit
 *
 * @package GymCoreStarter
 */

declare(strict_types=1);

namespace GymCoreStarter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/includes/setup.php';
require_once __DIR__ . '/includes/schedule.php';

add_action( 'admin_menu', __NAMESPACE__ . '\\admin_menu' );
add_action( 'admin_init', __NAMESPACE__ . '\\register_settings' );
add_action( 'admin_post_gcs_import', __NAMESPACE__ . '\\handle_import' );
add_action( 'admin_post_gcs_reset', __NAMESPACE__ . '\\handle_reset' );
add_action( 'init', __NAMESPACE__ . '\\schedule_register', 20 );
