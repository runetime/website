<?php
namespace App\Http\Controllers;

use App\Http\Requests\Settings\AboutRequest;
use App\Http\Requests\Settings\PasswordRequest;
use App\Http\Requests\Settings\PhotoRequest;
use App\Http\Requests\Settings\ProfileRequest;
use App\Http\Requests\Settings\RuneScapeRequest;
use App\Http\Requests\Settings\SignatureRequest;
use App\Http\Requests\Settings\SocialRequest;
use App\RuneTime\Accounts\User;
use App\RuneTime\Accounts\UserRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

/**
 * Class SettingsController
 */
final class SettingsController extends Controller
{
    /**
     * @var UserRepository
     */
    private $users;

    /**
     * @param UserRepository $users
     */
    public function __construct(UserRepository $users)
    {
        $this->users = $users;
    }

    /**
     * @return View
     */
    public function getIndex()
    {
        $h = trans('settings.profile.timezone.hours');
        $timezoneOptions = [
            '-12'   => '(UTC-12:00 ' . $h . ') Enitwetok, Kwajalien',
            '-11'   => '(UTC-11:00 ' . $h . ') Midway Island, Samoa',
            '-10'   => '(UTC-10:00 ' . $h . ') Hawaii',
            '-9.5'  => '(UTC-9:30 ' . $h . ') French Polynesia',
            '-9'    => '(UTC-9:00 ' . $h . ') Alaska',
            '-8'    => '(UTC-8:00 ' . $h . ') Pacific Time (US &amp; Canada)',
            '-7'    => '(UTC-7:00 ' . $h . ') Mountain Time (US &amp; Canada)',
            '-6'    => '(UTC-6:00 ' . $h . ') Central Time (US &amp; Canada), Mexico City',
            '-5'    => '(UTC-5:00 ' . $h . ') Eastern Time (US &amp; Canada), Bogota, Lima',
            '-4.5'  => '(UTC-4:30 ' . $h . ') Bolivarian Time',
            '-4'    => '(UTC-4:00 ' . $h . ') Atlantic Time (Canada), Caracas, La Paz',
            '-3.5'  => '(UTC-3:30 ' . $h . ') Newfoundland',
            '-3'    => '(UTC-3:00 ' . $h . ') Brazil, Buenos Aires, Falkland Is.',
            '-2'    => '(UTC-2:00 ' . $h . ') Mid-Atlantic, Ascention Is., St Helena',
            '-1'    => '(UTC-1:00 ' . $h . ') Azores, Cape Verde Islands',
            '0'     => '(GMT) Casablanca, Dublin, London, Lisbon, Monrovia',
            '1'     => '(UTC+1:00 ' . $h . ') Brussels, Copenhagen, Madrid, Paris, Rome',
            '2'     => '(UTC+2:00 ' . $h . ') South Africa',
            '3'     => '(UTC+3:00 ' . $h . ') Baghdad, Riyadh, Kaliningrad, Nairobi',
            '3.5'   => '(UTC+3:30 ' . $h . ') Tehran',
            '4'     => '(UTC+4:00 ' . $h . ') Abu Dhabi, Baku, Moscow, Muscat, Tbilisi',
            '4.5'   => '(UTC+4:30 ' . $h . ') Kabul',
            '5'     => '(UTC+5:00 ' . $h . ') Karachi, Tashkent',
            '5.5'   => '(UTC+5:30 ' . $h . ') Bombay, Calcutta, Madras, New Delhi',
            '5.75'  => '(UTC+5:45 ' . $h . ') Kathmandu',
            '6'     => '(UTC+6:00 ' . $h . ') Almaty, Bangladesh, Dhakra, Ekaterinburg',
            '6.5'   => '(UTC+6:30 ' . $h . ') Yangon, Naypyidaw, Bantam',
            '7'     => '(UTC+7:00 ' . $h . ') Bangkok, Hanoi, Jakarta',
            '8'     => '(UTC+8:00 ' . $h . ') Hong Kong, Perth, Singapore, Taipei',
            '8.75'  => '(UTC+8:45 ' . $h . ') Caiguna, Eucla',
            '9'     => '(UTC+9:00 ' . $h . ') Osaka, Sapporo, Seoul, Tokyo',
            '9.5'   => '(UTC+9:30 ' . $h . ') Adelaide, Darwin',
            '10'    => '(UTC+10:00 ' . $h . ') Melbourne, Papua New Guinea, Sydney',
            '10.5'  => '(UTC+10:30 ' . $h . ') Lord Howe Island',
            '11'    => '(UTC+11:00 ' . $h . ') New Caledonia, Solomon Is.',
            '11.5'  => '(UTC+11:30 ' . $h . ') Burnt Pine, Kingston',
            '12'    => '(UTC+12:00 ' . $h . ') Auckland, Fiji, Marshall Islands',
            '12.75' => '(UTC+12:45 ' . $h . ') Chatham Islands',
            '13'    => '(UTC+13:00 ' . $h . ') Enderbury Kiribati',
            '14'    => '(UTC+14:00 ' . $h . ') Kiritimati',
        ];

        $bDay = \Auth::user()->birthday_day;
        $bMonth = \Auth::user()->birthday_month;
        $bYear = \Auth::user()->birthday_year;

        $genders = [
            User::GENDER_NOT_TELLING => trans('profile.gender.not_telling'),
            User::GENDER_FEMALE      => trans('profile.gender.female'),
            User::GENDER_MALE        => trans('profile.gender.male'),
        ];

        $thisURL = '/settings/';

        $this->nav('navbar.forums');
        $this->title('settings.profile.title');

        return $this->view('settings.index', compact('timezoneOptions', 'thisURL', 'bDay', 'bMonth', 'bYear', 'genders'));
    }

