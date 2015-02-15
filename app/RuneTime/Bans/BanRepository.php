<?php
namespace App\RuneTime\Bans;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class BanRepository
 * @package App\RuneTime\Bans
 */
class BanRepository extends EloquentRepository
{
	/**
	 * @param Ban $model
	 */
	public function __construct(Ban $model)
	{
		$this->model = $model;
	}

	public function getByUserId($id)
	{
		return $this->model->
			where('user_id', '=', $id)->
			where('time_ends', '>=', time())->
			first();
	}
}