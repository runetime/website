<?php
namespace App\RuneTime\Core;

use Illuminate\Database\Eloquent\Model;

/**
 * Class EloquentRepository
 */
abstract class EloquentRepository
{
    /**
     * @var null
     */
    protected $model;

    /**
     * @param null $model
     */
    public function __construct($model = null)
    {
        $this->model = $model;
    }

    /**
     * @return mixed
     */
    public function getModel()
    {
        return $this->model;
    }

    /**
     * @param $model
     */
    public function setModel($model)
    {
        $this->model = $model;
    }

    /**
     * @return mixed
     */
    public function getAll()
    {
        return $this->model->all();
    }

    /**
     * @param $count
     *
     * @return mixed
     */
    public function getAllPaginated($count)
    {
        return $this->model->paginate($count);
    }

    /**
     * @param $id
     *
     * @return mixed
     */
    public function getById($id)
    {
        return $this->model->find($id);
    }

    /**
     * @param array $attributes
     *
     * @return mixed
     */
    public function getNew($attributes = [])
    {
        return $this->model->newInstance($attributes);
    }

    /**
     * @param $data
     *
     * @return mixed
     */
    public function save($data)
    {
        if ($data instanceof Model) {
            return $this->storeEloquentModel($data);
        }

        return $this->storeArray($data);
    }

    /**
     * @param $model
     *
     * @return mixed
     */
    public function delete($model)
    {
        return $model->delete();
    }

    /**
     * @param $model
     *
     * @return mixed
     */
    protected function storeEloquentModel($model)
    {
        if ($model->getDirty()) {
            return $model->save();
        }

        return $model->touch();
    }

    /**
     * @param $data
     *
     * @return mixed
     */
    protected function storeArray($data)
    {
        return $this->storeEloquentModel($this->getNew($data));
    }

    /**
     * @param $number
     *
     * @return mixed
     */
    public function paginate($number)
    {
        return $this->model->simplePaginate($number);
    }

    /**
     * @return mixed
     */
    public function getCount()
    {
        return $this->model->count();
    }
}
