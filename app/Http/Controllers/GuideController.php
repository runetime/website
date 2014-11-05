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
		$guides = $this->quests->getAll();
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
		$guide = new \stdClass;
		$guide->name = 'All Fired Up';
		$guide->author_id = 1;
		$guide->editors = json_encode([2]);
		$guide->difficulty = 7;
		$guide->length = 2;
		$guide->qp = 1;
		$guide->membership = 1;
		$guide->completed = 1;
		$guide->description = 'Test description';
		$guide->quest_requirements = json_encode([0 => ['id' => 11, 'name' => 'Priest in Peril']]);
		$guide->skill_requirements = json_encode(['Firemaking' => 43]);
		$guide->items_required = json_encode([0 => ['id' => -1, 'description' => 'logs of any kind (but must be the same kind)', 'amount' => 50]]);
		$guide->items_recommended = json_encode([0 => ['id' => -1, 'description' => 'Explorer\'s ring', 'amount' => 1], 1 => ['id' => -1, 'description' => 'Varrock lodestone unlocked', 'amount' => 1]]);
		$guide->rewards = json_encode([0 => ['id' => -1, 'description' => 'coins', 'amount' => '20000'], 1 => ['id' => -1, 'description' => 'Access to the All Fired Up mini-game', 'amount' => 0], 2 => ['id' => -1, 'description' => 'Treasure hunter keys', 'amount' => 2]]);
		$guide->starting_point = "To start the quest, you need to talk King Roald. He is located in the throne room in Varrock Palace. The throne room is located on the ground floor (1st floor) in the south-eastern part of the palace.<br />
The king will ask you to help with the testing of the beacon network which has been put in place to warn off any attacks on misthalin. Agree and he will tell you to talk to a blaze sharpeye.";
		$guide->contents = [1 => 'test 1', 2 => 'test 2'];
		$guide->created_at = '2014-09-18 22:26:14';
		$guide->updated_at = '2014-09-18 23:31:31';
		$difficulty = $this->quests->getOptionById($guide->difficulty);
		$length = $this->quests->getOptionById($guide->length);
		$editList = "";
		foreach(json_decode($guide->editors) as $x => $editor) {
			$editList .= \Link::name($editor);
			if($x < count(json_decode($guide->editors)) - 1)
				$editList .= ", ";
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
		dd(1);
		$parsedown = new \Parsedown;
		$editors = json_encode([]);
		$membership = $form->membership == 1 ? true : false;
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