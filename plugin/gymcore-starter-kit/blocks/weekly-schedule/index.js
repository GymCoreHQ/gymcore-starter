/* Native WordPress packages; this readable source is the shipped editor asset. */
(function (wp) {
	'use strict';
	var el = wp.element.createElement;
	var __ = wp.i18n.__;
	function TermFilter(props) {
		var search = wp.element.useState('');
		var terms = wp.data.useSelect(function (select) {
			return select('core').getEntityRecords('taxonomy', props.taxonomy, { per_page: 100, search: search[0], hide_empty: false });
		}, [props.taxonomy, search[0]]);
		var selected = wp.data.useSelect(function (select) {
			return props.value ? select('core').getEntityRecord('taxonomy', props.taxonomy, props.value) : null;
		}, [props.taxonomy, props.value]);
		var options = [{ value: '0', label: __('All', 'gymcore-starter-kit') }];
		(terms || []).forEach(function (term) { options.push({ value: String(term.id), label: term.name }); });
		if (selected && !options.some(function (option) { return option.value === String(selected.id); })) {
			options.push({ value: String(selected.id), label: selected.name });
		}
		return el(wp.components.ComboboxControl, { label: props.label, value: String(props.value), options: options,
			onFilterValueChange: search[1], onChange: function (value) { props.onChange(parseInt(value, 10) || 0); },
			help: __('Search terms managed in GymCore. Clear to show all.', 'gymcore-starter-kit') });
	}
	wp.blocks.registerBlockType('gymcore-starter/weekly-schedule', {
		edit: function (props) {
			var a = props.attributes;
			var days = [
				{ value: '', label: __('All days', 'gymcore-starter-kit') },
				{ value: 'monday', label: __('Monday', 'gymcore-starter-kit') },
				{ value: 'tuesday', label: __('Tuesday', 'gymcore-starter-kit') },
				{ value: 'wednesday', label: __('Wednesday', 'gymcore-starter-kit') },
				{ value: 'thursday', label: __('Thursday', 'gymcore-starter-kit') },
				{ value: 'friday', label: __('Friday', 'gymcore-starter-kit') },
				{ value: 'saturday', label: __('Saturday', 'gymcore-starter-kit') },
				{ value: 'sunday', label: __('Sunday', 'gymcore-starter-kit') }
			];
			return el('div', wp.blockEditor.useBlockProps(),
				el(wp.blockEditor.InspectorControls, null, el(wp.components.PanelBody, { title: __('Schedule filters', 'gymcore-starter-kit') },
					el(TermFilter, { taxonomy: 'gym_program', label: __('Program', 'gymcore-starter-kit'), value: a.programId, onChange: function (v) { props.setAttributes({ programId: v }); } }),
					el(TermFilter, { taxonomy: 'gym_location', label: __('Location', 'gymcore-starter-kit'), value: a.locationId, onChange: function (v) { props.setAttributes({ locationId: v }); } }),
					el(wp.components.SelectControl, { label: __('Day', 'gymcore-starter-kit'), value: a.day, options: days, onChange: function (v) { props.setAttributes({ day: v }); } }),
					el(wp.components.SelectControl, { label: __('Day heading level', 'gymcore-starter-kit'), value: a.headingLevel, options: [2, 3, 4, 5, 6].map(function (v) { return { value: v, label: String(v) }; }), onChange: function (v) { props.setAttributes({ headingLevel: Number(v) }); } })
				)),
				el(wp.serverSideRender, { block: 'gymcore-starter/weekly-schedule', attributes: a })
			);
		},
		save: function () { return null; }
	});
})(window.wp);
