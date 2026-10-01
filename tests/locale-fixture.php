<?php
/** Test-only public schema and early-translation observer; never distribute. */
namespace Gym_Core\Schedule {
	class ClassPostType {}
}
namespace {
	add_action( 'doing_it_wrong_run', static function ( $function, $message ) {
		if ( '_load_textdomain_just_in_time' === $function && ( str_contains( $message, 'gymcore-starter' ) ) ) {
			file_put_contents( '/tmp/gcs-locale-early.txt', $function . "\n", FILE_APPEND );
		}
	}, 10, 2 );
	add_action( 'init', static function () {
		register_post_type( 'gym_class', array( 'public' => true, 'show_in_rest' => true, 'supports' => array( 'title' ) ) );
		foreach ( array( 'gym_program', 'gym_location' ) as $taxonomy ) {
			register_taxonomy( $taxonomy, 'gym_class', array( 'public' => true, 'show_in_rest' => true ) );
		}
	} );
}
