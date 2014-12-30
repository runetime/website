<?php
namespace App\RuneTime\Radio;

use App\RuneTime\Core\Entity;

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
		return $this->belongsTo('App\RuneTime\Accounts\User', 'author_id');
	}
}