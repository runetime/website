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
	 * Converts an integer-based timestamp into a readable string with hours:minutes:seconds
	 * @param integer $int     The integer timestamp to convert
	 */
	public static function short($i=0) {
		$i = self::getEpoch($i);
		if(self::isDST())
			$i += 3600;
		return date("jS \of F Y", $i);
	}
	/**
	 * Converts an integer-based timestamp into a readable string with hours:minutes:seconds
	 * @param integer $int     The integer timestamp to convert
	 */
	public static function shortTime($i = 0) {
		$i = self::getEpoch($i);
		if(self::isDST())
			$i += 3600;
		return date("jS \of F Y H:i:s", $i);
	}
	/**
	 * Converts an integer-based timestamp into a readable string with hours:minutes:seconds
	 * @param integer $int     The integer timestamp to convert
	 */
	public static function long($i = 0) {
		$i = self::getEpoch($i);
		if(self::isDST())
			$i += 3600;
		return date("jS \of F Y \- H:i:s", $i);
	}
	public static function getEpoch($str) {
		if(is_numeric($str))
			return $str;
		if(is_string($str))
			return strtotime($str);
		return strtotime($str);
	}
	public static function formatTime($unix) {
		return date('Y-m-d H:i:s', $unix);
	}
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
	public static function DMY($time) {
		if(!is_numeric($time))
			$time = self::getEpoch($time);
		return date('jS \of M y', $time);
	}
}