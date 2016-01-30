<?php
$context = Timber::get_context();
$post = new TimberPost();

$context['post'] = $post;
$context['pagination'] = Timber::get_pagination();

Timber::render( array( 'index.twig' ), $context);
