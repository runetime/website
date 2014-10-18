<?php namespace App\Http\Controllers;
use App\Http\Requests\SettingsAboutForm;
use App\Http\Requests\SettingsPasswordForm;
use App\Http\Requests\SettingsPhotoForm;
use App\Http\Requests\SettingsProfileForm;
use App\Http\Requests\SettingsRuneScapeForm;
use App\Http\Requests\SettingsSignatureForm;
use App\Http\Requests\SettingsSocialForm;
use App\Runis\Accounts\UserRepository;
/**
 * Class SettingsController
 * @package App\Http\Controllers
 *
 * @middleware("auth.logged")
 */
class SettingsController extends BaseController {
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param UserRepository $users
	 */
	public function __construct(UserRepository $users) {
		$this->users = $users;
	}

	/**
	 * @get("settings")
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$h = \Lang::get('settings.profile.timezone.hours');
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
		$thisURL = '/settings/';
		$this->nav('Forums');
		$this->title('User Settings');
		return $this->view('settings.index', compact('timezoneOptions', 'thisURL'));
	}

	/**
	 * @post("settings")
	 * @param SettingsProfileForm $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postIndex(SettingsProfileForm $form) {
		return \redirect()->to('/settings/profile');
	}

	/**
	 * @get("settings/photo")
	 * @return \Illuminate\View\View
	 */
	public function getPhoto() {
		$thisURL = '/settings/photo';
		return $this->view('settings.photo', compact('thisURL'));
	}

	/**
	 * @post("settings/photo")
	 * @param SettingsPhotoForm $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postPhoto(SettingsPhotoForm $form) {
		return \redirect()->to('/settings/photo');
	}

	/**
	 * @get("settings/password")
	 * @return \Illuminate\View\View
	 */
	public function getPassword() {
		$thisURL = '/settings/password';
		return $this->view('settings.password', compact('thisURL'));
	}

	/**
	 * @post("settings/password")
	 *
	 * @param SettingsPasswordForm $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postPassword(SettingsPasswordForm $form) {
		return \redirect()->to('/settings/password');
	}

	/**
	 * @get("settings/about/me")
	 * @return \Illuminate\View\View
	 */
	public function getAbout() {
		$thisURL = '/settings/about/me';
		return $this->view('settings.about', compact('thisURL'));
	}

	/**
	 * @post("settings/about/me")
	 * @param SettingsAboutForm $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postAbout(SettingsAboutForm $form) {
		return \redirect()->to('/settings/about');
	}

	/**
	 * @get("settings/signature")
	 * @return \Illuminate\View\View
	 */
	public function getSignature() {
		$thisURL = '/settings/signature';
		return $this->view('settings.signature', compact('thisURL'));
	}

	/**
	 * @post("settings/signature")
	 * @param SettingsSignatureForm $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postSignature(SettingsSignatureForm $form) {
		return \redirect()->to('/settings/signature');
	}

	/**
	 * @get("settings/social")
	 * @return \Illuminate\View\View
	 */
	public function getSocial() {
		$thisURL = '/settings/social';
		return $this->view('settings.social', compact('thisURL'));
	}

	/**
	 * @post("settings/social")
	 * @param SettingsSocialForm $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postSocial(SettingsSocialForm $form) {
		return \redirect()->to('/settings/social');
	}

	/**
	 * @get("settings/runescape")
	 * @return \Illuminate\View\View
	 */
	public function getRuneScape() {
		$thisURL = '/settings/runescape';
		return $this->view('settings.runescape', compact('thisURL'));
	}

	/**
	 * @post("settings/runescape")
	 * @param SettingsRuneScapeForm $form
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postRuneScape(SettingsRuneScapeForm $form) {
		return \redirect()->to('/settings/runescape');
	}
}
