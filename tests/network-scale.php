<?php
/** Disposable real-network pagination and exception-restoration regression. */
require '/wordpress/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';
wp_set_current_user(1);
$checks = array();
function gcs_scale_assert($value,$name) {global $checks; $checks[]=array('name'=>$name,'pass'=>(bool)$value);}
$main=get_current_blog_id();
$domain=get_site($main)->domain;
$fixtures=array();
$started=microtime(true);
for($i=0;$i<103;$i++) {
 $site=wp_insert_site(array('domain'=>$domain,'path'=>'/fictional-site-'.$i.'/','title'=>'Fictional Site '.$i));
 if(is_wp_error($site)) {throw new Exception($site->get_error_message());}
 switch_to_blog($site);
 $opt_in=0 === $i%2;
 update_option('gcs_options',array('remove_settings'=>$opt_in));
 update_option('gcs_demo_manifest',array('token'=>'fictional-'.$i,'pages'=>array()));
 update_option('gcs_setup_lock',array('started'=>1));
 $page=wp_insert_post(array('post_type'=>'page','post_status'=>'draft','post_title'=>'Fictional retained draft'),true);
 if(is_wp_error($page)) {throw new Exception($page->get_error_message());}
 $fixtures[]=array('id'=>$site,'opt_in'=>$opt_in,'page'=>$page);
 restore_current_blog();
}
gcs_scale_assert(count(get_sites(array('fields'=>'ids','number'=>0)))===104,'104 real initialized sites cross the 100-site batch boundary');
update_option('gcs_options',array('remove_settings'=>false));
update_option('gcs_demo_manifest',array('token'=>'fictional-main','pages'=>array()));
activate_plugin('gymcore-starter-kit/gymcore-starter-kit.php','',true);
deactivate_plugins('gymcore-starter-kit/gymcore-starter-kit.php',false,true);
$uninstall_started=microtime(true);
uninstall_plugin('gymcore-starter-kit/gymcore-starter-kit.php');
$uninstall_seconds=microtime(true)-$uninstall_started;
gcs_scale_assert(get_current_blog_id()===$main && !ms_is_switched(),'Uninstall restores calling blog and switch stack');
gcs_scale_assert(get_option('gcs_demo_manifest')['token']==='fictional-main','Non-opted-in main-site settings retained');
foreach($fixtures as $fixture) {
 switch_to_blog($fixture['id']);
 $removed=get_option('gcs_options',null)===null && get_option('gcs_demo_manifest',null)===null && get_option('gcs_setup_lock',null)===null;
 $retained=get_option('gcs_options',null)!==null && get_option('gcs_demo_manifest',null)!==null && get_option('gcs_setup_lock',null)!==null;
 gcs_scale_assert($fixture['opt_in']?$removed:$retained,'Site '.$fixture['id'].' respects individual cleanup preference');
 gcs_scale_assert(get_post_status($fixture['page'])==='draft','Site '.$fixture['id'].' retains content');
 restore_current_blog();
}
// Inject one failure from a normal WordPress option hook, then verify finally restoration.
$failure_site=$fixtures[0]['id'];
switch_to_blog($failure_site); update_option('gcs_options',array('remove_settings'=>true)); restore_current_blog();
$thrower=static function($option) use($failure_site) {if($option==='gcs_options' && get_current_blog_id()===$failure_site) {throw new RuntimeException('Fictional cleanup hook failure');}};
add_action('delete_option',$thrower);
$caught=false;
try {include WP_PLUGIN_DIR.'/gymcore-starter-kit/uninstall.php';} catch(RuntimeException $error) {$caught=$error->getMessage()==='Fictional cleanup hook failure';}
remove_action('delete_option',$thrower);
gcs_scale_assert($caught,'Injected option-hook failure is observable');
gcs_scale_assert(get_current_blog_id()===$main && !ms_is_switched(),'Exception still restores original site and switch stack');
echo 'GCS_MULTISITE='.wp_json_encode(array('wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION,'sites'=>104,'uninstall_seconds'=>round($uninstall_seconds,3),'total_seconds'=>round(microtime(true)-$started,3),'checks'=>$checks),JSON_PRETTY_PRINT);
