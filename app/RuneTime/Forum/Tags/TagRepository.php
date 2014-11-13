<?php
namespace App\RuneTime\Forum\Tags;
use App\Runis\Core\EloquentRepository;
class TagRepository extends EloquentRepository {
	/**
	 * @param Tag $model
	 */
	public function __construct(Tag $model) {
		$this->model=$model;
	}

	/**
	 * @param $name
	 *
	 * @return mixed
	 */
	public function getByName($name) {
		return $this->model->
			where('name', '=', $name)->
			first();
	}
}