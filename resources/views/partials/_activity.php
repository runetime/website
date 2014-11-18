<?php
if(!isset($activity)) $activity = [];
$list = "";
foreach($activity as $key => $user)
	if($user['logged'] === true)
		$list .= \Link::name($user['user']) . ", ";
$list = substr($list, 0, -2);
echo $list;