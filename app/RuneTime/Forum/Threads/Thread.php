<?php
namespace App\RuneTime\Forum\Threads;
use App\Runis\Core\Entity;
class Thread extends Entity {
	protected $table      = 'forum_threads';
	protected $with       = [];
	protected $fillable   = ['author_id','title','op','views','posts','last_post','poll','status','tags','subforum'];
	protected $dates      = [];
	protected $softDelete = true;
	const STATUS_INVISIBLE = 0;
	const STATUS_VISIBLE = 1;
	const STATUS_INVISIBLE_PINNED = 2;
	const STATUS_VISIBLE_PINNED = 3;
	const STATUS_INVISIBLE_LOCKED = 4;
	const STATUS_VISIBLE_LOCKED = 5;
	const POSTS_PER_PAGE  = 20;
	public function addPost($postId){
		$this->posts()->attach($postId);
	}
	public function posts(){
		return $this->hasMany('Post');
	}
}