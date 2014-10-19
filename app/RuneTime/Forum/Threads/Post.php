<?php
namespace App\RuneTime\Forum\Threads;
use App\Runis\Core\Entity;
class Post extends Entity {
	protected $table = 'forum_posts';
	protected $with = [];
	protected $fillable = ['author_id', 'ups', 'downs', 'status', 'ip', 'thread', 'contents', 'contents_parsed'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_INVISIBLE = 0;
	const STATUS_VISIBLE = 1;
}