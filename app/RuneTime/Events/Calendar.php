<?php
namespace App\RuneTime\Event;

use App\RuneTime\Core\Entity;

class Calendar extends Entity
{
	protected $table = 'calendar_calendars';
	protected $fillable = ['title', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_INVISIBLE = 0;
	const STATUS_VISIBLE = 1;
}