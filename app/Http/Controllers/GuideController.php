<?php
namespace App\Http\Controllers;
use App\Http\Requests\Guides\LocationCreateRequest;
use App\Http\Requests\Guides\QuestCreateRequest;
use App\RuneTime\Guides\LocationRepository;
use App\RuneTime\Guides\Quest;
use App\RuneTime\Guides\QuestRepository;
/**
 * Class GuideController
 * @package App\Http\Controllers
 */
class GuideController extends BaseController {
	/**
	 * @var QuestRepository
	 */
	private $quests;
	/**
	 * @var LocationRepository
	 */
	private $locations;

	/**
	 * @param LocationRepository $locations
	 * @param QuestRepository    $quests
	 */
	public function __construct(LocationRepository $locations, QuestRepository $quests) {
		$this->quests = $quests;
		$this->locations = $locations;
	}

	/**
	 * @get("guides")
	 */
	public function getIndex() {
		$this->nav('Runescape');
	}

	/**
	 * @param int $searchDifficulty
	 * @param int $searchLength
	 * @param int $searchMembership
	 *
	 * @return \Illuminate\View\View
	 */
	public function getQuests($searchDifficulty = 0, $searchLength = 0, $searchMembership = 0) {
		$difficulties = $this->quests->getOptions('difficulty');
		$lengths = $this->quests->getOptions('length');
		$memberships = $this->quests->getOptions('membership');
		$guides = $this->quests->getByOptions($searchDifficulty, $searchLength, $searchMembership);
		$this->bc(['guides' => 'Guides']);
		$this->nav('Runescape');
		$this->title('Quest Guides');
		return $this->view('guides.quests.index', compact('difficulties', 'lengths', 'memberships', 'guides', 'searchDifficulty', 'searchLength', 'searchMembership'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View|int
	 */
	public function getQuestView($id) {
		$guide = $this->quests->getById($id);
		$difficulty = $this->quests->getOptionById($guide->difficulty);
		$length = $this->quests->getOptionById($guide->length);
		$editList = "";
		if(!empty(json_decode($guide->editors))) {
			foreach(json_decode($guide->editors) as $x => $editor) {
				$editList .= \Link::name($editor);
				if($x < count(json_decode($guide->editors)) - 1)
					$editList .= ", ";
			}
		}
		if($guide) {
			$this->bc(['guides' => 'Guides', 'guides/quests' => 'Quests']);
			$this->nav('Runescape');
			$this->title($guide->name);
			return $this->view('guides.quests.view', compact('guide', 'difficulty', 'length', 'editList'));
		}
		\App::abort(404);
		return 1;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getQuestCreate() {
		$this->bc(['guides' => 'Guides', 'guides/quests' => 'Quests']);
		$this->nav('navbar.runescape.runescape');
		$this->title('Creating a Quest Guide');
		return $this->view('guides.quests.create');
	}

	/**
	 * @param QuestCreateRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postQuestCreate(QuestCreateRequest $form) {
		$parsedown = new \Parsedown;
		$editors = json_encode([]);
		$membership = $form->membership == 11 ? true : false;
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
		$quest = new Quest;
		$quest = $quest->saveNew($form->name, \Auth::user()->id, $editors, $form->difficulty, $form->length, $form->qp, $membership, $completed, $description, $questRequirements, $skillRequirements, $itemsRequired, $itemsRecommended, $rewards, $startingPoint, $contents, $contentsParsed);
		return \redirect()->to('guides/quests/' . \String::slugEncode($quest->id, $quest->name));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getLocations() {
		$guides = $this->locations->getAll();
		$this->bc(['guides' => 'Guides']);
		$this->nav('Runescape');
		$this->title('Location Guides');
		return $this->view('guides.quests.index', compact('guides'));
	}
	public function getLocationCreate() {

	}

	/**
	 * @param LocationCreateRequest $form
	 */
	public function postLocationCreate(LocationCreateRequest $form) {

	}
}