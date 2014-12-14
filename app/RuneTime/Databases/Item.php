<?php
namespace App\RuneTime\Databases;

use App\Runis\Core\Entity;

class Item extends Entity
{
	protected $table = 'database_items';
	protected $fillable = ['author_id', 'editors', 'name', 'examine', 'examine_parsed', 'membership', 'tradable', 'quest_item'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_HIDDEN = 0;
	const STATUS_PUBLISHED = 1;

	/**
	 * @return string
	 */
	public function getEditors()
	{
		$editList = "";
		$editors = json_decode($this->editors);
		if(!empty($editors)) {
			foreach($editors as $x => $editor) {
				$editList .= \Link::name($editor) . ($x < count($editors) - 1 ? ", " : "");
			}
		}
		return $editList;
	}
}