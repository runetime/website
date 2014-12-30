<?php
namespace App\RuneTime\Guides;

use App\RuneTime\Core\Entity;

class Location extends Entity
{
	protected $table = 'guides_locations';
	protected $fillable = ['name', 'author_id', 'editors', 'contents', 'contents_parsed'];
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