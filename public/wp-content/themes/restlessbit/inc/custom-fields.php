<?php

if( function_exists( 'register_field_group' ) ) {
	$fields = array (
		array (
			'key' => 'link',
			'label' => 'Link',
			'name' => 'link',
			'type' => 'text',
			'default_value' => '',
			'placeholder' => '',
			'prepend' => '',
			'append' => '',
			'formatting' => 'none',
			'maxlength' => '',
		),
		array (
			'key' => 'featured',
			'label' => 'Featured',
			'name' => 'featured',
			'type' => 'checkbox',
			'choices' => array (
				'true' => 'Featured'
			),
		),
	);

	register_field_group(array (
		'id' => 'acf_project',
		'title' => 'Project',
		'fields' => $fields,
		'location' => array (
			array (
				array (
					'param' => 'post_type',
					'operator' => '==',
					'value' => 'project',
					'order_no' => 0,
					'group_no' => 0,
				),
			),
		),
		'options' => array (
			'position' => 'normal',
			'layout' => 'no_box',
			'hide_on_screen' => array (
			),
		),
		'menu_order' => 0,
	));
}
