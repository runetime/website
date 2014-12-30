<?php
namespace App\RuneTime\Databases;

use App\RuneTime\Core\EloquentRepository;

class MonsterRepository extends EloquentRepository
{
	/**
	 * @param Monster $model
	 */
	public function __construct(Monster $model)
	{
		$this->model = $model;
	}

	/**
	 * @param $membership
	 *
	 * @return mixed
	 */
	public function getByOptions($membership)
	{
		if($membership == 'none') {
			$membership = '';
		}
		$query = $this->model->
			where('id', '>=', 1);
		if(!empty($membership)) {
			$query = $query->where('members', '=', $membership == 'yes' ? 1 : 0);
		}
		return $query->get();
	}
}