<?php
namespace App\Http\Controllers;

use App\Http\Requests\Databases\ItemCreateRequest;
use App\Http\Requests\Databases\MonsterCreateRequest;
use App\RuneTime\Databases\Item;
use App\RuneTime\Databases\ItemRepository;
use App\RuneTime\Databases\Monster;
use App\RuneTime\Databases\MonsterRepository;

class DatabaseController extends BaseController
{
	/**
	 * @var ItemRepository
	 */
	private $items;
	/**
	 * @var MonsterRepository
	 */
	private $monsters;

	/**
	 * @param ItemRepository    $items
	 * @param MonsterRepository $monsters
	 */
	public function __construct(ItemRepository $items, MonsterRepository $monsters)
	{
		$this->items = $items;
		$this->monsters = $monsters;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->nav('navbar.runescape.title');
		$this->title('database.title');
		return $this->view('databases.index');
	}

	/**
	 * @param string $searchMembership
	 * @param string $searchTradable
	 * @param string $searchQuestItem
	 *
	 * @return \Illuminate\View\View
	 */
	public function getItemsIndex($searchMembership = 'none', $searchTradable = 'none', $searchQuestItem = 'none')
	{
		$items = $this->items->getByOptions($searchMembership, $searchTradable, $searchQuestItem);
		$memberships = ['yes', 'no'];
		$tradables = ['yes', 'no'];
		$questItems = ['yes', 'no'];

		$this->bc(['databases' => trans('database.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('database.items.title');
		return $this->view('databases.items.index', compact('items', 'searchMembership', 'searchTradable', 'searchQuestItem', 'memberships', 'tradables', 'questItems'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getItemsView($id)
	{
		$item = $this->items->getById($id);
		if(!$item) {
			return \Error::abort(404);
		}

		$this->bc(['databases' => trans('database.title'), 'databases/items' => trans('database.items.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('database.items.view.title', ['name' => $item->name]);
		return $this->view('databases.items.view', compact('item'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getItemsCreate()
	{
		$this->bc(['databases' => trans('database.title'), 'databases/items' => trans('database.items.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('database.items.create.title');
		return $this->view('databases.items.create');
	}

	/**
	 * @param ItemCreateRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postItemsCreate(ItemCreateRequest $form)
	{
		$parsedown = new \Parsedown;
		$name = $form->name;
		$editors = json_encode([]);
		$examine = $form->examine;
		$examineParsed = $parsedown->text($examine);
		$membership = $form->membership == 1 ? true : false;
		$tradable = $form->tradable == 1 ? true : false;
		$questItem = $form->quest_item == 1 ? true : false;
		$item = with(new Item)->saveNew(\Auth::user()->id, $editors, $name, $examine, $examineParsed, $membership, $tradable, $questItem);

		return \redirect()->to('/databases/items/' . \String::slugEncode($item->id, $item->name));
	}

	/**
	 * @param string $searchMembership
	 *
	 * @return \Illuminate\View\View
	 */
	public function getMonstersIndex($searchMembership = 'none')
	{
		$monsters = $this->monsters->getByOptions($searchMembership);
		$memberships = ['yes', 'no'];

		$this->bc(['databases' => trans('database.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('database.monsters.title');
		return $this->view('databases.monsters.index', compact('monsters', 'searchMembership', 'memberships'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getMonstersView($id)
	{
		$monster = $this->monsters->getById($id);
		if(!$monster) {
			return \Error::abort(404);
		}

		$this->bc(['databases' => trans('database.title'), 'databases/monsters' => trans('database.monsters.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('database.monsters.view.title', ['name' => $monster->name]);
		return $this->view('databases.monsters.view', compact('monster', 'editList'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getMonstersCreate()
	{
		$this->bc(['databases' => trans('database.title'), 'databases/monsters' => trans('database.monsters.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('database.monsters.create.title');
		return $this->view('databases.monsters.create');
	}

	/**
	 * @param MonsterCreateRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postMonstersCreate(MonsterCreateRequest $form)
	{
		$parsedown = new \Parsedown;
		$editors = json_encode([]);
		$name = $form->name;
		$examine = $form->examine;
		$examineParsed = $parsedown->text($examine);
		$stats = $form->stats;
		$statsParsed = $parsedown->text($stats);
		$location = $form->location;
		$locationParsed = $parsedown->text($location);
		$drops = $form->drops;
		$dropsParsed = $parsedown->text($drops);
		$members = $form->membership == 1 ? true : false;
		$otherInformation = $form->other_information;
		$otherInformationParsed = $parsedown->text($otherInformation);
		$monster = with(new Monster)->saveNew(\Auth::user()->id, $editors, $name, $examine, $examineParsed, $stats, $statsParsed, $location, $locationParsed, $drops, $dropsParsed, $members, $otherInformation, $otherInformationParsed);

		return \redirect()->to('/databases/monsters/' . \String::slugEncode($monster->id, $monster->name));
	}
}