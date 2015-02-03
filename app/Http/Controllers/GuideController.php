<?php
namespace App\Http\Controllers;

use App\Http\Requests\Guides\LocationCreateRequest;
use App\Http\Requests\Guides\QuestCreateRequest;
use App\RuneTime\Guides\Location;
use App\RuneTime\Guides\LocationRepository;
use App\RuneTime\Guides\Quest;
use App\RuneTime\Guides\QuestRepository;

/**
 * Class GuideController
 * @package App\Http\Controllers
 */
class GuideController extends Controller
{
	/**
	 * @var LocationRepository
	 */
	private $locations;
	/**
	 * @var QuestRepository
	 */
	private $quests;

	/**
	 * @param LocationRepository $locations
	 * @param QuestRepository    $quests
	 */
	public function __construct(LocationRepository $locations, QuestRepository $quests)
	{
		$this->locations = $locations;
		$this->quests = $quests;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->nav('navbar.runescape.title');
		$this->title('guides.title');
		return $this->view('guides.index');
	}

	/**
	 * @param int $searchDifficulty
	 * @param int $searchLength
	 * @param int $searchMembership
	 *
	 * @return \Illuminate\View\View
	 */
	public function getQuests($searchDifficulty = 0, $searchLength = 0, $searchMembership = 0)
	{
		$difficulties = $this->quests->getOptions('difficulty');
		$lengths = $this->quests->getOptions('length');
		$memberships = $this->quests->getOptions('membership');
		$guides = $this->quests->getByOptions($searchDifficulty, $searchLength, $searchMembership);

		$this->bc(['guides' => trans('guides.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('guides.quests.title');
		return $this->view('guides.quests.index', compact('difficulties', 'lengths', 'memberships', 'guides', 'searchDifficulty', 'searchLength', 'searchMembership'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View|int
	 */
	public function getQuestView($id)
	{
		$guide = $this->quests->getById($id);
		if(empty($guide)) {
			return \Error::abort(404);
		}

		$guide->editors = json_decode($guide->editors);
		$difficulty = $this->quests->getOptionById($guide->difficulty);
		$length = $this->quests->getOptionById($guide->length);
		$editList = "";
		if(!empty($guide->editors)) {
			foreach($guide->editors as $x => $editor) {
				$editList .= \Link::name($editor) . ($x < count(json_decode($guide->editors)) - 1 ? ", " : "");
			}
		}

		$this->bc(['guides' => trans('guides.title'), 'guides/quests' => trans('guides.quests.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('guides.quests.view.title', ['name' => $guide->name]);
		return $this->view('guides.quests.view', compact('guide', 'difficulty', 'length', 'editList'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getQuestCreate()
	{
		$this->bc(['guides' => trans('guides.title'), 'guides/quests' => trans('guides.quests.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('guides.quests.create.title');
		return $this->view('guides.quests.create');
	}

	/**
	 * @param QuestCreateRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postQuestCreate(QuestCreateRequest $form)
	{
		$parsedown = new \Parsedown;
		$editors = json_encode([]);
		$membership = $form->membership == 11 ? 11 : 10;
		$completed = $form->completed == 1 ? true : false;
		$description = $parsedown->text($form->description);
		$questRequirements = $parsedown->text($form->quest_requirements);
		$skillRequirements = $parsedown->text($form->skill_requirements);
		$itemsRequired = $parsedown->text($form->items_required);
		$itemsRecommended = $parsedown->text($form->items_recommended);
		$rewards = $parsedown->text($form->rewards);
		$startingPoint = $parsedown->text($form->starting_point);
		$contents = $form->contents;
		$contentsParsed = $parsedown->text($form->contents);
		$quest = with(new Quest)->saveNew($form->name, \Auth::user()->id, $editors, $form->difficulty, $form->length, $form->qp, $membership, $completed, $description, $questRequirements, $skillRequirements, $itemsRequired, $itemsRecommended, $rewards, $startingPoint, $contents, $contentsParsed);

		return \redirect()->to('guides/quests/' . \String::slugEncode($quest->id, $quest->name));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getLocations()
	{
		$guides = $this->locations->getAll();

		$this->bc(['guides' => trans('guides.title')]);
		$this->nav(trans('navbar.runescape.title'));
		$this->title('guides.locations.title');
		return $this->view('guides.locations.index', compact('guides'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View|int
	 */
	public function getLocationView($id)
	{
		$guide = $this->locations->getById($id);
		if(empty($guide)) {
			return \Error::abort(404);
		}

		$guide->editors = json_decode($guide->editors);
		if(!$guide) {
			return \Error::abort(404);
		}

		$editList = "";
		if(!empty($guide->editors)) {
			foreach($guide->editors as $x => $editor) {
				$editList .= \Link::name($editor) . ($x < count($guide->editors) - 1 ? ", " : "");
			}
		}

		$this->bc(['guides' => trans('guides.title'), 'guides/locations' => trans('guides.locations.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('guides.locations.view.title', ['name' => $guide->name]);
		return $this->view('guides.locations.view', compact('guide', 'editList'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getLocationCreate()
	{
		$this->bc(['guides' => trans('guides.title'), 'guides/locations' => trans('guides.locations.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('guides.locations.create.title');
		return $this->view('guides.locations.create');
	}

	/**
	 * @param LocationCreateRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postLocationCreate(LocationCreateRequest $form)
	{
		$editors = json_encode([]);
		$contents = $form->contents;
		$contentsParsed = with(new \Parsedown)->text($contents);
		$location = with(new Location)->saveNew($form->name, \Auth::user()->id, $editors, $contents, $contentsParsed);

		return \redirect()->to('guides/locations/' . \String::slugEncode($location->id, $location->name));
	}
}