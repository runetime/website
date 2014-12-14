<?php
namespace App\RuneTime\Chat;
use App\Runis\Core\EloquentRepository;
class ActionRepository extends EloquentRepository
{
	public function __construct(Action $model)
	{
		$this->model = $model;
	}
}