<?php
namespace App\RuneTime\Notifications;

use App\RuneTime\Core\Entity;

/**
 * Class Notification
 * @package App\RuneTime\Notifications
 */
class Notification extends Entity
{
	protected $table = 'notifications';
	protected $with = [];
	protected $fillable = ['user_id', 'section', 'contents_parsed', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_READ = 0;
	const STATUS_UNREAD = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function user()
	{
		return $this->belongsTo('App\RuneTime\Accounts\User', 'user_id');
	}

	public function setRead()
	{
		$this->status = self::STATUS_READ;
		$this->save();
	}
}