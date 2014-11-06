<?php
namespace App\RuneTime\Databases;
use App\Runis\Core\Entity;
/**
 * Class Item
 * @package App\RuneTime\Databases
 */
class Item extends Entity{
	protected $table = 'database_items';
	protected $fillable = ['author_id', 'editors', 'name', 'examine', 'examine_parsed', 'membership', 'tradable', 'quest_item'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_HIDDEN = 0;
	const STATUS_PUBLISHED = 1;
}