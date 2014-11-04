<?php
namespace App\RuneTime\Radio;
use App\Runis\Core\EloquentRepository;
/**
 * Class HistoryRepository
 * @package App\RuneTime\Radio
 */
class HistoryRepository extends EloquentRepository {
	/**
	 * @param History $model
	 */
	public function __construct(History $model) {
		$this->model = $model;
	}
	public function getLatest() {
		return $this->model->
			orderBy('id', 'desc')->
			first();
	}

	/**
	 * @return mixed
	 */
	public function getCurrent() {
		return $this->getLatest();
	}
}