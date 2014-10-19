<?php
namespace App\RuneTime\Chat;
use App\Runis\Core\Entity;
class Chat extends Entity{
	protected $table = 'chat_messages';
	protected $fillable = ['author_id', 'contents', 'contents_parsed', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const PER_PAGE = 20;
	const STATUS_USER_PUBLISHED = 0;
	const STATUS_USER_HIDDEN = 1;
	const STATUS_USER_PINNED = 2;
	const STATUS_STAFF_PUBLISHED = 3;
	const STATUS_STAFF_HIDDEN = 4;
	const STATUS_STAFF_PINNED = 5;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author() {
		return $this->belongsTo('RT\Accounts\User', 'author_id');
	}
}