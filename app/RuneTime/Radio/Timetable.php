<?php
namespace App\RuneTime\Radio;
use App\Runis\Core\Entity;
/**
 * Class Timetable
 * @package App\RuneTime\Radio
 */
class Timetable extends Entity{
	protected $table = 'radio_timetables';
	protected $with = [];
	protected $fillable = ['dj_id', 'year', 'day', 'hour'];
	protected $dates = [];
	protected $softDelete = true;
}