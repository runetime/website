<?php
namespace App\RuneTime\Messenger;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class MessageRepository
 */
class MessageRepository extends EloquentRepository
{
    /**
     * @param Message $model
     */
    public function __construct(Message $model)
    {
        $this->model = $model;
    }

    /**
     * @param $userId
     */
    public function getByUser($userId)
    {
    }
}
