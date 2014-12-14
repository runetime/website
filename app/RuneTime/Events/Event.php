<?php
namespace App\RuneTime\Event;

use App\Runis\Core\Entity;

class Event extends Entity
{
	protected $table = 'calendar_events';
	protected $fillable = ['author_id', 'title', 'contents', 'contents_parsed', 'time_of', 'calendar', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const PER_PAGE = 20;
	const STATUS_USER_INVISIBLE = 0;
	const STATUS_USER_VISIBLE = 1;
	const STATUS_OFFICIAL_INVISIBLE = 2;
	const STATUS_OFFICIAL_VISIBLE = 3;
}