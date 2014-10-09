<?php
namespace App\Utilities;
use App\Runis\Accounts\Role;
use App\Runis\Accounts\RoleRepository;
use App\Runis\Accounts\User;
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
	public static function slugEncode(){
		$args=func_get_args();
		$slug="";
		foreach($args as $x=>$arg){
			$slug.=strtolower(str_replace(" ","-",$arg));
			if($x<count($arg))
				$slug.="-";
		}
		return $slug;
	}
	public static function slugDecode($slug){
		$slugArr=[];
		$slug=explode("-",$slug,2);
		$slugArr['id']=$slug[0];
		$slugArr['name']=ucwords(str_replace("-"," ",$slug[1]));
		return $slugArr;
	}
	public static function encodeIP($ip=""){
		if(empty($ip))
			$ip = \Request::ip();
		return ip2long($ip);
	}
	public static function decodeIP($ip){
		return long2ip($ip);
	}
	public static function color($str,$roleInfo){
		$roles=new RoleRepository(new Role);
		if(ctype_digit($roleInfo))
			$role=$roles->getById($roleInfo);
		else
			$role=$roles->getByName($roleInfo);
		if($role)
			return "<span class='members-".$role->class_name."'>".$str."</a>";
		else
			\Log::warning('Utilities\Link::color - '.$roleInfo.' does not exist.');
		return $str;
	}
	public static function importantRole($id){
		$user=User::find($id);
		$roles=$user->getRoles();
		if(!empty($roles))
			return $roles[rand(0,count($roles)-1)];
		return -1;
	}
}