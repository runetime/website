<?php
namespace App\Utilities;

use Carbon\Carbon;

/**
 * Class Time
 * @package App\Utilities
 */
class Time
{
	/**
	 * Returns a Carbon class of the current time,
	 * DST being adjusted in the Unix time.
	 *
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
	 * Returns whether or not it is currently DST for the user.
	 *
	 * @return boolean    Whether or not it is currently DST
	 */
	public static function isDST()
	{
		return carbon::now()->dst;
	}

	/**
	 * Returns a string of a short display of the time.
	 *
	 * @param int $i
	 *
	 * @return bool|string
	 */
	public static function short($i = 0)
	{
		return self::carbon($i)->format('jS \of F Y');
	}

	/**
	 * Pretty much a short way of giving the full
	 * time, seconds included in the string.
	 *
	 * @param int $i
	 *
	 * @return bool|string
	 */
	public static function shortTime($i = 0)
	{
		return self::carbon($i)->format('jS \of F Y H:i:s');
	}

	/**
	 * Returns the longest declaration for the time,
	 * printing out an "of" in there as well.
	 *
	 * @param int $i
	 *
	 * @return bool|string|Carbon
	 */
	public static function long($i = 0)
	{
		return self::carbon($i)->format('jS \of F Y \- H:i:s');
	}

	/**
	 * Returns the number of seconds since the Epoch
	 * on the 1st of January, 1970 at midnight.
	 *
	 * @param $str
	 *
	 * @return int
	 */
	public static function getEpoch($str)
	{
		return self::carbon($str)->timestamp;
	}

	/**
	 * Formats the time into what is ACTUALLY PROPER ISO STANDARD.
	 * >:C Best display of time ok
	 *
	 * @param $unix
	 *
	 * @return bool|string
	 */
	public static function formatTime($unix)
	{
		return self::carbon($unix)->format('Y-m-d H:i:s');
	}

	/**
	 * Returns a string to a relative time ago, such as
	 * "10 seconds ago", "15 minutes ago", "3 hours
	 * ago", "1 day ago", "a few days ago", etc.
	 *
	 * @param $time
	 *
	 * @return string
	 */
	public static function shortReadable($time)
	{
		return self::carbon($time)->diffForHumans();
	}

	/**
	 * Basically the same as self::shortReadable.
	 * Not sure why I have both, but I do
	 * for a reason I guess.  Maybe work
	 * on deprecating this?
	 *
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
	 * An alterative way of formatting the time.
	 *
	 * @param $time
	 *
	 * @return bool|string
	 */
	public static function DMY($time)
	{
		return self::carbon($time)->format('jS \of M y');
	}

	/**
	 * Another alternative way of formatting the time.
	 *
	 * @param $time
	 *
	 * @return bool|string
	 */
	public static function DMYFull($time)
	{
		return self::carbon($time)->format('jS \of F Y');
	}

	/**
	 * Wow, so many alternatives.  Look up "date" on php.net.
	 *
	 * @param $i
	 *
	 * @return string
	 */
	public static function monthDay($i)
	{
		return self::carbon($i)->format('M d');
	}

	/**
	 * Formats the numeric day (1-31) with its suffix,
	 * i.e. the suffixes "st", "nd", "rd", "th".
	 *
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
	 * Formats the month from a numeric value to...
	 * the same thing, with "of" if you choose.
	 * @param      $month
	 * @param bool $of
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
	 * Formats the year from a numeric value to... the same
	 * thing, with a comma if you want for some reason.
	 *
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