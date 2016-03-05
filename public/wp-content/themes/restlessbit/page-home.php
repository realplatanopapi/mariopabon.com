<?php
/** Template Name: Home */

$context = Timber::get_context();

$context['post'] = new TimberPost();
$context['projects'] = Timber::get_posts( array( 'post_type' => 'project' ) );
$context['latest_posts'] = Timber::get_posts( array( 'post_type' => 'post', 'posts_per_page' => 5, 'ignore_sticky_posts' => true ) );
$context['links'] = array(
  'github' => 'https://github.com/restlessbit',
  'npm' => 'https://www.npmjs.com/~restlessbit',
  'medium' => 'https://medium.com/@restlessbit',
  'stackoverflow' => 'http://stackoverflow.com/users/4645524/restlessbit',
  'twitter' => 'https://twitter.com/restlessbit'
);
$context['contact'] = array(
  'email' => 'me@mariopabon.com'
);

Timber::render( array( 'page-home.twig'), $context );
