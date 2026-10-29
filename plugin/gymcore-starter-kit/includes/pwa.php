<?php
/**
 * Declare public schedule pages for GymCore's offline timetable.
 *
 * Only public, published pages are eligible; drafts, private and password-protected pages
 * are never included because GymCore fetches offline pages signed-out. The theme intentionally
 * ships no PWA files; the companion plugin declares its schedule pages instead.
 *
 * @package GymCoreStarter
 */

namespace GymCoreStarter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Append published pages containing the weekly schedule block.
 *
 * @param mixed $pages Existing offline page declarations.
 * @return array Offline page declarations including public schedule pages.
 */
function pwa_offline_pages( $pages ): array {
	if ( ! is_array( $pages ) ) {
		$pages = array();
	}
	$matches = array();
	foreach ( get_posts(
		array(
			// The 20-row window must not hide the schedule page on large sites.
			'post_type'        => 'page',
			'post_status'      => 'publish',
			'has_password'     => false,
			's'                => '<!-- wp:gymcore-starter/weekly-schedule',
			'search_columns'   => array( 'post_content' ),
			'sentence'         => true,
			'posts_per_page'   => 20,
			'orderby'          => 'menu_order title',
			'order'            => 'ASC',
			'no_found_rows'    => true,
			'suppress_filters' => false,
		)
	) as $post ) {
		if ( has_block( 'gymcore-starter/weekly-schedule', $post ) ) {
			$matches[] = $post;
			if ( 2 === count( $matches ) ) {
				break;
			}
		}
	}
	foreach ( $matches as $post ) {
		$permalink = get_permalink( $post );
		if ( $permalink ) {
			$pages[] = array(
				'url'   => $permalink,
				'label' => get_the_title( $post ),
			);
		}
	}
	return $pages;
}
