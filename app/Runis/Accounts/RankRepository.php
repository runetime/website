<?php
namespace App\Runis\Accounts;

use App\Runis\Core\EloquentRepository;

class RankRepository extends EloquentRepository{
	/**
	 * @param Rank $model
	 */
	public function __construct(Rank $model) {
		$this->model = $model;
	}

	public function getByPostCount($count = 0) {
		return $this->model->
			where('posts_required', '<=', $count)->
			orderBy('posts_required', 'desc')->
			first();
	}
}