<?php
namespace App\RuneTime\BBCode;
use App\Runis\Core\Entity;
class BBCode extends Entity {
	protected $table = 'bbcode';
	protected $with = [];
	protected $fillable = ['name', 'example', 'parsed', 'parse_from', 'parse_to'];
	protected $dates = [];
	protected $softDelete = false;
	const STATUS_UNAVAILABLE = 0;
	const STATUS_AVAILABLE = 1;
}