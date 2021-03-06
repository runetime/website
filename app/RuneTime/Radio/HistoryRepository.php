<?php
namespace App\RuneTime\Radio;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class HistoryRepository
 */
class HistoryRepository extends EloquentRepository
{
    /**
     * @param History $model
     */
    public function __construct(History $model)
    {
        $this->model = $model;
    }
    public function getLatest()
    {
        return $this->model->
            orderBy('id', 'desc')->
            first();
    }

    /**
     * @return mixed
     */
    public function getCurrent()
    {
        return $this->getLatest();
    }

    /**
     * @param int $amount
     *
     * @return mixed
     */
    public function getRecentX($amount = History::DEFAULT_AMOUNT)
    {
        return $this->model->
            orderBy('id', 'desc')->
            take($amount)->
            get();
    }
}
