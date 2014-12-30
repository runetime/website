<?php
namespace App\RuneTime\Chat;

use App\RuneTime\Core\Entity;

class Chat extends Entity
{
	protected $table = 'chat_messages';
	protected $fillable = ['author_id', 'contents', 'contents_parsed', 'status', 'channel'];
	protected $dates = [];
	protected $softDelete = true;
	const PER_PAGE = 20;
	const STATUS_VISIBLE = 0;
	const STATUS_INVISIBLE = 1;
	const STATUS_PINNED = 2;
	const STATUS_PINNED_INVISIBLE = 3;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author()
	{
		return $this->belongsTo('App\RuneTime\Accounts\User', 'author_id');
	}
}