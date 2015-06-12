<?php
namespace App\RuneTime\Accounts;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class RankRepository
 */
class RankRepository extends EloquentRepository
{
    /**
     * @param Rank $model
     */
    public function __construct(Rank $model)
    {
        $this->model = $model;
    }

    /**
     * @param int $count
     *
     * @return mixed
     */
    public function getByPostCount($count = 0)
    {
        return $this->model->
            where('posts_required', '<=', $count)->
            orderBy('posts_required', 'desc')->
            first();
    }
}
