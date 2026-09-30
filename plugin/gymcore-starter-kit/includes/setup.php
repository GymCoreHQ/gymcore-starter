<?php
/**
 * Explicit, reversible draft setup using WordPress content and settings APIs.
 *
 * @package GymCoreStarter
 */

declare(strict_types=1);

namespace GymCoreStarter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Register the native Settings page. */
function admin_menu(): void {
	add_options_page( __( 'GymCore Starter', 'gymcore-starter-kit' ), __( 'GymCore Starter', 'gymcore-starter-kit' ), 'manage_options', 'gymcore-starter', __NAMESPACE__ . '\\admin_page' );
}

/** Register uninstall preference with the Settings API. */
function register_settings(): void {
	register_setting(
		'gcs_settings',
		'gcs_options',
		array(
			'type'              => 'object',
			'default'           => array( 'remove_settings' => false ),
			'sanitize_callback' => __NAMESPACE__ . '\\sanitize_options',
		)
	);
}

/**
 * Sanitize only known preferences.
 *
 * @param mixed $input Submitted value.
 * @return array<string, bool> Sanitized preferences.
 */
function sanitize_options( $input ): array {
	return array( 'remove_settings' => is_array( $input ) && ! empty( $input['remove_settings'] ) );
}

/**
 * Build fictional draft content, never live operational data.
 *
 * @return array<string, array<string, string>> Starter page definitions.
 */
function demo_pages(): array {
	return array(
		'welcome'  => array(
			'title'   => __( 'Example Academy — welcome', 'gymcore-starter-kit' ),
			'content' => '<!-- wp:heading --><h2 class="wp-block-heading">' . esc_html__( 'A place to begin', 'gymcore-starter-kit' ) . '</h2><!-- /wp:heading --><!-- wp:paragraph --><p>' . esc_html__( 'Fictional example content. Introduce your school, describe your teaching approach, and replace this text before publishing.', 'gymcore-starter-kit' ) . '</p><!-- /wp:paragraph -->',
		),
		'programs' => array(
			'title'   => __( 'Example Academy — programs', 'gymcore-starter-kit' ),
			'content' => '<!-- wp:heading --><h2 class="wp-block-heading">' . esc_html__( 'Foundations program', 'gymcore-starter-kit' ) . '</h2><!-- /wp:heading --><!-- wp:paragraph --><p>' . esc_html__( 'Fictional example. Describe who this program serves, prerequisites, and what a first visit involves. Add your own program pages using the page editor.', 'gymcore-starter-kit' ) . '</p><!-- /wp:paragraph -->',
		),
		'schedule' => array(
			'title'   => __( 'Example Academy — schedule', 'gymcore-starter-kit' ),
			'content' => '<!-- wp:paragraph --><p>' . esc_html__( 'This draft contains a live schedule block. Configure real classes in GymCore before publishing; no example classes are imported.', 'gymcore-starter-kit' ) . '</p><!-- /wp:paragraph --><!-- wp:gymcore-starter/weekly-schedule /-->',
		),
		'contact'  => array(
			'title'   => __( 'Example Academy — visit', 'gymcore-starter-kit' ),
			'content' => '<!-- wp:heading --><h2 class="wp-block-heading">' . esc_html__( 'Plan your first visit', 'gymcore-starter-kit' ) . '</h2><!-- /wp:heading --><!-- wp:paragraph --><p>' . esc_html__( 'Fictional example. Add your public contact details, access information, and opening hours here. Use your chosen form plugin if you need a contact form.', 'gymcore-starter-kit' ) . '</p><!-- /wp:paragraph -->',
		),
	);
}

/**
 * Import drafts once. Partial imports may safely resume; existing content is never overwritten.
 *
 * @return array|\WP_Error Manifest or failure.
 */
