<?php
if (!isset($activity)) {
    $activity = [];
}

$list = '';
$activity = array_reverse($activity);
foreach ($activity as $key => $user) {
    if ($user['logged'] === true) {
        $list .= '<span ' . \String::tooltip('Last active ' . \Time::shortReadable($user['time'])) . '>' . \Link::name($user['user']) . '</span>, ';
    }
}

$list = substr($list, 0, -2);
echo $list;
