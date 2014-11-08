<?php
namespace App\Utilities;
class Time{
	/**
	 * Returns whether or not it is currently DST for the user
	 * @return boolean    Whether or not it is currently DST
	 */
	public static function isDST() {
		return date("I", time());
	}

	/**
	 * @param int $i
	 *
	 * @return bool|string
	 */
	public static function short($i=0) {
		$i = self::getEpoch($i);
		if(self::isDST())
			$i += 3600;
		return date("jS \of F Y", $i);
	}

	/**
	 * @param int $i
	 *
	 * @return bool|string
	 */
	public static function shortTime($i = 0) {
		$i = self::getEpoch($i);
		if(self::isDST())
			$i += 3600;
		return date("jS \of F Y H:i:s", $i);
	}

	/**
	 * @param int $i
	 *
	 * @return bool|string
	 */
	public static function long($i = 0) {
		$i = self::getEpoch($i);
		if(self::isDST())
			$i += 3600;
		return date("jS \of F Y \- H:i:s", $i);
	}

	/**
	 * @param $str
	 *
	 * @return int
	 */
	public static function getEpoch($str) {
		if(is_numeric($str))
			return $str;
		if(is_string($str))
			return strtotime($str);
		return strtotime($str);
	}

	/**
	 * @param $unix
	 *
	 * @return bool|string
	 */
	public static function formatTime($unix) {
		return date('Y-m-d H:i:s', $unix);
	}

	/**
	 * @param $time
	 *
	 * @return string
	 */
	public static function shortReadable($time) {
		if(!is_numeric($time))
			$time = self::getEpoch($time);
		$days = floor((time()-$time)/(60*60*24));
		if($days == 0)     $str = "Today,";
		elseif($days == 1) $str = "Yesterday,";
		elseif($days < 7)  $str = date('l', $time) . ",";
		else               $str = date('Y-m-d');
		return $str . " " . date('H:i', $time);
	}

	public static function timeAgo($time) {
		if(!is_numeric($time))
			$time = self::getEpoch($time);
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
	public static function DMY($time) {
		if(!is_numeric($time))
			$time = self::getEpoch($time);
		return date('jS \of M y', $time);
	}
}