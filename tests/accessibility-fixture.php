<?php
/** Fresh fictional content for the isolated accessibility harness only. */
require '/wordpress/wp-load.php';
switch_theme( 'gymcore-starter' );
update_option( 'blogname', 'Example Training Community' );
update_option( 'blogdescription', 'Fictional accessibility review fixture' );
update_option( 'show_on_front', 'page' );
$front = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Welcome' ) );
$journal = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Journal' ) );
update_option( 'page_on_front', $front );
update_option( 'page_for_posts', $journal );
$long_text = str_repeat( 'A fictional training community welcomes new students and explains every step. ', 35 );
$content = '<!-- wp:paragraph --><p>' . esc_html( $long_text ) . '</p><!-- /wp:paragraph -->';
$content .= '<!-- wp:heading --><h2 class="wp-block-heading">Visit preparation</h2><!-- /wp:heading -->';
$content .= '<!-- wp:paragraph --><p><a href="#questions">Read visit questions</a> and <strong>bring a question</strong>.</p><!-- /wp:paragraph -->';
$content .= '<!-- wp:paragraph --><p>Long reference: ' . str_repeat( 'FictionalReference', 18 ) . '</p><!-- /wp:paragraph -->';
$content .= '<!-- wp:details {"anchor":"questions"} --><details class="wp-block-details" id="questions"><summary>What happens on a first visit?</summary><!-- wp:paragraph --><p>Discuss your goals with the fictional team.</p><!-- /wp:paragraph --></details><!-- /wp:details -->';
$page = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Accessibility long content and a welcoming introduction for everyone', 'post_content' => $content ) );
$category = wp_insert_term( 'Example announcements', 'category' );
$post = wp_insert_post( array( 'post_type' => 'post', 'post_status' => 'publish', 'post_title' => 'Accessibility practice journal', 'post_content' => $content, 'comment_status' => 'open', 'post_category' => array( $category['term_id'] ) ) );
wp_insert_comment( array( 'comment_post_ID' => $post, 'comment_author' => 'Example Reader', 'comment_content' => 'A fictional comment for keyboard and heading checks.', 'comment_approved' => 1 ) );
wp_mkdir_p( WPMU_PLUGIN_DIR );
// Test-only fallback route avoids changing theme files. Report the actual selected template.
file_put_contents( WPMU_PLUGIN_DIR . '/gcs-accessibility-fixture.php', '<?php add_filter("home_template_hierarchy", function($templates) { return isset($_GET["gcs_a11y_index"]) ? array("index.php") : $templates; }); add_filter("template_include", function($file) { header("X-GCS-A11y-Template: " . ($GLOBALS["_wp_current_template_id"] ?? "unknown")); return $file; });' );
echo 'GCS_A11Y_FIXTURE=' . wp_json_encode( array( 'wordpress' => get_bloginfo( 'version' ), 'php' => PHP_VERSION, 'routes' => array( 'front-page' => '/', 'home' => '/?page_id=' . $journal, 'index' => '/?page_id=' . $journal . '&gcs_a11y_index=1', 'page' => '/?page_id=' . $page, 'single' => '/?p=' . $post, 'archive' => '/?cat=' . $category['term_id'], 'search' => '/?s=Accessibility', '404' => '/?p=999999' ) ) );
