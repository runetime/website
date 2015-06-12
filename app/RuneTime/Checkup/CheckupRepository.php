<?php
namespace App\RuneTime\Checkup;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class CheckupRepository
 */
class CheckupRepository extends EloquentRepository
{
    /**
     * @param Checkup $model
     */
    public function __construct(Checkup $model)
    {
        $this->model = $model;
    }

    /**
     * @param        $amount
     * @param string $order
     * @param int    $skip
     *
     * @return mixed
     */
    public function getX($amount, $order = 'desc', $skip = 0)
    {
        return $this->model->
            orderBy('id', $order)->
            skip($skip)->
            take($amount)->
            get();
    }

    /**
     * @param $status
     *
     * @return mixed
     */
    public function getByStatus($status)
    {
        return $this->model->
            where('status', '=', $status)->
            get();
    }
}
