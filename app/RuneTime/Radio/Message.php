<?php
namespace App\RuneTime\Radio;

use App\Runis\Core\Entity;

class Message extends Entity
{
	protected $table = 'radio_messages';
	protected $with = [];
	protected $fillable = ['author_id', 'contents', 'contents_parsed'];
	protected $dates = [];
	protected $softDelete = true;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author()
	{
		return $this->belongsTo('App\Runis\Accounts\User', 'author_id');
	}
}