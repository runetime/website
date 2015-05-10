<?php
namespace App\RuneTime\Guides;

use App\RuneTime\Core\Entity;

/**
 * Class Quest
 * @package App\RuneTime\Guides
 */
class Quest extends Entity
{
	protected $table = 'guides_quests';
	protected $fillable = [
		'name',
		'author_id',
		'editors',
		'difficulty',
		'length',
		'qp',
		'membership',
		'completed',
		'description',
		'quest_requirements',
		'skill_requirements',
		'items_required',
		'items_recommended',
		'rewards',
		'starting_point',
		'contents',
		'contents_parsed'
	];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_HIDDEN = 0;
	const STATUS_PUBLISHED = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author()
	{
		return $this->belongsTo('App\RuneTime\Accounts\User', 'author_id');
	}

	/**
	 * @return mixed
	 */
	public function getDifficulty()
	{
		return $this->getOption($this->difficulty);
	}

	/**
	 * @return mixed
	 */
	public function getLength()
	{
		return $this->getOption($this->length);
	}

	/**
	 * @return mixed
	 */
	public function getMembership()
	{
		return $this->getOption($this->membership);
	}

	/**
	 * @param $id
	 *
	 * @return mixed
	 */
	private function getOption($id)
	{
		$option = \DB::table('guide_info')->
			where('id', '=', $id)->
			first();

		return $option->name;
	}
}