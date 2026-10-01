<?php
/** Optional official review-tool smoke; never a claim of directory approval. */
require '/wordpress/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';
require_once WP_PLUGIN_DIR . '/theme-check/checkbase.php';
$passed = run_themechecks_against_theme(wp_get_theme('gymcore-starter'), 'gymcore-starter');
$theme_findings = array();
foreach ($themechecks as $check) { foreach ((array) $check->getError() as $finding) { $theme_findings[] = wp_strip_all_tags($finding); } }
$out = array('theme_check_version'=>get_plugin_data(WP_PLUGIN_DIR . '/theme-check/theme-check.php')['Version'], 'theme_check_pass'=>(bool)$passed, 'theme_findings'=>$theme_findings);
$out['plugin_check_not_run'] = 'PCP is intentionally excluded from this SQLite/WASM harness. See docs/runtime-report.md for observed limitations; run official PCP on native PHP/MySQL.';
echo 'GCS_DIRECTORY=' . wp_json_encode($out, JSON_PRETTY_PRINT);