function import_demo() {
	if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'edit_pages' ) ) {
		return new \WP_Error( 'forbidden', __( 'You cannot create starter pages.', 'gymcore-starter-kit' ) );
	}
	// Atomic option creation prevents concurrent setup requests from duplicating pages.
	if ( ! add_option( 'gcs_setup_lock', time(), '', false ) ) {
		return new \WP_Error( 'locked', __( 'Setup is already running. If interrupted, remove the gcs_setup_lock option using WP-CLI after verifying no setup is active.', 'gymcore-starter-kit' ) );
	}
	try {
		$manifest = get_option( 'gcs_demo_manifest', array() );
		if ( ! is_array( $manifest ) || empty( $manifest['token'] ) ) {
			$manifest = array(
				'token' => wp_generate_uuid4(),
				'pages' => array(),
			);
			update_option( 'gcs_demo_manifest', $manifest, false );
		}
		foreach ( demo_pages() as $key => $page ) {
			if ( isset( $manifest['pages'][ $key ] ) ) {
				continue;
			}
			// Recover a page inserted before a request was interrupted while saving the manifest.
			$existing = get_posts(
				array(
					'post_type'   => 'page',
					'post_status' => 'any',
					'numberposts' => 1,
					'fields'      => 'ids',
					'meta_query'  => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Bounded administrator-only import recovery.
						array(
							'key'   => '_gcs_demo_token',
							'value' => $manifest['token'],
						),
						array(
							'key'   => '_gcs_demo_key',
							'value' => $key,
						),
					),
				)
			);
			$id       = $existing ? (int) $existing[0] : wp_insert_post(
				array(
					'post_type'    => 'page',
					'post_status'  => 'draft',
					'post_title'   => $page['title'],
					'post_content' => $page['content'],
					'post_author'  => get_current_user_id(),
					'meta_input'   => array(
						'_gcs_demo_token' => $manifest['token'],
						'_gcs_demo_key'   => $key,
					),
				),
				true
			);
			if ( is_wp_error( $id ) ) {
				return $id;
			}
			$manifest['pages'][ $key ] = $id;
			update_option( 'gcs_demo_manifest', $manifest, false );
		}
		return $manifest;
	} finally {
		delete_option( 'gcs_setup_lock' );
	}
}

/**
 * Trash only still-draft pages whose ownership marker matches the import manifest.
 * Edited drafts are included only after explicit administrator confirmation.
 * Published, private, scheduled, trashed and unrelated content is preserved.
 *
 * @return int|\WP_Error Count moved to Trash or authorization failure.
 */
function reset_demo() {
	if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'delete_pages' ) ) {
		return new \WP_Error( 'forbidden', __( 'You cannot remove starter drafts.', 'gymcore-starter-kit' ) );
	}
	// Without Trash enabled, wp_trash_post() permanently deletes. Refuse that configuration.
	if ( ! defined( 'EMPTY_TRASH_DAYS' ) || EMPTY_TRASH_DAYS < 1 ) {
		return new \WP_Error( 'trash_disabled', __( 'Enable WordPress Trash before removing drafts.', 'gymcore-starter-kit' ) );
	}
	if ( ! add_option( 'gcs_setup_lock', time(), '', false ) ) {
		return new \WP_Error( 'locked', __( 'Setup is already running.', 'gymcore-starter-kit' ) );
	}
	try {
		$manifest = get_option( 'gcs_demo_manifest', array() );
		$count    = 0;
		foreach ( $manifest['pages'] ?? array() as $id ) {
			if ( 'draft' === get_post_status( $id ) && current_user_can( 'delete_post', $id ) && ! empty( $manifest['token'] ) && get_post_meta( $id, '_gcs_demo_token', true ) === $manifest['token'] ) {
				if ( wp_trash_post( $id ) ) {
					++$count;
				}
			}
		}
		// Keep the manifest so repeat setup cannot create duplicates, even after reset.
		return $count;
	} finally {
		delete_option( 'gcs_setup_lock' );
	}
}

/** Authorize browser setup and render a safe result redirect. */
function handle_import(): void {
	if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'edit_pages' ) ) {
		wp_die( esc_html__( 'You cannot create starter pages.', 'gymcore-starter-kit' ), '', array( 'response' => 403 ) );
	}
	check_admin_referer( 'gcs_import' );
	$result = import_demo();
	if ( is_wp_error( $result ) ) {
		wp_die( esc_html( $result->get_error_message() ) );
	}
	wp_safe_redirect( admin_url( 'options-general.php?page=gymcore-starter' ) );
	exit;
}

