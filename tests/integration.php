<?php
/** Runs only in the disposable Playground database. */
require '/wordpress/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';
$checks = array();
function gcs_assert($condition, $name) { global $checks; $checks[] = array('name' => $name, 'pass' => (bool) $condition); }
if (class_exists('WooCommerce')) { gcs_assert(defined('WC_VERSION') && WC_VERSION === '11.1.2', 'WooCommerce 11.1.2 active'); }
$before = wp_count_posts('page');
$result = activate_plugin('gymcore-starter-kit/gymcore-starter-kit.php');
gcs_assert(!is_wp_error($result), 'Plugin activates');
switch_theme('gymcore-starter');
gcs_assert(wp_get_theme()->get_stylesheet() === 'gymcore-starter', 'Block theme activates');
gcs_assert($before == wp_count_posts('page'), 'Activation creates no pages');
// Activation occurs after init in this request; explicitly register metadata once.
if (!WP_Block_Type_Registry::get_instance()->is_registered('gymcore-starter/weekly-schedule')) { GymCoreStarter\schedule_register(); }
gcs_assert(WP_Block_Type_Registry::get_instance()->is_registered('gymcore-starter/weekly-schedule'), 'Block metadata registers');
gcs_assert(str_contains(GymCoreStarter\schedule_render(), 'unavailable'), 'No GymCore dependency: safe unavailable state');
wp_set_current_user(0);
gcs_assert(is_wp_error(GymCoreStarter\import_demo()), 'Anonymous importer denied');
gcs_assert(is_wp_error(GymCoreStarter\reset_demo()), 'Anonymous reset denied');
$subscriber = wp_create_user('fixture-subscriber', wp_generate_password(), 'subscriber@example.invalid');
(new WP_User($subscriber))->set_role('subscriber');
wp_set_current_user($subscriber);
gcs_assert(is_wp_error(GymCoreStarter\import_demo()), 'Subscriber importer denied');
gcs_assert(is_wp_error(GymCoreStarter\reset_demo()), 'Subscriber reset denied');
wp_set_current_user(1);
$manifest = GymCoreStarter\import_demo();
gcs_assert(!is_wp_error($manifest) && count($manifest['pages']) === 4, 'Administrator imports four drafts');
gcs_assert(count(array_filter($manifest['pages'], fn($id) => get_post_status($id) === 'draft')) === 4, 'All imported pages remain drafts');
gcs_assert(GymCoreStarter\import_demo() === $manifest, 'Import is idempotent');
$ids = array_values($manifest['pages']);
wp_update_post(array('ID'=>$ids[0], 'post_status'=>'publish'));
update_post_meta($ids[1], '_gcs_demo_token', 'unrelated-owner');
$unrelated = wp_insert_post(array('post_type'=>'page','post_status'=>'draft','post_title'=>'Unrelated fixture'));
if (EMPTY_TRASH_DAYS < 1) {
 $reset = GymCoreStarter\reset_demo();
 gcs_assert(is_wp_error($reset) && $reset->get_error_code() === 'trash_disabled', 'Trash disabled: reset refuses deletion');
 gcs_assert(get_post_status($ids[2]) === 'draft', 'Trash disabled: draft preserved');
} else {
 gcs_assert(GymCoreStarter\reset_demo() === 2, 'Reset trashes only two owned drafts');
 gcs_assert(get_post_status($ids[2]) === 'trash', 'Reset uses recoverable Trash');
 gcs_assert(GymCoreStarter\reset_demo() === 0, 'Reset is idempotent');
}
gcs_assert(get_post_status($ids[0]) === 'publish', 'Reset preserves published import');
gcs_assert(get_post_status($ids[1]) === 'draft', 'Reset preserves mismatched ownership');
gcs_assert(get_post_status($unrelated) === 'draft', 'Reset preserves unrelated draft');
gcs_assert(GymCoreStarter\import_demo() === $manifest, 'Reset retains manifest; no duplicate reimport');
// A contract fixture, not the GymCore product or an entitlement simulation.
if (!class_exists('Gym_Core\\Schedule\\ClassPostType')) { eval('namespace Gym_Core\\Schedule; class ClassPostType {}'); }
register_post_type('gym_class', array('public'=>true));
register_taxonomy('gym_program','gym_class',array('public'=>true));
register_taxonomy('gym_location','gym_class',array('public'=>true));
$program = wp_insert_term('Fixture Program', 'gym_program')['term_id'];
$other = wp_insert_term('Other Program', 'gym_program')['term_id'];
function gcs_class($title, $status='publish', $active='active', $day='monday', $time='18:00', $recurrence='weekly', $password='') {
 return wp_insert_post(array('post_type'=>'gym_class','post_status'=>$status,'post_title'=>$title,'post_password'=>$password,'meta_input'=>array('_gym_class_status'=>$active,'_gym_class_day_of_week'=>$day,'_gym_class_start_time'=>$time,'_gym_class_recurrence'=>$recurrence)));
}
$a = gcs_class('Visible <script>alert(1)</script>');
$wpdb->update($wpdb->posts,array('post_title'=>'Visible <script>alert(1)</script>'),array('ID'=>$a)); clean_post_cache($a);
wp_set_object_terms($a, array($program), 'gym_program');
$b = gcs_class('Tuesday fixture', 'publish','active','tuesday');
wp_set_object_terms($b, array($other), 'gym_program');
gcs_class('Private fixture','private'); gcs_class('Draft fixture','draft'); gcs_class('Inactive fixture','publish','inactive'); gcs_class('One-off fixture','publish','active','monday','18:00','once'); gcs_class('Bad time fixture','publish','active','monday','25:00'); gcs_class('Password fixture','publish','active','monday','18:00','weekly','secret');
$render = GymCoreStarter\schedule_render();
gcs_assert(str_contains($render,'2 weekly classes'), 'Only two published active weekly valid-time unprotected fixtures counted');
gcs_assert(!str_contains($render,'<script>'), 'Class title HTML escaped');
gcs_assert(!str_contains($render,'Private fixture') && !str_contains($render,'Draft fixture') && !str_contains($render,'Inactive fixture') && !str_contains($render,'Password fixture'), 'Nonpublic/inactive content excluded');
$filtered = GymCoreStarter\schedule_render(array('day'=>'monday','programId'=>$program));
gcs_assert(str_contains($filtered,'1 weekly class') && !str_contains($filtered,'Tuesday fixture'), 'Day and taxonomy filters affect display and count');
$empty = GymCoreStarter\schedule_render(array('day'=>'friday'));
gcs_assert(str_contains($empty,'0 weekly classes') && str_contains($empty,'No weekly classes'), 'Filtered empty state truthful');
$markup='<!-- wp:gymcore-starter/weekly-schedule {"day":"monday","programId":'.(int)$program.'} /-->';
gcs_assert(serialize_blocks(parse_blocks($markup)) === $markup, 'PHP block serialization round-trips');
// Exercise the actual uninstall entry point in this throwaway site.
define('WP_UNINSTALL_PLUGIN', 'gymcore-starter-kit/gymcore-starter-kit.php');
update_option('gcs_options', array('remove_settings'=>false));
require WP_PLUGIN_DIR . '/gymcore-starter-kit/uninstall.php';
gcs_assert(get_option('gcs_demo_manifest') === $manifest && is_array(get_option('gcs_options')), 'Default uninstall retains settings and import record');
gcs_assert(get_post_status($ids[0]) === 'publish' && get_post($unrelated) !== null, 'Default uninstall preserves all content');
update_option('gcs_options', array('remove_settings'=>true));
add_option('gcs_setup_lock', time());
require WP_PLUGIN_DIR . '/gymcore-starter-kit/uninstall.php';
gcs_assert(get_option('gcs_options', null) === null && get_option('gcs_demo_manifest', null) === null && get_option('gcs_setup_lock', null) === null, 'Opt-in uninstall removes only starter options');
gcs_assert(get_post_status($ids[0]) === 'publish' && get_post($ids[2]) !== null && get_post($unrelated) !== null, 'Opt-in uninstall preserves published, draft/trashed, and unrelated content');
update_option('blogname', 'Example Academy');
wp_set_password('disposable-test-only-password', 1);
echo "GCS_RESULTS=" . wp_json_encode(array('wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION,'woocommerce'=>defined('WC_VERSION') ? WC_VERSION : null,'trash_days'=>EMPTY_TRASH_DAYS,'checks'=>$checks), JSON_PRETTY_PRINT);
