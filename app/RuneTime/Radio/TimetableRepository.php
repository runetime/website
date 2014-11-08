<?php
namespace App\RuneTime\Radio;
use App\Runis\Core\EloquentRepository;
/**
 * Class TimetableRepository
 * @package App\RuneTime\Radio
 */
class TimetableRepository extends EloquentRepository {
	/**
	 * @param Timetable $model
	 */
	public function __construct(Timetable $model) {
		$this->model = $model;
	}
}