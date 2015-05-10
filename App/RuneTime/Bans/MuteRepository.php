<?php
namespace App\RuneTime\Bans;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class MuteRepository
 */
class MuteRepository extends EloquentRepository
{
    /**
     * @param Mute $model
     */
    public function __construct(Mute $model)
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
            where('user_id', '=', $id)->
            get();
    }

    /**
     * @param $id
     *
     * @return mixed
     */
    public function getByUserActive($id)
    {
        return $this->model->
            where('user_id', '=', $id)->
            where('time_end', '>=', time())->
            first();
    }
}
