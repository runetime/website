<?php
namespace App\RuneTime\Notifications;
use App\Runis\Core\Entity;
class Notification extends Entity {
	protected $table = 'news';
	protected $with = [];
	protected $fillable = ['user_id', 'section', 'contents', 'contents_parsed', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_READ = 0;
	const STATUS_UNREAD = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function user() {
		return $this->belongsTo('App\RuneTime\Accounts\User', 'user_id');
	}
}