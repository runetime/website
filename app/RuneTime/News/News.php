<?php
namespace App\RuneTime\News;
use App\Runis\Core\Entity;
class News extends Entity{
	protected $table = 'news';
	protected $with = [];
	protected $fillable = ['author_id', 'title', 'contents', 'status', 'comments'];
	protected $dates = [];
	protected $softDelete = true;
	public $presenter = 'RT\News\NewsPresenter';
	const STATUS_HIDDEN = 0;
	const STATUS_PUBLISHED = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author() {
		return $this->belongsTo('RT\Accounts\User', 'author_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function tags() {
		return $this->belongsToMany('RT\Tags\Tag', 'article_tag', 'article_id', 'tag_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\MorphMany
	 */
	public function comments() {
		return $this->morphMany('RT\Comments\Comment', 'owner');
	}
}