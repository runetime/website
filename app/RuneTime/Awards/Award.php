<?php
namespace App\RuneTime\Awards;
use App\Runis\Core\Entity;
class Award extends Entity{
	protected $table = 'awards';
	protected $with = [];
	protected $fillable = ['name', 'name_trim', 'description', 'given', 'last_awarded'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_UNAVAILABLE = 0;
	const STATUS_AVAILABLE = 1;
}
