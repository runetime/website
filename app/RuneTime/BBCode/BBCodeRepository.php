<?php
namespace App\RuneTime\BBCode;
use App\Runis\Core\EloquentRepository;
class BBCodeRepository extends EloquentRepository {
	/**
	 * @param BBCode $model
	 */
	public function __construct(BBCode $model) {
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
	 * @return mixed
	 */
	public function getAll() {
		if(!isset($this->all))
			$this->all = $this->model->get();
		return $this->all;
	}

	/**
	 * @param $str
	 *
	 * @return mixed
	 */
	public function parse($str) {
		if(!isset($this->getAll))
			$this->getAll();
		foreach($this->all as $bbcode)
			$str = preg_replace($bbcode->parse_from, $bbcode->parse_to, $str);
		return $str;
	}
}