<?php
namespace App\Utilities;

use App\RuneTime\Accounts\Role;
use App\RuneTime\Accounts\RoleRepository;

/**
 * Class Link
 */
class Link
{
    /**
     * Returns a link to a user's profile, with
     * their role being taken into account.
     *
     * @param $userId
     *
     * @return string
     */
    public static function name($userId)
    {
        $users = \App::make('App\RuneTime\Accounts\UserRepository');
        $user = $users->getById((int) $userId);
        if ($user) {
            return "<a href='/profile/" . \String::slugEncode($user->id, $user->display_name) . "' class='members-" . $user->importantRole()->class_name . "' title'='" . $user->display_name . "&#39;s profile'>" . $user->display_name . '</a>';
        }

        \Log::warning('Utilities\Link::name - ' . $userId . ' does not exist.');

        return 'unknown';
    }

    /**
     * Outputs a colorized string of a role.
     *
     * @param $roleId
     *
     * @return string
     */
    public static function colorRole($roleId)
    {
        $roles = new RoleRepository(new Role);
        $role = $roles->getById($roleId);
        if ($role) {
            return "<span class='members-" . $role->class_name . "' title='" . $role->name . "'>" . $role->name . '</span>';
        }
        \Log::warning('Utilities\Link::colorRole - ' . $roleId . ' does not exist.');

        return 'unknown';
    }

    /**
     * Colors a string according to a role.
     *
     * @param      $str
     * @param      $roleInfo
     * @param bool $displayImage
     *
     * @return string
     */
    public static function color($str, $roleInfo, $displayImage = true)
    {
        $roles = new RoleRepository(new Role);

        if (is_numeric($roleInfo)) {
            $role = $roles->getById($roleInfo);
        } else {
            $role = $roles->getByName($roleInfo);
        }

        if ($role) {
            return "<span class='members-" . $role->class_name . ($displayImage ? '' : '-no-img') . "'>" . $str . '</a>';
        }

        \Log::warning('Utilities\Link::color - ' . $roleInfo . ' does not exist.');

        return $str;
    }
}