    /**
     * @param ProfileRequest $form
     *
     * @return RedirectResponse
     */
    public function postIndex(ProfileRequest $form)
    {
        $user = $this->users->getById(\Auth::user()->id);
        $referred = $this->users->getByDisplayName($form->referred_by);
        $year = $form->birthday_year;
        $month = $form->birthday_month;
        $day = $form->birthday_day;
        if ($year != 0) {
            $user->birthday_year = $year;
        }

        if ($month != 0) {
            $user->birthday_month = $month;
        }

        if ($day != 0) {
            $user->birthday_day = $day;
        }

        $user->timezone = (float) $form->timezone;
        $user->dst = $form->dst ? true : false;
        if ($form->gender >= 0 && $form->gender <= 2) {
            $user->gender = $form->gender;
        }

        $user->location = $form->location;
        $user->interests = $form->interests;
        $user->referred_by = !empty($referred) ? $referred->id : -1;
        $user->save();

        return redirect()->to('settings');
    }

    /**
     * @return View
     */
    public function getPhoto()
    {
        $thisURL = '/settings/photo';

        $this->bc(['settings' => trans('settings.title')]);
        $this->nav('navbar.forums');
        $this->title('settings.photo.title');

        return $this->view('settings.photo', compact('thisURL'));
    }

    /**
     * @param PhotoRequest $form
     *
     * @return RedirectResponse
     */
    public function postPhoto(PhotoRequest $form)
    {
        $file = \Request::file('photo');
        if (substr($file->getMimeType(), 0, 6) == 'image/') {
            $pic = \Auth::user()->id . '.png';
            $uploaded = \String::uploaded('avatars', $pic);
            $img = \Img::make($form->file('photo'));
            if (file_exists($uploaded)) {
                unlink($uploaded);
            }

            $img->save($uploaded);
        }

        return redirect()->to('/settings/photo');
    }

    /**
     * @return View
     */
    public function getPassword()
    {
        $error = \Session::pull('settings.error', '');
        $current = \Session::pull('settings.current', '');
        $new = \Session::pull('settings.new', '');
        $newConfirm = \Session::pull('settings.new_confirm', '');
        $thisURL = '/settings/password';

        $this->bc(['settings' => trans('settings.title')]);
        $this->nav('navbar.forums');
        $this->title('settings.password.title');

        return $this->view('settings.password', compact('error', 'current', 'new', 'newConfirm', 'thisURL'));
    }

