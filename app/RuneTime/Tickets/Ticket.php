<?php
namespace App\RuneTime\Tickets;
use App\Runis\Core\Entity;
class Ticket extends Entity {
	protected $table = 'tickets';
	protected $fillable = ['author_id', 'name', 'contents', 'contents_parsed'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_OPEN = 0;
	const STATUS_CLOSED = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author() {
		return $this->belongsTo('RT\Accounts\User', 'author_id');
	}
}