<?php

$templates = array( 'search.twig', 'archive.twig', 'index.twig' );
$context = Timber::get_context();

$context['title'] = 'Search results for "'. get_search_query() . '"';
$context['posts'] = Timber::get_posts();
$context['pagination'] = Timber::get_pagination();

Timber::render( $templates, $context );
