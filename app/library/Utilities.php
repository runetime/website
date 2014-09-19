<?php
use Runis\Accounts\Role;
use Runis\Accounts\RoleRepository;
use Runis\Accounts\User;
use Runis\Accounts\UserRepository;
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
		$roles=new RoleRepository(new Role);
		$users=new UserRepository(new User);
		$user=$users->getById($userId);
		$role=$user->importantRole();
		return "<a href='".Utilities::URL('forum/members/'.$userId)."' class='user-".$role[0]->class_name."' title'='".$user->display_name."&#39;s profile'>".$user->display_name."</a>";
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
	public static function memberPhoto($userId){
		if(file_exists('./img/forum/photos/'.$userId.'.png'))
			return 'img/forum/photos/'.$userId.'.png';
		else
			return 'img/forum/photos/no_photo.png';
	}
}