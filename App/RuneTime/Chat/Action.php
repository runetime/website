<?php
namespace App\RuneTime\Chat;

use App\RuneTime\Core\Entity;

/**
 * Class Action
 * @package App\RuneTime\Chat
 */
class Action extends Entity
{
	protected $table = 'chat_actions';
	protected $fillable = [
		'author_id',
		'action',
		'message_id'
	];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_HIDDEN = 0;
	const STATUS_PUBLISHED = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author()
	{
		return $this->belongsTo('App\RuneTime\Accounts\User', 'author_id');
	}
}