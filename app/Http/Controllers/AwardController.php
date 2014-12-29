<?php
namespace App\Http\Controllers;

use App\RuneTime\Awards\Award;
use App\RuneTime\Awards\AwardRepository;

class AwardController extends BaseController
{
	private $awards;

	/**
	 * @param AwardRepository $awards
	 */
	public function __construct(AwardRepository $awards)
	{
		$this->awards = $awards;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$awards = $this->awards->getByStatus(Award::STATUS_AVAILABLE);

		$this->nav('navbar.runetime.title');
		$this->title('awards.title');
		return $this->view('awards.index', compact('awards'));
	}

	/**
	 * @param $slug
	 * @return \Illuminate\View\View
	 */
	public function getView($slug)
	{
		$award = $this->awards->getBySlug($slug);
		$awardees = $award->users;

		$this->bc(['awards' => trans('awards.title')]);
		$this->nav('navbar.runetime.title');
		$this->title('awards.view.title', ['name' => $award->name]);
		return $this->view('awards.view', compact('award', 'awardees'));
	}
}