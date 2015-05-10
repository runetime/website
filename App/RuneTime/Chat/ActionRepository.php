<?php
namespace App\RuneTime\Chat;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class ActionRepository
 */
class ActionRepository extends EloquentRepository
{
    /**
     * @param \App\RuneTime\Chat\Action $model
     */
    public function __construct(Action $model)
    {
        $this->model = $model;
    }
}
