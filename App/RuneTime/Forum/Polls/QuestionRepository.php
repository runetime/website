<?php
namespace App\RuneTime\Forum\Polls;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class QuestionRepository
 */
class QuestionRepository extends EloquentRepository
{
    /**
     * @param Question $model
     */
    public function __construct(Question $model)
    {
        $this->model = $model;
    }
}
