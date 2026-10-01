<?php
/** Uses actual GymCore registrations; never supplies substitute classes or gates. */
require '/wordpress/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';
wp_set_current_user(1);
$checks=array();
function canonical_assert($condition,$name) { global $checks; $checks[]=array('name'=>$name,'pass'=>(bool)$condition); }
$out=array('stage'=>'GCS_STAGE_VALUE','wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION,'woocommerce'=>defined('WC_VERSION')?WC_VERSION:null);
if ($out['stage']==='activate') {
 $activated=activate_plugin('gym-core/gym-core.php');
 canonical_assert(!is_wp_error($activated) && is_plugin_active('gym-core/gym-core.php'),'Real GymCore activation');
 $starter=activate_plugin('gymcore-starter-kit/gymcore-starter-kit.php');
 canonical_assert(!is_wp_error($starter),'Starter activates alongside GymCore');
} else {
 canonical_assert(is_plugin_active('gym-core/gym-core.php'),'Real GymCore active on fresh request');
 canonical_assert(class_exists('Gym_Core\\Schedule\\ClassPostType'),'Real class provider autoloaded');
 canonical_assert(post_type_exists('gym_class') && is_post_type_viewable('gym_class'),'Real public gym_class registration');
 canonical_assert(taxonomy_exists('gym_program') && taxonomy_exists('gym_location'),'Real program and location taxonomy registration');
 canonical_assert(!defined('GYMCORE_LICENSE_BYPASS'),'No entitlement bypass constant');
 canonical_assert(!get_option('gym_core_license_key'),'No license key installed');
 $out['gymcore_version']=defined('GYM_CORE_VERSION')?GYM_CORE_VERSION:null;
 if(class_exists('Gym_Core\\Plugin')) {
  $license=Gym_Core\Plugin::instance()->get_license_manager();
  $state=$license->get_status();
  $out['license_state']=array('status'=>$state['status']??null,'tier'=>$state['tier']??null);
  canonical_assert(($state['status']??'')!=='active','Entitlements remain naturally inactive');
 }
 $out['schema']=array('class_rest'=>get_post_type_object('gym_class')->rest_base??null,'taxonomies'=>get_object_taxonomies('gym_class'),'meta_keys'=>array_keys(get_registered_meta_keys('post','gym_class')));
 if(post_type_exists('gym_class') && taxonomy_exists('gym_program') && taxonomy_exists('gym_location')) {
  canonical_assert(current_user_can('gymcore_manage_curriculum'),'Real administrator curriculum capability');
  $program=wp_insert_term('Fictional Test Program','gym_program');
  $location=wp_insert_term('Fictional Test Room','gym_location');
  if(!is_wp_error($program) && !is_wp_error($location) && current_user_can('gymcore_manage_curriculum')) {
   $id=wp_insert_post(array('post_type'=>'gym_class','post_status'=>'publish','post_title'=>'Fictional canonical schedule test','meta_input'=>array('_gym_class_status'=>'active','_gym_class_recurrence'=>'weekly','_gym_class_day_of_week'=>'monday','_gym_class_start_time'=>'18:00','_gym_class_end_time'=>'19:00')),true);
   canonical_assert(!is_wp_error($id),'Synthetic class inserted through WordPress content API');
   if(!is_wp_error($id)) {
    wp_set_object_terms($id,array((int)$program['term_id']),'gym_program'); wp_set_object_terms($id,array((int)$location['term_id']),'gym_location');
    $markup=GymCoreStarter\schedule_render(array('day'=>'monday','programId'=>(int)$program['term_id'],'locationId'=>(int)$location['term_id']));
    canonical_assert(str_contains($markup,'1 weekly class') && str_contains($markup,'Fictional canonical schedule test') && str_contains($markup,'Fictional Test Room'),'Starter renders filtered synthetic data from actual GymCore schema');
    wp_update_post(array('ID'=>$id,'post_status'=>'draft'));
    canonical_assert(str_contains(GymCoreStarter\schedule_render(),'0 weekly classes'),'Real-schema unpublished class excluded');
   }
  } else { canonical_assert(false,'Synthetic fixtures permitted through real schema and normal capability'); $out['fixture_blocker']='Taxonomy insertion or normal curriculum capability denied; no overrides attempted.'; }
 }
}
$out['blocked_http_hosts']=get_option('gcs_test_blocked_hosts',array());
$out['last_database_error']=$wpdb->last_error;
$out['checks']=$checks;
echo 'GCS_CANONICAL='.wp_json_encode($out,JSON_PRETTY_PRINT);
