<?php
namespace App\RuneTime\Forum\Threads;
use App\Runis\Core\Entity;
class Post extends Entity {
	protected $table = 'forum_posts';
	protected $with = [];
	protected $fillable = ['author_id', 'thread_id', 'ups', 'downs', 'status', 'ip', 'contents', 'contents_parsed'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_INVISIBLE = 0;
	const STATUS_VISIBLE = 1;
	public function thread() {
		return $this->belongsTo('App\RuneTime\Forum\Threads\Thread', 'thread_id');
	}

	public function user() {
		return $this->belongsTo('App\Runis\Accounts\User', 'author_id');
	}
}