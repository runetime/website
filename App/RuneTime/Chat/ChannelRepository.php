<?php
namespace App\RuneTime\Chat;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class ChannelRepository
 * @package App\RuneTime\Chat
 */
class ChannelRepository extends EloquentRepository
{
	/**
	 * @param Channel $model
	 */
	public function __construct(Channel $model)
	{
		$this->model = $model;
	}

	/**
	 * @return mixed
	 */
	public function getAll()
	{
		return $this->model->
			orderBy('messages', 'asc')->
			get();
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
	 * @param $nameTrim
	 *
	 * @return mixed
	 */
	public function getByNameTrim($nameTrim)
	{
		return $this->model->
			where('name_trim', '=', $nameTrim)->
			first();
	}
}