    /**
     * @param PasswordRequest $form
     *
     * @return RedirectResponse
     */
    public function postPassword(PasswordRequest $form)
    {
        $user = $this->users->getById(\Auth::user()->id);
        if ($form->new !== $form->new_confirm) {
            \Session::put('settings.error', trans('settings.password.error.not_match'));
        } elseif (\Auth::validate(['email' => \Auth::user()->email, 'password' => $form->current])) {
            $user->password = \Hash::make($form->new);
            $user->save();

            return redirect()->to('/settings/password');
        } else {
            \Session::put('settings.error', trans('settings.password.error.incorrect'));
        }

        \Session::put('settings.current', $form->current);
        \Session::put('settings.new', $form->new);
        \Session::put('settings.new_confirm', $form->new_confirm);

        return redirect()->to('/settings/password');
    }

    /**
     * @return View
     */
    public function getAbout()
    {
        $thisURL = '/settings/about-me';

        $this->bc(['settings' => trans('settings.title')]);
        $this->nav('navbar.forums');
        $this->title('settings.about.title');

        return $this->view('settings.about', compact('thisURL'));
    }

    /**
     * @param AboutRequest $form
     *
     * @return RedirectResponse
     */
    public function postAbout(AboutRequest $form)
    {
        $user = $this->users->getById(\Auth::user()->id);
        $user->about = $form->contents;
        $user->about_parsed = with(new \Parsedown)->text($form->contents);
        $user->save();

        return redirect()->to('/settings/about-me');
    }

    /**
     * @return View
     */
    public function getSignature()
    {
        $thisURL = '/settings/signature';

        $this->bc(['settings' => trans('settings.title')]);
        $this->nav('navbar.forums');
        $this->title('settings.signature.title');

        return $this->view('settings.signature', compact('thisURL'));
    }

    /**
     * @param SignatureRequest $form
     *
     * @return RedirectResponse
     */
    public function postSignature(SignatureRequest $form)
    {
        $user = $this->users->getById(\Auth::user()->id);
        $user->signature = $form->contents;
        $user->signature_parsed = with(new \Parsedown)->text($form->contents);
        $user->save();

        return redirect()->to('/settings/signature');
    }

    /**
     * @return View
     */
    public function getSocial()
    {
        $thisURL = '/settings/social';

        $this->bc(['settings' => trans('settings.title')]);
        $this->nav('navbar.forums');
        $this->title('settings.social.title');

        return $this->view('settings.social', compact('thisURL'));
    }

    /**
     * @param SocialRequest $form
     *
     * @return RedirectResponse
     */
    public function postSocial(SocialRequest $form)
    {
        $user = $this->users->getById(\Auth::user()->id);
        $user->social_twitter = $form->twitter;
        $user->social_facebook = $form->facebook;
        $user->social_youtube = $form->youtube;
        $user->social_website = $form->website;
        $user->social_skype = $form->skype;
        $user->save();

        return redirect()->to('/settings/social');
    }

    /**
     * @return View
     */
    public function getRuneScape()
    {
        $versions = [
            'Old-School',
            'RuneScape 3',
            'Neither',
        ];
        $allegiances = [
            'Godless',
            'Saradomin',
            'Zamorak',
            'Armadyl',
            'Zaros',
            'Seren',
            'Brassica Prime',
            'Bandos (Deceased)',
            'Guthix (Deceased)',
        ];
        $thisURL = '/settings/runescape';

        $this->bc(['settings' => trans('settings.title')]);
        $this->nav('navbar.forums');
        $this->title('settings.runescape.title');

        return $this->view('settings.runescape', compact('thisURL', 'versions', 'allegiances'));
    }

    /**
     * @param RuneScapeRequest $form
     *
     * @return RedirectResponse
     */
    public function postRuneScape(RuneScapeRequest $form)
    {
        $user = $this->users->getById(\Auth::user()->id);
        $versions = [
            'Old-School',
            'RuneScape 3',
            'Neither',
        ];
        $allegiances = [
            'Godless',
            'Saradomin',
            'Zamorak',
            'Armadyl',
            'Zaros',
            'Seren',
            'Brassica Prime',
            'Bandos (Deceased)',
            'Guthix (Deceased)',
        ];
        if (in_array($form->version, $versions)) {
            $user->runescape_version = $form->version;
        }

        if (in_array($form->allegiance, $allegiances)) {
            $user->runescape_allegiance = $form->allegiance;
        }

        $user->runescape_rsn = $form->rsn;
        $user->runescape_clan = $form->clan;
        $user->save();

        return redirect()->to('/settings/runescape');
    }
}
