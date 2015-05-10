<?php
namespace App\RuneTime\Bans;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class IPRepository
 */
class IPRepository extends EloquentRepository
{
    /**
     * @param IP $model
     */
    public function __construct(IP $model)
    {
        $this->model = $model;
    }

    /**
     * @return mixed
     */
    public function getByStatus()
    {
        return $this->model->
            where('status', '=', IP::STATUS_ACTIVE)->
            get();
    }

    /**
     * @param $ip
     *
     * @return mixed
     */
    public function getByIP($ip)
    {
        return $this->model->
            where('ip', '=', $ip)->
            get();
    }

    /**
     * @param $ip
     *
     * @return mixed
     */
    public function getByIPActive($ip)
    {
        return $this->model->
            where('ip', '=', $ip)->
            where('status', '=', IP::STATUS_ACTIVE)->
            first();
    }
}
