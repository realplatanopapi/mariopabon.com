<?php
$context = Timber::get_context();
$post = new TimberPost();

$context['post'] = $post;

$context['featured_posts'] = Timber::get_posts([
  'meta_query' => [
    [
      'key' => 'post_featured',
      'value' => '"true"',
      'compare' => 'LIKE'
    ]
  ]
]);

Timber::render( array( 'home.twig' ), $context );
