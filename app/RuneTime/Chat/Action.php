<?php
namespace App\RuneTime\Chat;
use App\Runis\Core\Entity;
class Action extends Entity
{
	protected $table = 'chat_actions';
	protected $fillable = ['author_id','action','message_id'];
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