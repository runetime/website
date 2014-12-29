<?php
namespace App\Utilities;

use Carbon\Carbon;

class Time
{
	/**
	 * @param $time
	 *
	 * @return Carbon
	 */
	public static function carbon($time = 0)
	{
		if(is_a($time, 'Carbon')) {
			return $time;
		}

		if(is_numeric($time)) {
			$date = \Carbon::createFromTimestamp($time);
		} else {
			$date = \Carbon::parse($time);
		}

		if(self::isDST()) {
			$date->addHour();
		}

		return $date;
	}

	/**
	 * Returns whether or not it is currently DST for the user
	 * @return boolean    Whether or not it is currently DST
	 */
	public static function isDST()
	{
		return carbon::now()->dst;
	}

	/**
	 * @param int $i
	 *
	 * @return bool|string
	 */
	public static function short($i = 0)
	{
		return self::carbon($i)->format('jS \of F Y');
	}

	/**
	 * @param int $i
	 *
	 * @return bool|string
	 */
	public static function shortTime($i = 0)
	{
		return self::carbon($i)->format('jS \of F Y H:i:s');
	}

	/**
	 * @param int $i
	 *
	 * @return bool|string
	 */
	public static function long($i = 0)
	{
		return self::carbon($i)->format('jS \of F Y \- H:i:s');
	}

	/**
	 * @param $str
	 *
	 * @return int
	 */
	public static function getEpoch($str)
	{
		return self::carbon($str)->timestamp;
	}

	/**
	 * @param $unix
	 *
	 * @return bool|string
	 */
	public static function formatTime($unix)
	{
		return self::carbon($unix)->format('Y-m-d H:i:s');
	}

	/**
	 * @param $time
	 *
	 * @return string
	 */
	public static function shortReadable($time)
	{
		return self::carbon($time)->diffForHumans();
	}

	/**
	 * @param $time
	 *
	 * @return string
	 */
	public static function timeAgo($time)
	{
		if(!is_numeric($time)) {
			$time = self::getEpoch($time);
		}

		$nowTs = time();
		$seconds = $nowTs - $time;

		if($seconds > 2 * 24 * 3600) {
			return "a few days ago";
		} else if($seconds > 24 * 3600) {
			return "yesterday";
		} else if($seconds > 7200) {
			return floor($seconds / 3600) . " hours ago";
		} else if($seconds > 3600) {
			return "an hour ago";
		} else if($seconds >= 120) {
			return floor($seconds / 60) . " minutes ago";
		} else if($seconds >= 60) {
			return "1 minute ago";
		} else if($seconds > 1) {
			return $seconds . " seconds ago";
		} else {
			return "1 second ago";
		}
	}

	/**
	 * @param $time
	 *
	 * @return bool|string
	 */
	public static function DMY($time)
	{
		return self::carbon($time)->format('jS \of M y');
	}

	/**
	 * @param $time
	 *
	 * @return bool|string
	 */
	public static function DMYFull($time)
	{
		return self::carbon($time)->format('jS \of F Y');
	}

	/**
	 * @param $i
	 *
	 * @return string
	 */
	public static function monthDay($i)
	{
		return self::carbon($i)->format('M d');
	}

	/**
	 * @param $day
	 *
	 * @return string
	 */
	public static function day($day)
	{
		$time = strtotime($day . "-01-2014");

		return self::carbon($time)->format('jS');
	}

	/**
	 * @param $i
	 *
	 * @return string
	 */
	public static function month($month, $of = false)
	{
		if($of) {
			$of = "\of ";
		} else {
			$of = "";
		}

		$time = strtotime("01-" . $month . "-2014");

		return self::carbon($time)->format($of . 'F');
	}

	/**
	 * @param      $year
	 * @param bool $comma
	 *
	 * @return string
	 */
	public static function year($year, $comma = false)
	{
		if($comma) {
			$comma = "\, ";
		} else {
			$comma = "";
		}

		$time = strtotime("01-01-" . $year);

		return self::carbon($time)->format($comma . 'Y');
	}
}