/** Authorize explicit reversible removal. */
function handle_reset(): void {
	if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'delete_pages' ) ) {
		wp_die( esc_html__( 'You cannot remove starter drafts.', 'gymcore-starter-kit' ), '', array( 'response' => 403 ) );
	}
	check_admin_referer( 'gcs_reset' );
	if ( ! isset( $_POST['gcs_confirm'] ) || 'yes' !== sanitize_text_field( wp_unslash( $_POST['gcs_confirm'] ) ) ) {
		wp_die( esc_html__( 'Confirm that imported drafts may be moved to Trash.', 'gymcore-starter-kit' ) );
	}
	$result = reset_demo();
	if ( is_wp_error( $result ) ) {
		wp_die( esc_html( $result->get_error_message() ) );
	}
	wp_safe_redirect( admin_url( 'options-general.php?page=gymcore-starter' ) );
	exit;
}

/** Render the native setup/settings screen. */
function admin_page(): void {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$options  = get_option( 'gcs_options', array() );
	$manifest = get_option( 'gcs_demo_manifest', array() );
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'GymCore Starter', 'gymcore-starter-kit' ); ?></h1>
		<p><?php esc_html_e( 'Use Appearance → Editor for styles, navigation and templates. Use Pages to edit site content. No content is created on activation.', 'gymcore-starter-kit' ); ?></p>
		<h2><?php esc_html_e( 'Optional integrations', 'gymcore-starter-kit' ); ?></h2>
		<p><?php echo post_type_exists( 'gym_class' ) ? esc_html__( 'GymCore class content is registered. Configure published active classes in GymCore for the weekly schedule.', 'gymcore-starter-kit' ) : esc_html__( 'GymCore class content is unavailable. The weekly schedule will show an empty state. Install and configure an authorized GymCore package separately if needed.', 'gymcore-starter-kit' ); ?></p>
		<p><?php esc_html_e( 'WooCommerce is optional for this starter. Configure products, cart, checkout and account pages with WooCommerce. GymCore may have its own WooCommerce and license requirements; this kit does not change them.', 'gymcore-starter-kit' ); ?></p>
		<h2><?php esc_html_e( 'Fictional draft pages', 'gymcore-starter-kit' ); ?></h2>
		<p><?php esc_html_e( 'Create four clearly fictional draft pages once. Review and replace the content before publishing. Existing pages, menus, homepage settings, users, products and classes are not changed.', 'gymcore-starter-kit' ); ?></p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="gcs_import">
			<?php
			wp_nonce_field( 'gcs_import' );
			submit_button( __( 'Create or resume draft setup', 'gymcore-starter-kit' ) );
			?>
		</form>
		<ul>
		<?php foreach ( $manifest['pages'] ?? array() as $id ) : ?>
			<?php if ( get_post( $id ) && current_user_can( 'edit_post', $id ) ) : ?>
			<li><a href="<?php echo esc_url( get_edit_post_link( $id ) ); ?>"><?php echo esc_html( get_the_title( $id ) ); ?></a> — <?php echo esc_html( get_post_status( $id ) ); ?></li>
			<?php endif; ?>
		<?php endforeach; ?>
		</ul>
		<h2><?php esc_html_e( 'Remove imported drafts', 'gymcore-starter-kit' ); ?></h2>
		<p><?php esc_html_e( 'This moves only imported pages that are still drafts to Trash, including edits to those drafts. Published and unrelated content stays. Restore from Pages → Trash. The import record remains to prevent duplicates.', 'gymcore-starter-kit' ); ?></p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="gcs_reset">
			<?php wp_nonce_field( 'gcs_reset' ); ?>
			<label><input type="checkbox" name="gcs_confirm" value="yes" required> <?php esc_html_e( 'I understand that imported drafts and their edits will move to Trash.', 'gymcore-starter-kit' ); ?></label>
			<?php submit_button( __( 'Move imported drafts to Trash', 'gymcore-starter-kit' ), 'secondary' ); ?>
		</form>
		<h2><?php esc_html_e( 'Uninstall preference', 'gymcore-starter-kit' ); ?></h2>
		<form method="post" action="options.php">
			<?php settings_fields( 'gcs_settings' ); ?>
			<label><input type="checkbox" name="gcs_options[remove_settings]" value="1" <?php checked( ! empty( $options['remove_settings'] ) ); ?>> <?php esc_html_e( 'Delete starter settings and import record when uninstalling. Content always remains. Reinstalling after deleting the import record can create new drafts.', 'gymcore-starter-kit' ); ?></label>
			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}
