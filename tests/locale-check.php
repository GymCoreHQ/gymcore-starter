<?php
/** Actual WordPress catalog loading checks in the disposable locale fixture. */
require '/wordpress/wp-load.php';
$locale = get_locale();
$expected = '[TEST-' . $locale . ']';
$block = WP_Block_Type_Registry::get_instance()->get_registered( 'gymcore-starter/weekly-schedule' );
$theme = __( 'Make room for your next chapter.', 'gymcore-starter' );
$plugin = __( 'GymCore Starter', 'gymcore-starter-kit' );
$pattern = WP_Block_Patterns_Registry::get_instance()->get_registered( 'gymcore-starter/hero' );
$schedule = do_blocks( '<!-- wp:gymcore-starter/weekly-schedule /-->' );
echo 'GCS_LOCALE_CHECK=' . wp_json_encode( array(
	'locale' => $locale,
	'rtl' => is_rtl(),
	'wordpress' => get_bloginfo( 'version' ),
	'php' => PHP_VERSION,
	'official_core_catalog' => file_exists( WP_LANG_DIR . '/' . $locale . '.mo' ) || file_exists( WP_LANG_DIR . '/' . $locale . '.l10n.php' ),
	'theme_php' => str_contains( $theme, $expected ),
	'plugin_php' => str_contains( $plugin, $expected ),
	'pattern_php' => str_contains( $pattern['content'], $expected ),
	'plural_php' => str_contains( $schedule, $expected . ' 2 ' ),
	'editor_handle' => $block->editor_script_handles[0],
	'early_translation_warning' => file_exists( '/tmp/gcs-locale-early.txt' ),
) );
