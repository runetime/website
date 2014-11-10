<?php
namespace App\RuneTime\Radio;
use App\Runis\Core\EloquentRepository;
class RequestRepository extends EloquentRepository {
	public function __construct(Request $model) {
		$this->model = $model;
	}
}