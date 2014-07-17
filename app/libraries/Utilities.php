<?php
class Utilities{
	/**
	 * Outputs an encoded and parsed URL
	 * @param  string $url The URL
	 * @return string      The URL-encoded and parsed URL
	 */
	public static function URL($url=""){
		$str="/";
		return $str.urlencode($url);
	}
	/**
	 * Returns a true or false boolean of whether or not the user agent is a mobile
	 * @return boolean
	 */
	public static function mobile(){
		return preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i",$_SERVER["HTTP_USER_AGENT"]);
	}
}