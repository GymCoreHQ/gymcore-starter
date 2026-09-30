<?php
/** Real multisite checks in a fictional, disposable network. */
require '/wordpress/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';
$checks = array();
function gcs_ms_assert($pass,$name) {global $checks; $checks[]=array('name'=>$name,'pass'=>(bool)$pass);}
wp_set_current_user(1);
gcs_ms_assert(is_multisite(), 'Real multisite network enabled');
$main=get_current_blog_id();
$sub=wp_insert_site(array('domain'=>get_site($main)->domain,'path'=>'/fictional-school/','title'=>'Fictional School'));
if(is_wp_error($sub)) {throw new Exception($sub->get_error_message());}
$before_main=wp_count_posts('page')->draft;
switch_to_blog($sub); $before_sub=wp_count_posts('page')->draft; restore_current_blog();
$activation=activate_plugin('gymcore-starter-kit/gymcore-starter-kit.php','',true);
gcs_ms_assert(!is_wp_error($activation) && is_plugin_active_for_network('gymcore-starter-kit/gymcore-starter-kit.php'),'Companion network activation succeeds');
gcs_ms_assert(wp_count_posts('page')->draft === $before_main,'Network activation creates no main-site drafts');
switch_to_blog($sub);
gcs_ms_assert(wp_count_posts('page')->draft === $before_sub,'Network activation creates no subsite drafts');
restore_current_blog();
$main_manifest=GymCoreStarter\import_demo();
gcs_ms_assert(!is_wp_error($main_manifest) && count($main_manifest['pages'])===4,'Main-site opt-in imports four drafts');
switch_to_blog($sub);
gcs_ms_assert(get_option('gcs_demo_manifest',null)===null,'Main-site manifest does not leak to subsite');
$sub_manifest=GymCoreStarter\import_demo();
gcs_ms_assert(!is_wp_error($sub_manifest) && count($sub_manifest['pages'])===4,'Subsite opt-in imports four drafts');
gcs_ms_assert($sub_manifest['token']!==$main_manifest['token'],'Each site has independent ownership token');
gcs_ms_assert(GymCoreStarter\import_demo()===$sub_manifest,'Subsite import is idempotent');
$sub_count=GymCoreStarter\reset_demo();
gcs_ms_assert($sub_count===4,'Subsite reset trashes only subsite drafts');
restore_current_blog();
gcs_ms_assert(get_post_status(reset($main_manifest['pages']))==='draft','Subsite reset preserves main-site draft');
// A non-super-admin site administrator may manage only their own authorized site.
$user=wp_insert_user(array('user_login'=>'fictional-site-admin','user_pass'=>'disposable-test-only','user_email'=>'site-admin@example.test'));
add_user_to_blog($sub,$user,'administrator');
wp_set_current_user($user);
gcs_ms_assert(is_wp_error(GymCoreStarter\import_demo()),'Subsite administrator cannot set up main site');
switch_to_blog($sub);
gcs_ms_assert(!is_wp_error(GymCoreStarter\import_demo()),'Subsite administrator can manage own site');
restore_current_blog(); wp_set_current_user(1);
// Only the subsite opts into option removal. Network deletion must respect each site.
update_option('gcs_options',array('remove_settings'=>false));
switch_to_blog($sub); update_option('gcs_options',array('remove_settings'=>true)); restore_current_blog();
$theme=get_option('stylesheet');
switch_theme('gymcore-starter');
gcs_ms_assert(wp_get_theme()->get_stylesheet()==='gymcore-starter' && wp_is_block_theme(),'Theme activates on main site');
switch_to_blog($sub); switch_theme('gymcore-starter');
gcs_ms_assert(wp_get_theme()->get_stylesheet()==='gymcore-starter' && wp_is_block_theme(),'Theme activates on subsite');
restore_current_blog();
deactivate_plugins('gymcore-starter-kit/gymcore-starter-kit.php',false,true);
gcs_ms_assert(get_option('gcs_demo_manifest')===$main_manifest,'Network deactivation retains main-site content manifest');
uninstall_plugin('gymcore-starter-kit/gymcore-starter-kit.php');
gcs_ms_assert(get_current_blog_id()===$main,'Network uninstall restores original site context');
gcs_ms_assert(get_option('gcs_demo_manifest')===$main_manifest,'Network uninstall preserves non-opted-in main-site settings');
gcs_ms_assert(get_post_status(reset($main_manifest['pages']))==='draft','Network uninstall preserves main-site content');
switch_to_blog($sub);
gcs_ms_assert(get_option('gcs_options',null)===null && get_option('gcs_demo_manifest',null)===null,'Network uninstall removes opted-in subsite options');
gcs_ms_assert(get_post_status(reset($sub_manifest['pages']))==='trash','Network uninstall preserves subsite content');
restore_current_blog();
echo 'GCS_MULTISITE='.wp_json_encode(array('wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION,'checks'=>$checks),JSON_PRETTY_PRINT);
