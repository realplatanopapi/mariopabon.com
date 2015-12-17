<?php

/**
 * Custom fields for the built-in Post type.
 */
acf_add_local_field_group(array(
  'key' => 'field_group_post',
  'title' => 'Featured',
  'fields' => array(
    array(
      'key' => 'post_featured',
      'label' => 'Featured',
      'name' => 'post_featured',
      'type' => 'checkbox',
      'choices' => array(
        'true'	=> 'Yes'
      )
    )
  ),
  'location' => array(
    array(
      array(
        'param' => 'post_type',
        'operator' => '==',
        'value' => 'post'
      )
    )
  )
));
