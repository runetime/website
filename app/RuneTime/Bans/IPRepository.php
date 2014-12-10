<?php
namespace App\RuneTime\Bans;
use App\Runis\Core\EloquentRepository;
class IPRepository extends EloquentRepository {
	/**
	 * @param IP $model
	 */
	public function __construct(IP $model) {
		$this->model = $model;
	}

	/**
	 * @return mixed
	 */
	public function getByStatus() {
		return $this->model->
			where('status', '=', IP::STATUS_ACTIVE)->
			get();
	}

	public function getByIP($ip) {
		return $this->model->
			where('ip', '=', $ip)->
			get();
	}

	public function getByIPActive($ip) {
		return $this->model->
			where('ip', '=', $ip)->
			where('status', '=', IP::STATUS_ACTIVE)->
			first();
	}
}