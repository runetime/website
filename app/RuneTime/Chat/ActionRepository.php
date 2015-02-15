<?php
namespace App\RuneTime\Chat;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class ActionRepository
 * @package App\RuneTime\Chat
 */
class ActionRepository extends EloquentRepository
{
	public function __construct(Action $model)
	{
		$this->model = $model;
	}
}