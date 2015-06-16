<?php
namespace App\Http\Controllers;

use App\RuneTime\Bans\Ban;
use App\RuneTime\Bans\BanRepository;
use App\RuneTime\Bans\IP;
use App\RuneTime\Bans\IPRepository;
use Carbon\Carbon;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as RouterController;

/**
 * Class Controller
 */
class Controller extends RouterController
{
    use DispatchesJobs;

    /**
     * @var array
     */
    protected $bc = [];
    /**
     * @var bool
     */
    protected $displayPageHeader = true;
    /**
     * @var string
     */
    protected $nav = '';
    /**
     * @var string
     */
    protected $title = '';

    /**
     * Sets the breadcrumbs for the current page.  If an array,
     * then it is assumed there is a breadcrumbs.  If false,
     * then it is assumed that there are no breadcrumbs.
     *
     * @param array|false $breadcrumbs
     */
    protected function bc($breadcrumbs = [])
    {
        if ($breadcrumbs === false) {
            // The breadcrumbs are meant to be hidden
            $this->displayPageHeader = false;
        } else {
            $this->bc = $breadcrumbs;
        }
    }

    /**
     * A method that sets which section in the navigation bar is used.
     * For example, if the current page is a Calculator, then the
     * RuneScape section in the navbar will be highlighted.
     *
     * @param string $nav
     */
    protected function nav($nav)
    {
        // Set the locale of the page
        $locale = \Cache::get('ip.' . \Request::getClientIp() . '.lang');

        // If the user does not have a cookie for their locale, set default
        if (empty($locale)) {
            \Cache::forever('ip.' . \Request::getClientIp() . '.lang', 'en');
            $locale = \Cache::get('ip.' . \Request::getClientIp() . '.lang');
        }

        \Lang::setLocale($locale);

        $this->nav = trans($nav);
    }

    /**
     * Filler method for future versions that may
     * be used as part of the View rendering.
     */
    protected function setupLayout()
    {
        if (!is_null($this->layout)) {
            $this->layout = \View::make($this->layout);
        }
    }

    /**
     * Sets the title of the page with a translated version
     * of the string that is given from the Lang files.
     *
     * @param string $lang
     * @param array  $data
     */
    protected function title($lang, $data = [])
    {
        $this->title = trans($lang, $data);
    }

    /**
     * Renders the View given by $path, sets the user in the
     * recent activity, checks if the user is banned or IP
     * banned, and if so returns the appropriate view.
     *
     * @param       $path
     * @param array $data
     *
     * @return \Illuminate\View\View
     */
    protected function view($path, $data = [])
    {
        $data['bc'] = $this->bc;
        $data['displayPageHeader'] = $this->displayPageHeader;
        $data['nav'] = $this->nav;
        $data['title'] = $this->title;
        $data['url'] = \Request::getPathInfo();
        if (\Auth::check()) {
            // The user is logged in, so set the last_active time of their account.
            \Auth::user()->last_active = time();
            \Auth::user()->save();
        }

        if (\Auth::check()) {
            $bans = new BanRepository(new Ban);
            $ban = $bans->getByUserId(\Auth::user()->id);

            // Checks if the user is banned
            if (!empty($ban)) {
                // The user is currently banned, so show them the banned page.
                $data['ban'] = $ban;
                $data['bc'] = false;
                $data['displayPageHeader'] = false;
                $data['nav'] = 'navbar.home';
                $data['time'] = Carbon::createFromTimestamp($ban->time_ends)->diffForHumans();
                $data['title'] = trans('navbar.home');

                return \View::make('errors.banned', $data);
            }
        }

        // Checks if the user is IP banned
        $ipBans = new IPRepository(new IP);
        $ipBan = $ipBans->getByIPActive(\Request::getClientIp());
        if (!empty($ipBan)) {
            // The user is IP banned, so show them the IP banned page.
            if (\Auth::check()) {
                \Auth::logout();
            }

            $data['ban'] = $ipBan;
            $data['bc'] = false;
            $data['displayPageHeader'] = false;
            $data['nav'] = 'navbar.home';
            $data['title'] = trans('navbar.home');

            return \View::make('errors.ip_banned', $data);
        }

        $this->updateCache();

        return \View::make($path, $data);
    }

    /**
     * Updates the recent user activity cache with the current
     * user and the current time, pushing out old activity.
     */
    private function updateCache()
    {
        if (\Request::getClientIp() === '127.0.0.1') {
            // The user is localhost - so probably running tests - ignore adding.
            return;
        }

        $current = [
            'url'    => \Request::url(),
            'time'   => time(),
            'title'  => $this->title,
            'logged' => \Auth::check(),
        ];
        $activity = \Cache::get('activity.users');
        if (empty($activity)) {
            // There is absolutely no recent activity, so create an empty array.
            $activity = [];
        }

        if (\Auth::check()) {
            $current['user'] = \Auth::user()->id;
        } else {
            $current['user'] = \Request::getClientIp();
        }

        $ago = Carbon::now()->subMinutes(30)->timestamp;

        // Remove old activity
        foreach ($activity as $key => $value) {
            if (ceil($key / 1000) <= $ago) {
                unset($activity[$key]);
            }

            if ((\Auth::check() && $value['user'] === \Auth::user()->id) || $value['user'] === \Request::getClientIp()) {
                unset($activity[$key]);
            }
        }

        $activity[microtime(true) * 1000] = $current;
        $most = \Cache::get('activity.most');
        $activeCount = count($activity);

        // If the current number of users is greater than before, set a new record.
        if ($activeCount > $most) {
            \Cache::forever('activity.most', $activeCount);
        }

        \Cache::forever('activity.users', $activity);
    }
}
