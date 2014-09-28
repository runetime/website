<?php
namespace App\Utilities;
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
	public static function CURL($url){
		$ch=curl_init();
		curl_setopt($ch,CURLOPT_URL,$url);
		curl_setopt($ch,CURLOPT_HEADER,0);
		curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
		$output=curl_exec($ch);
		curl_close($ch);
		return $output;
	}
	public static function slug(){
		$args=func_get_args();
		$slug="";
		foreach($args as $x=>$arg){
			$slug.=strtolower(str_replace(" ","-",$arg));
			if($x<count($arg))
				$slug.="-";
		}
		return $slug;
	}
}