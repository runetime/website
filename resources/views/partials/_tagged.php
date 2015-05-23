<?php
$contents = '';
if (!isset($tags)) {
    $tags = [];
}

foreach ($tags as $tag) {
    $contents .= "<a href='" . $tag->toSlug() . "'>" . $tag->name . '</a>, ';
}

echo(substr($contents, 0, -2));
