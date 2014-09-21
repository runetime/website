<?php
class String{
	/**
	 * Determines whether a string begins with a substring
	 * @param  string $needle    The substring to search a larger string for
	 * @param  string $haystack  The larger string to search within
	 * @return boolean           Whether a string begins with a substring
	 */
	public static function startsWith($needle="",$haystack=""){
		return(substr($haystack,0,strlen($needle))===$needle);
	}
	/**
	 * Determines whether a string ends with a substring
	 * @param  string $needle    The substring to search a larger string for
	 * @param  string $haystack  The larger string to search within
	 * @return boolean           Whether a string ends with a substring
	 */
	public static function endsWith($needle="",$haystack=""){
		return(substr($haystack,-strlen($needle))===$needle);
	}
}