<?php
namespace App\RuneTime\Forum\Threads;
use App\Runis\Core\Entity;
class Post extends Entity {
	protected $table = 'forum_posts';
	protected $with = [];
	protected $fillable = ['author_id', 'rep', 'status', 'ip', 'contents', 'contents_parsed'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_INVISIBLE = 0;
	const STATUS_VISIBLE = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function thread() {
		return $this->belongsToMany('App\RuneTime\Forum\Threads\Thread');
	}

	public function message() {
		return $this->belongsToMany('App\RuneTime\Messenger\Message');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function user() {
		return $this->author();
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author() {
		return $this->belongsTo('App\Runis\Accounts\User', 'author_id');
	}

	public function userVote() {
		if(\Auth::user()) {
			$voteRepository = new VoteRepository(new Vote);
			$vote = $voteRepository->getByPost($this->id);
			if($vote)
				if($vote->status == Vote::STATUS_UP)
					return 'upvote-active';
				elseif($vote->status == Vote::STATUS_DOWN)
					return 'downvote-active';
		}
		return '';
	}
}