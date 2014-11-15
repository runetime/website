<?php
namespace App\RuneTime\Radio;
use App\Runis\Core\EloquentRepository;
/**
 * Class SessionRepository
 * @package App\RuneTime\Radio
 */
class SessionRepository extends EloquentRepository {
	/**
	 * @param Session $model
	 */
	public function __construct(Session $model) {
		$this->model = $model;
	}
}