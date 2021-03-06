<?php
namespace App\RuneTime\Forum\Threads;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class VoteRepository
 */
class VoteRepository extends EloquentRepository
{
    /**
     * @param Vote $model
     */
    public function __construct(Vote $model)
    {
        $this->model = $model;
    }

    /**
     * @param $id
     *
     * @return mixed
     */
    public function getByPost($id)
    {
        return $this->model->
            where('author_id', '=', \Auth::user()->id)->
            where('post_id', '=', $id)->
            first();
    }
}
