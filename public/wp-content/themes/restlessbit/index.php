<?php
$context = Timber::get_context();
$post = new TimberPost();

$context['post'] = $post;
$context['pagination'] = Timber::get_pagination();

if($context['pagination']['current'] == 1) {
  $context['featured_posts'] = Timber::get_posts([
    'meta_query' => [
      [
        'key' => 'post_featured',
        'value' => '"true"',
        'compare' => 'LIKE'
      ]
    ]
  ]);

  $context['latest_posts'] = Timber::get_posts();
  Timber::render( array( 'home.twig' ), $context );
}
else {
  Timber::render( array( 'index.twig' ), $context);
}
