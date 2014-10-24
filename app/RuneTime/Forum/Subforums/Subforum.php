<?php
namespace App\RuneTime\Forum\Subforums;
use App\Runis\Core\Entity;
class Subforum extends Entity{
	protected $table = 'forum_subforums';
	protected $with = [];
	protected $fillable = ['name', 'description', 'threads', 'replies', 'last_post', 'position', 'parent'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_HIDDEN = 0;
	const STATUS_PUBLISHED = 1;
	const THREADS_PER_PAGE = 20;

	public function threads() {
		return $this->hasMany('App\RuneTime\Forum\Threads\Thread', 'subforum_id');
	}
}