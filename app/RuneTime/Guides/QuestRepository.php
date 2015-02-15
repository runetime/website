<?php
namespace App\RuneTime\Guides;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class QuestRepository
 * @package App\RuneTime\Guides
 */
class QuestRepository extends EloquentRepository
{
	/**
	 * @param Quest $model
	 */
	public function __construct(Quest $model)
	{
		$this->model = $model;
	}

	/**
	 * @param $name
	 *
	 * @return mixed
	 */
	public function getByName($name)
	{
		return $this->model->
			where('name', '=', $name)->
			first();
	}

	/**
	 * @param $authorId
	 *
	 * @return mixed
	 */
	public function getByAuthor($authorId)
	{
		return $this->model->
			where('author_id', '=', $authorId)->
			get();
	}

	/**
	 * @param $difficulty
	 *
	 * @return mixed
	 */
	public function getByDifficulty($difficulty)
	{
		return $this->model->
			where('difficulty', '=', $difficulty)->
			get();
	}

	/**
	 * @param $length
	 *
	 * @return mixed
	 */
	public function getByLength($length)
	{
		return $this->model->
			where('length', '=', $length)->
			get();
	}

	/**
	 * @param $membership
	 *
	 * @return mixed
	 */
	public function getByMembership($membership)
	{
		return $this->model->
			where('membership', '=', $membership)->
			get();
	}

	/**
	 * @return mixed
	 */
	public function getAll()
	{
		return $this->model->
			get();
	}

	/**
	 * @param $difficulty
	 * @param $length
	 * @param $membership
	 *
	 * @return mixed
	 */
	public function getByOptions($difficulty, $length, $membership)
	{
		$query = $this->model;
		if($difficulty > 0) {
			$query = $query->where('difficulty', '=', $difficulty);
		}
		if($length > 0) {
			$query = $query->where('length', '=', $length);
		}
		if($membership > 0) {
			$query = $query->where('membership', '=', $membership);
		}
		return $query->get();
	}

	/**
	 * @param $option
	 *
	 * @return mixed
	 */
	public function getOptions($option)
	{
		return \DB::table('guide_info')->
			where('type', '=', strtolower($option))->
			get();
	}

	/**
	 * @param $optionId
	 *
	 * @return mixed
	 */
	public function getOptionById($optionId)
	{
		return \DB::table('guide_info')->
			where('id', '=', $optionId)->
			first();
	}
}