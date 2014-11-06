<?php
namespace App\RuneTime\Databases;
use App\Runis\Core\Entity;
/**
 * Class Monster
 * @package App\RuneTime\Calculators
 */
class Monster extends Entity{
	protected $table = 'database_monsters';
	protected $fillable = ['author_id', 'editors', 'name', 'examine', 'examine_parsed', 'stats', 'stats_parsed', 'location', 'location_parsed', 'drops', 'drops_parsed', 'members', 'other_information', 'other_information_parsed'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_HIDDEN = 0;
	const STATUS_PUBLISHED = 1;
}