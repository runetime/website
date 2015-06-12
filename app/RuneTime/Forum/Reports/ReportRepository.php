<?php
namespace App\RuneTime\Forum\Reports;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class ReportRepository
 */
class ReportRepository extends EloquentRepository
{
    /**
     * @param Report $model
     */
    public function __construct(Report $model)
    {
        $this->model = $model;
    }

    /**
     * @param $statusId
     *
     * @return mixed
     */
    public function getByStatus($statusId)
    {
        return $this->model->
            where('status_id', '=', $statusId)->
            get();
    }

    /**
     * @param $type
     *
     * @return string
     */
    public function convertType($type)
    {
        if (ctype_digit($type)) {
            switch ($type) {
                case 0:
                    return 'post';
                    break;
                case 1:
                    return 'thread';
                    break;
                case 2:
                    return 'user';
                    break;
            }
        }

        return 'unknown';
    }
}
