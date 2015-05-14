<?php
namespace App\RuneTime\Radio;

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
     * @param $id
     *
     * @return mixed
     */
    public function getByUser($id)
    {
        return $this->model->
            where('author_id', '=', $id)->
            get();
    }
}
