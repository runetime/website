<?php
namespace App\Utilities;
use App\Runis\Accounts\Role;
use App\Runis\Accounts\RoleRepository;
use App\Runis\Accounts\User;
use App\Runis\Accounts\UserRepository;
class Link {
	/**
	 * Outputs an encoded and parsed URL
	 * @param  string $url The URL
	 * @return string      The URL-encoded and parsed URL
	 */
	public static function URL($url = ""){
		$str = "/";
		$url = str_replace(" ", "-", $url);
		return $str . $url;
	}
	public static function name($userId){
		$users = new UserRepository(new User);
		$user = $users->getById($userId);
		if($user){
			$role = $user->importantRole();
			return "<a href='/profile/" . \String::slugEncode($user->id, $user->display_name) . "' class='members-" . $role->class_name . "' title'='" . $user->display_name . "&#39;s profile'>" . $user->display_name . "</a>";
		}
		\Log::warning('Utilities\Link::name - ' . $userId . ' does not exist.');
		return "unknown";
	}
	public static function colorRole($roleId) {
		$roles = new RoleRepository(new Role);
		$role = $roles->getById($roleId);
		if($role)
			return "<span class='members-" . $role->class_name . "' title='" . $role->name . "'>" . $role->name . "</span>";
		\Log::warning('Utilities\Link::colorRole - ' . $roleId . ' does not exist.');
		return "unknown";
	}
	public static function color($str,$roleInfo) {
		$roles = new RoleRepository(new Role);
		if(ctype_digit($roleInfo))
			$role = $roles->getById($roleInfo);
		else
			$role = $roles->getByName($roleInfo);
		if($role)
			return "<span class='members-" . $role->class_name . "'>" . $str . "</a>";
		\Log::warning('Utilities\Link::color - ' . $roleInfo . ' does not exist.');
		return $str;
	}
}