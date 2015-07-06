<?php
namespace App\Utilities;

use App\RuneTime\Accounts\Role;
use App\RuneTime\Accounts\RoleRepository;
use App\RuneTime\Accounts\User;

/**
 * Class String
 */
final class String
{
    /**
     * Determines whether a string begins with a substring.
     *
     * @param string $needle
     * @param string $haystack
     *
     * @return bool
     */
    public static function startsWith($needle = '', $haystack = '')
    {
        return(substr($haystack, 0, strlen($needle)) === $needle);
    }

    /**
     * Determines whether a string ends with a substring.
     *
     * @param string $needle
     * @param string $haystack
     *
     * @return bool
     */
    public static function endsWith($needle = '', $haystack = '')
    {
        return(substr($haystack, -strlen($needle)) === $needle);
    }

    /**
     * Replaces the first instance of a string with another.
     *
     * @param        $needle
     * @param        $haystack
     * @param string $with
     *
     * @return mixed
     */
    public static function replaceFirst($needle, $haystack, $with = '')
    {
        $pos = strpos($haystack, $needle);

        if ($pos !== false) {
            return substr_replace($haystack, $with, $pos, strlen($needle));
        }

        return $haystack;
    }

    /**
     * Returns the string results of a CURL request to a URL.
     *
     * @param $url
     *
     * @return mixed
     */
    public static function CURL($url)
    {
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        $results = curl_exec($curl);
        curl_close($curl);

        return $results;
    }

    /**
     * Encodes an array into a string slug.
     *
     * @return string
     */
    public static function slugEncode()
    {
        $args = func_get_args();
        $slug = '';

        foreach ($args as $x => $arg) {
            $from = ['?', ' '];
            $to = [' ', '-'];
            $slug .= strtolower(str_ireplace($from, $to, $arg));
            if ($x < count($arg)) {
                $slug .= '-';
            }
        }

        if (\String::endsWith('-', $slug)) {
            $slug = substr($slug, 0, -1);
        }

        return $slug;
    }

    /**
     * Decodes a string slug into an array.
     *
     * @param $slug
     *
     * @return array
     */
    public static function slugDecode($slug)
    {
        $slugArr = [];
        $slug = explode('-', $slug, 2);
        $slugArr['id'] = $slug[0];
        $slugArr['name'] = ucwords(str_replace('-', ' ', $slug[1]));

        return $slugArr;
    }

    /**
     * Encodes an IP into an integer.
     *
     * @param string $ip
     *
     * @return int
     */
    public static function encodeIP($ip = '')
    {
        if (empty($ip)) {
            $ip = \Request::ip();
        }

        return ip2long($ip);
    }

    /**
     * Decodes an IP integer into a string.
     *
     * @param $ip
     *
     * @return string
     */
    public static function decodeIP($ip)
    {
        return long2ip($ip);
    }

    /**
     * Returns a string colorized by a given role.
     *
     * @param      $str
     * @param      $roleInfo
     * @param bool $img
     *
     * @return string
     */
    public static function color($str, $roleInfo, $img = true)
    {
        $roles = new RoleRepository(new Role);

        if (is_numeric($roleInfo)) {
            $role = $roles->getById($roleInfo);
        } else {
            $role = $roles->getByName($roleInfo);
        }

        if ($role) {
            return "<span class='members-" . $role->class_name . '' . ($img ? '' : '-no-img') . "'>" . $str . '</span>';
        } else {
            \Log::warning('Utilities\Link::color - ' . $roleInfo . ' does not exist.');
        }

        return $str;
    }

    /**
     * @param        $string
     * @param string $placement
     *
     * @return string
     */
    public static function tooltip($string, $placement = 'top')
    {
        return "data-toggle='tooltip' data-placement='" . $placement . "' title='" . $string . "'";
    }

    /**
     * Returns a string of the gender's name - given by
     * ID - with its image if $image is set to true.
     *
     * @param      $genderId
     * @param bool $image
     *
     * @return string
     */
    public static function gender($genderId, $image = true)
    {
        switch ($genderId) {
            case User::GENDER_FEMALE:
                $name = 'Female';
                break;
            case User::GENDER_MALE:
                $name = 'Male';
                break;
            case User::GENDER_NOT_TELLING:
            default:
                $name = 'Not Telling';
                break;
        }

        $ret = '';
        if ($image === true) {
            $ret .= "<img src='/img/forums/gender/" . $genderId . ".png' alt='" . $name . "' /> ";
        }

        return $ret . $name;
    }

    /**
     * Retrives the given RSN's hiscores for RS3, caches
     * it, and returns the user's hiscores as an array.
     *
     * @param $rsn
     *
     * @return array|bool|mixed
     */
    public static function getHiscore($rsn)
    {
        if (\Cache::get('hiscores.' . $rsn)) {
            return \Cache::get('hiscores.' . $rsn);
        }

        $url = 'http://services.runescape.com/m=hiscore/index_lite.ws?player=' . $rsn;
        $results = \String::CURL($url);

        if (substr($results, 0, 6) == '<html>') {
            $results = false;
        } else {
            $scores = explode("\n", $results);
            foreach ($scores as $key => $text) {
                $scores[$key] = explode(',', $text);
            }

            $results = $scores;
        }

        \Cache::put('hiscores.' . $rsn, $results, \Carbon::now()->addDay());

        return $results;
    }

    /**
     * Retrieves the given RSN's hiscores for OSRS, caches
     * it, and returns the user's hiscores as an array.
     *
     * @param $rsn
     *
     * @return array|bool|mixed
     */
    public function getHiscoreOSRS($rsn)
    {
        /*
         * Rank, Level, XP
         * Attack
         * Defence
         * Strength
         * Hitpoints
         * Ranged
         * Prayer
         * Magic
         * Cooking
         * Woodcutting
         * Fletching
         * Fishing
         * Firemaking
         * Crafting
         * Smithing
         * Mining
         * Herblore
         * Agility
         * Thieving
         * Slayer
         * Farming
         * Runecraft
         * Hunter
         * Construction
         */
        if (\Cache::get('hiscoresOld.' . $rsn)) {
            return \Cache::get('hiscoresOld.' . $rsn);
        }

        $url = 'services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=' . $rsn;
        $results = \String::CURL($url);

        if (substr($results, 0, 6) == '<html>') {
            $results = false;
        } else {
            $scores = explode("\n", $results);
            foreach ($scores as $key => $text) {
                $scores[$key] = explode(',', $text);
            }

            $results = $scores;
        }

        \Cache::put('hiscoresOld.' . $rsn, $results, \Carbon::now()->addDay());

        return $results;
    }

    /**
     * Returns an absolute path to the `uploaded` folder with
     * the path of $name included in the generated string.
     *
     * @param $directory
     * @param $name
     *
     * @return string
     */
    public static function uploaded($directory, $name)
    {
        return public_path('img/uploaded/' . $directory . '/' . $name);
    }

    /**
     * Returns an absolute path to the `generated` folder with
     * the path of $name included in the generated string.
     *
     * @param $directory
     * @param $name
     *
     * @return string
     */
    public static function generated($directory, $name)
    {
        return public_path('img/generated/' . $directory . '/' . $name);
    }
}
