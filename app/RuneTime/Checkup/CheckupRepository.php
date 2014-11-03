<?php
namespace App\RuneTime\Checkup;
use App\Runis\Core\EloquentRepository;
/**
 * Class CheckupRepository
 * @package App\RuneTime\Chat
 */
class CheckupRepository extends EloquentRepository {
	/**
	 * @param Checkup $model
	 */
	public function __construct(Checkup $model) {
		$this->model = $model;
	}

	/**
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getById($id) {
		return $this->model->
			where('id', '=', $id)->
			first();
	}

	/**
	 * @param        $amount
	 * @param string $order
	 * @param int    $skip
	 *
	 * @return mixed
	 */
	public function getX($amount, $order='desc', $skip = 0) {
		return $this->model->
			orderBy('id', $order)->
			skip($skip)->
			take($amount)->
			get();
	}
}