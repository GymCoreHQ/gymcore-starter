<?php
/** Narrow native content-persistence check; not a browser Site Editor or ZIP-upgrade test. */
require '/wordpress/wp-load.php';
$theme = 'gymcore-starter';
$before_pages = get_posts( array( 'post_type' => array( 'post', 'page' ), 'post_status' => 'publish', 'numberposts' => -1 ) );
$before = array();
foreach ( $before_pages as $post ) {
 $before[ $post->ID ] = hash( 'sha256', $post->post_title . $post->post_content );
}
$content = '<!-- wp:group {"tagName":"main"} --><main class="wp-block-group"><!-- wp:heading {"level":1} --><h1 class="wp-block-heading">Example customized page</h1><!-- /wp:heading --><!-- wp:post-content /--></main><!-- /wp:group -->';
$template_id = wp_insert_post( array( 'post_type' => 'wp_template', 'post_status' => 'publish', 'post_name' => 'page', 'post_title' => 'Example saved page template', 'post_content' => $content, 'tax_input' => array( 'wp_theme' => array( $theme ) ) ) );
// This test calls native APIs without an authenticated editor; set terms explicitly.
wp_set_object_terms( $template_id, $theme, 'wp_theme' );
$styles_id = WP_Theme_JSON_Resolver::get_user_global_styles_post_id();
$styles_before = get_post( $styles_id )->post_content;
$alternates = array_diff( array_keys( wp_get_themes() ), array( $theme ) );
$alternate = reset( $alternates );
if ( $alternate ) {
 switch_theme( $alternate );
 switch_theme( $theme );
}
wp_clean_theme_json_cache();
$saved = get_block_template( $theme . '//page', 'wp_template' );
$unchanged = true;
foreach ( $before as $id => $hash ) {
 $post = get_post( $id );
 $unchanged = $unchanged && $post && hash_equals( $hash, hash( 'sha256', $post->post_title . $post->post_content ) );
}
echo 'GCS_A11Y_PERSISTENCE=' . wp_json_encode( array( 'alternateTheme' => $alternate, 'templateId' => $template_id, 'templateSource' => $saved->source ?? null, 'templateContentPreserved' => isset( $saved->content ) && $saved->content === $content, 'globalStylesPreserved' => get_post( $styles_id )->post_content === $styles_before, 'publishedContentPreserved' => $unchanged, 'limitations' => 'Native API creation plus theme switch/reactivation only. No interactive Site Editor save, source-file upgrade, or ZIP upgrade was performed.' ) );
