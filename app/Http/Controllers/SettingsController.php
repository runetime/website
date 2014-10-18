<?php namespace App\Http\Controllers;
use App\Http\Requests\SettingsAboutForm;
use App\Http\Requests\SettingsEmailForm;
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
		$this->nav('Forums');
		$this->title('User Settings');
		return $this->view('settings.index');
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
		return $this->view('settings.photo');
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
		return $this->view('settings.password');
	}

	/**
	 * @post("settings/password")
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
		return $this->view('settings.about');
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
		return $this->view('settings.signature');
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
		return $this->view('settings.social');
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
		return $this->view('settings.runescape');
	}

	/**
	 * @post("settings/runescape")
	 * @param SettingsRuneScapeForm $form
	 */
	public function postRuneScape(SettingsRuneScapeForm $form) {
		return \redirect()->to('/settings/runescape');
	}
}
