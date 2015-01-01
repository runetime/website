<?php
namespace App\Http\Controllers;

class ClanController extends Controller
{

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$punishments = [
			trans('clan.punishments.warning') => [
				trans('clan.offenses.arguing'),
				trans('clan.offenses.flaming'),
				trans('clan.offenses.spamming'),
			],
			trans('clan.punishments.temp_ban') => [
				trans('clan.offenses.put_down'),
				trans('clan.offenses.warnings_3'),
				trans('clan.offenses.warnings_6'),
			],
			trans('clan.punishments.ban') => [
				trans('clan.offenses.discrimination'),
				trans('clan.offenses.racism'),
				trans('clan.offenses.sexism'),
				trans('clan.offenses.warnings_9'),
			],
		];

		$this->nav('navbar.social.title');
		$this->title('clan.title');
		return $this->view('clan', compact('punishments'));
	}
}