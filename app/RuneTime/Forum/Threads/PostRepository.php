<?php
namespace App\RuneTime\Forum\Threads;
use App\Runis\Core\EloquentRepository;
class PostRepository extends EloquentRepository{
	public function __construct(Post $model){
		$this->model=$model;
	}
}