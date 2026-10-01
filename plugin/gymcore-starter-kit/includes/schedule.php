<?php
/**
 * Read-only adapter for GymCore's public recurring class records.
 *
 * @package GymCoreStarter
 */

namespace GymCoreStarter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Register after GymCore registers its content types; never register them ourselves. */
function schedule_register(): void {
	$block = register_block_type(
		dirname( __DIR__ ) . '/blocks/weekly-schedule',
		array( 'render_callback' => __NAMESPACE__ . '\\schedule_render' )
	);
	if ( $block && ! empty( $block->editor_script_handles[0] ) ) {
		wp_set_script_translations( $block->editor_script_handles[0], 'gymcore-starter-kit', dirname( __DIR__ ) . '/languages' );
	}
}

/**
 * Render the weekly timetable without querying users, bookings, or attendance.
 *
 * @param array $attributes Validated block attributes.
 * @return string Escaped schedule markup.
 */
function schedule_render( array $attributes = array() ): string {
	$wrapper     = get_block_wrapper_attributes();
	$unavailable = '<div ' . $wrapper . '><p>' . esc_html__( 'The class schedule is currently unavailable.', 'gymcore-starter-kit' ) . '</p></div>';
	if ( ! class_exists( '\\Gym_Core\\Schedule\\ClassPostType' ) || ! post_type_exists( 'gym_class' ) || ! is_post_type_viewable( 'gym_class' ) ) {
		return $unavailable;
	}
	$days       = array(
		'sunday'    => __( 'Sunday', 'gymcore-starter-kit' ),
		'monday'    => __( 'Monday', 'gymcore-starter-kit' ),
		'tuesday'   => __( 'Tuesday', 'gymcore-starter-kit' ),
		'wednesday' => __( 'Wednesday', 'gymcore-starter-kit' ),
		'thursday'  => __( 'Thursday', 'gymcore-starter-kit' ),
		'friday'    => __( 'Friday', 'gymcore-starter-kit' ),
		'saturday'  => __( 'Saturday', 'gymcore-starter-kit' ),
	);
	$start      = max( 0, min( 6, (int) get_option( 'start_of_week', 1 ) ) );
	$days       = array_slice( $days, $start, null, true ) + array_slice( $days, 0, $start, true );
	$day_filter = isset( $attributes['day'] ) ? sanitize_key( $attributes['day'] ) : '';
	$args       = array(
		'post_type'      => 'gym_class',
		'post_status'    => 'publish',
		'has_password'   => false,
		'posts_per_page' => -1,
		'no_found_rows'  => true,
		'orderby'        => 'title',
		'order'          => 'ASC',
		// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Canonical GymCore active status is post meta; public timetable excludes inactive records.
		'meta_query'     => array(
			array(
				'key'   => '_gym_class_status',
				'value' => 'active',
			),
		),
	);
	foreach ( array(
		'programId'  => 'gym_program',
		'locationId' => 'gym_location',
	) as $attribute => $taxonomy ) {
		$id = isset( $attributes[ $attribute ] ) ? absint( $attributes[ $attribute ] ) : 0;
		if ( $id ) {
			if ( ! taxonomy_exists( $taxonomy ) ) {
				return $unavailable;
			}
			$args['tax_query'][] = array(
				'taxonomy'         => $taxonomy,
				'field'            => 'term_id',
				'terms'            => array( $id ),
				'include_children' => false,
			);
		}
	}
	$by_day = array_fill_keys( array_keys( $days ), array() );
	$query  = new \WP_Query( $args );
	$zone   = wp_timezone();
	foreach ( $query->posts as $class ) {
		$day        = (string) get_post_meta( $class->ID, '_gym_class_day_of_week', true );
		$time       = (string) get_post_meta( $class->ID, '_gym_class_start_time', true );
		$recurrence = (string) get_post_meta( $class->ID, '_gym_class_recurrence', true );
		if ( ! isset( $days[ $day ] ) || ( $day_filter && $day !== $day_filter ) || 'weekly' !== $recurrence || ! preg_match( '/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/D', $time ) ) {
			continue;
		}
		$by_day[ $day ][] = array(
			'post' => $class,
			'time' => $time,
		);
	}
	$count   = array_sum( array_map( 'count', $by_day ) );
	$heading = max( 2, min( 6, (int) ( $attributes['headingLevel'] ?? 3 ) ) );
	ob_start();
	?>
	<div <?php echo $wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Core generates escaped wrapper attributes. ?>>
		<p class="gcs-schedule-count">
		<?php
		/* translators: %s: number of visible weekly classes. */
		echo esc_html( sprintf( _n( '%s weekly class', '%s weekly classes', $count, 'gymcore-starter-kit' ), number_format_i18n( $count ) ) );
		?>
		</p>
		<p class="gcs-schedule-timezone">
		<?php
		/* translators: %s: WordPress site timezone name or UTC offset. */
		echo esc_html( sprintf( __( 'All times use the site time zone: %s.', 'gymcore-starter-kit' ), wp_timezone_string() ) );
		?>
		</p>
		<?php if ( ! $count ) : ?>
			<p><?php esc_html_e( 'No weekly classes match these filters.', 'gymcore-starter-kit' ); ?></p>
		<?php else : ?>
			<div class="gcs-schedule-days">
			<?php foreach ( $by_day as $day => $classes ) : ?>
				<?php
				if ( ! $classes ) {
					continue;
				}
				usort(
					$classes,
					static function ( $a, $b ) {
						return strcmp( $a['time'], $b['time'] );
					}
				);
				?>
				<section class="gcs-schedule-day">
					<?php echo '<h' . (int) $heading . '>' . esc_html( $days[ $day ] ) . '</h' . (int) $heading . '>'; ?>
					<ul>
					<?php foreach ( $classes as $entry ) : ?>
						<?php
						$class = $entry['post'];
						$begin = new \DateTimeImmutable( '2000-01-01 ' . $entry['time'], $zone );
						$end   = (string) get_post_meta( $class->ID, '_gym_class_end_time', true );
						?>
						<li>
							<time datetime="<?php echo esc_attr( $entry['time'] ); ?>"><?php echo esc_html( wp_date( get_option( 'time_format' ), $begin->getTimestamp(), $zone ) ); ?></time>
							<?php if ( preg_match( '/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/D', $end ) ) : ?>
								<span aria-hidden="true">–</span><span class="screen-reader-text"><?php esc_html_e( 'to', 'gymcore-starter-kit' ); ?></span>
								<time datetime="<?php echo esc_attr( $end ); ?>"><?php echo esc_html( wp_date( get_option( 'time_format' ), ( new \DateTimeImmutable( '2000-01-01 ' . $end, $zone ) )->getTimestamp(), $zone ) ); ?></time>
								<?php
								if ( $end <= $entry['time'] ) :
									?>
									<span><?php esc_html_e( '(next day)', 'gymcore-starter-kit' ); ?></span><?php endif; ?>
							<?php endif; ?>
							<strong class="gcs-class-title"><?php echo esc_html( get_the_title( $class ) ); ?></strong>
							<?php foreach ( array( 'gym_program', 'gym_location' ) as $taxonomy ) : ?>
								<?php $terms = get_the_terms( $class, $taxonomy ); ?>
								<?php if ( $terms && ! is_wp_error( $terms ) ) : ?>
									<span class="gcs-class-terms"><?php echo esc_html( implode( ', ', wp_list_pluck( $terms, 'name' ) ) ); ?></span>
								<?php endif; ?>
							<?php endforeach; ?>
						</li>
					<?php endforeach; ?>
					</ul>
				</section>
			<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</div>
	<?php
	return (string) ob_get_clean();
}
