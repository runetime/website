<?php
namespace App\RuneTime\News;
use App\Runis\Core\Entity;
class News extends Entity{
	protected $table = 'news';
	protected $with = [];
	protected $fillable = ['author_id', 'title', 'contents', 'contents_parsed', 'post_count', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_HIDDEN = 0;
	const STATUS_PUBLISHED = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author() {
		return $this->belongsTo('App\RuneTime\Accounts\User', 'author_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function tags() {
		return $this->belongsToMany('App\RuneTime\Forum\Tags\Tag');
	}

	public function addTag($tag) {
		$this->tags()->attach([$tag->id]);
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function posts() {
		return $this->belongsToMany('App\RuneTime\Forum\Threads\Post');
	}

	/**
	 * @param $post
	 */
	public function addPost($post) {
		$this->posts()->attach([$post->id]);
	}

	/**
	 *
	 */
	public function incrementPosts() {
		$this->increment('post_count');
		$this->save();
	}

	public function hasImage() {
		$path = 'img/news/thumbnail/' . $this->id . '.png';
		if(file_exists('./' . $path))
			return $path;
		return false;
	}

	public function toSlug($path = '') {
		return url('news/' . \String::slugEncode($this->id, $this->title) . (!empty($path) ? '/' . $path : ''));
	}
}