<?php
namespace App\RuneTime\Radio;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class TimetableRepository
 */
class TimetableRepository extends EloquentRepository
{
    /**
     * @param Timetable $model
     */
    public function __construct(Timetable $model)
    {
        $this->model = $model;
    }

    /**
     * @param $hour
     * @param $day
     *
     * @return mixed
     */
    public function getByHourDay($hour, $day)
    {
        return $this->model->
            where('year', '=', date('Y'))->
            where('hour', '=', $hour)->
            where('day', '=', $day)->
            first();
    }

    /**
     * @return mixed
     */
    public function getThisWeek()
    {
        $timeStart = strtotime('last tuesday 00:00:00', strtotime('tomorrow'));
        $timeEnd = strtotime('tuesday 00:00:00', strtotime('tomorrow'));

        $dayStart = date('z', $timeStart);
        $yearStart = date('Y', $timeStart);

        $dayEnd = date('z', $timeEnd);
        $yearEnd = date('Y', $timeEnd);

        return $this->model->
            where(function ($q) use ($yearStart, $dayStart) {
                $q->where('year', '>=', $yearStart)->
                    where('day', '>=', $dayStart);
            })->
            where(function ($q) use ($yearEnd, $dayEnd) {
                $q->where('year', '<=', $yearEnd)->
                    where('day', '<', $dayEnd);
            })->
            get();
    }
}
