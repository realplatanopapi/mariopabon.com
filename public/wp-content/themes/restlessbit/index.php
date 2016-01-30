<?php
$context = Timber::get_context();
$post = new TimberPost();

$context['post'] = $post;
$context['pagination'] = Timber::get_pagination();

if($context['pagination']['current'] == 1) {
  $context['featured_posts'] = Timber::get_posts([
    'post__in' => get_option('sticky_posts'),
    'caller_get_posts' => 1
  ]);

  $context['latest_posts'] = Timber::get_posts([
    'ignore_sticky_posts' => true
  ]);

  Timber::render( array( 'first-page.twig' ), $context );
}
else {
  Timber::render( array( 'index.twig' ), $context);
}
