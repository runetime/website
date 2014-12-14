<?php
namespace App\RuneTime\Radio;
use App\Runis\Core\EloquentRepository;
/**
 * Class RequestRepository
 * @package App\RuneTime\Radio
 */
class RequestRepository extends EloquentRepository
{
	/**
	 * @param Request $model
	 */
	public function __construct(Request $model)
	{
		$this->model = $model;
	}

	/**
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getByUser($id)
	{
		return $this->model->
			where('author_id', '=', $id)->
			get();
	}
}