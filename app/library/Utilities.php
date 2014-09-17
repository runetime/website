<?php
class Utilities{
	/**
	 * Outputs an encoded and parsed URL
	 * @param  string $url The URL
	 * @return string      The URL-encoded and parsed URL
	 */
	public static function URL($url=""){
		$str="/";
		$url=str_replace(" ","-",$url);
		return $str.$url;
	}
	public static function linkName($userId){
		$user=DB::table('users')->
			select('display_name','role')->
			where('id',$userId)->
			first();
		$role=DB::table('roles')->
			select('class')->
			where('id',$user->role)->
			first();
		return "<a href='".Utilities::URL('forum/members/'.$userId)."' title='".$user->display_name."&#39;s profile'>".$user->display_name."</a>";
	}
	/**
	 * Returns a true or false boolean of whether or not the user agent is a mobile
	 * @return boolean
	 */
	public static function mobile(){
		return preg_match('/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i',$_SERVER['HTTP_USER_AGENT']);
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
}