<?php
namespace App\RuneTime\Forum\Subforums;
use App\Runis\Core\EloquentRepository;
class SubforumRepository extends EloquentRepository{
	public function __construct(Subforum $model){
		$this->model=$model;
	}
}