<?php
namespace App\Utilities;
class Time{
	/**
	 * Returns whether or not it is currently DST for the user
	 * @return boolean    Whether or not it is currently DST
	 */
	public static function isDST(){
		return date("I",time());
	}
	/**
	 * Converts an integer-based timestamp into a readable string with hours:minutes:seconds
	 * @param integer $int     The integer timestamp to convert
	 */
	public static function short($i=0){
		$i=self::getEpoch($i);
		if(self::isDST()){
			$i+=3600;
		}
		return date("jS \of F Y",$i);
	}
	/**
	 * Converts an integer-based timestamp into a readable string with hours:minutes:seconds
	 * @param integer $int     The integer timestamp to convert
	 */
	public static function shortTime($i=0){
		$i=self::getEpoch($i);
		if(self::isDST()){
			$i+=3600;
		}
		return date("jS \of F Y H:i:s",$i);
	}
	/**
	 * Converts an integer-based timestamp into a readable string with hours:minutes:seconds
	 * @param integer $int     The integer timestamp to convert
	 */
	public static function long($i=0){
		$i=self::getEpoch($i);
		if(self::isDST()){
			$i+=3600;
		}
		return date("jS \of F Y \- H:i:s",$i);
	}
	public static function getEpoch($str){
		if(is_numeric($str)){
			return $str;
		}
		if(is_string($str)){
			return strtotime($str);
		}
		return strtotime($str);
	}
}