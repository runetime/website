<?php
namespace App\RuneTime\Forum\Tags;
use App\RuneTime\Forum\Threads\Thread;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\Runis\Core\Entity;
class Tag extends Entity {
	protected $table      = 'forum_tags';
	protected $with       = [];
	protected $fillable   = ['author_id','name'];
	protected $dates      = [];
	protected $softDelete = true;
	const TAGS_PER_THREAD = 10;
	public function threads() {
		return $this->belongsToMany('App\RuneTime\Forum\Threads\Thread');
	}
	public function getThreads() {
		return \DB::table('tag_thread')->
			where('tag_id', '=', $this->id)->
			get();
	}
	public function addThread($threadId) {
		$this->threads()->attach([$this->id, $threadId]);
	}
}