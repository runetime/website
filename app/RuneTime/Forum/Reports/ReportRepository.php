<?php
namespace App\RuneTime\Forum\Reports;
use App\Runis\Core\EloquentRepository;
class ReportRepository extends EloquentRepository {
	public function __construct(Report $model) {
		$this->model = $model;
	}
	public function getByStatus($statusId) {
		return $this->model->
			where('status_id', '=', $statusId)->
			get();
	}
	public function convertType($type) {
		if(ctype_digit($type)) {
			switch($type) {
				case 0:
					return 'post';
					break;
				case 1:
					return 'thread';
					break;
				case 2:
					return 'user';
					break;
			}
		}
	}
}