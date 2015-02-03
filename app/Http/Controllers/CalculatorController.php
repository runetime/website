<?php
namespace App\Http\Controllers;

use App\Http\Requests\Calculators\CombatLoadRequest;
use App\Http\Requests\Calculators\PostRequest;
use App\RuneTime\Calculators\CalculatorRepository;

/**
 * Class CalculatorController
 * @package App\Http\Controllers
 */
class CalculatorController extends Controller
{
	/**
	 * @var CalculatorRepository
	 */
	private $calculators;

	/**
	 * @param CalculatorRepository $calculators
	 */
	public function __construct(CalculatorRepository $calculators)
	{
		$this->calculators = $calculators;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$calculators = $this->calculators->getAll();

		$this->nav('navbar.runescape.title');
		$this->title('calculator.title');
		return $this->view('calculators.index', compact('calculators'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getCombat() {
		$this->bc(['calculators' => trans('calculator.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('calculator.combat.title');
		return $this->view('calculators.combat.index');
	}

	public function getCombat3()
	{
		$this->bc(['calculators' => trans('calculator.title'), 'calculators/combat' => trans('calculator.combat.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('calculator.combat.title');
		return $this->view('calculators.combat.3');
	}

	public function getCombatOSRS()
	{
		$this->bc(['calculators' => trans('calculator.title'), 'calculators/combat' => trans('calculator.combat.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('calculator.combat.title');
		return $this->view('calculators.combat.osrs');
	}

	/**
	 * @param CombatLoadRequest $form
	 *
	 * @return string
	 */
	public function getCombatLoad(CombatLoadRequest $form)
	{
		$scores = \String::getHiscore($form->rsn);
		$skills = (object)[
			'attack' => $scores[1][1],
			'defence' => $scores[2][1],
			'strength' => $scores[3][1],
			'constitution' => $scores[4][1],
			'ranged' => $scores[5][1],
			'prayer' => $scores[6][1],
			'magic' => $scores[7][1],
			'summoning' => $scores[24][1],
		];

		return json_encode($skills);
	}

	/**
	 * @param $type
	 * @return \Illuminate\View\View
	 */
	public function getView($type)
	{
		$calculator = $this->calculators->getByNameTrim($type);
		if(empty($calculator)) {
			return \Error::abort(404);
		}

		$items = json_decode($calculator->items);
		$levelsRequired = json_decode($calculator->levels_required);
		$xp = json_decode($calculator->xp);

		$this->bc(['calculators' => trans('calculator.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('calculator.calculator', ['name' => $calculator->name]);
		return $this->view('calculators.view', compact('calculator', 'items', 'levelsRequired', 'xp'));
	}

	/**
	 * @param PostRequest $form
	 *
	 * @return string
	 */
	public function postLoad(PostRequest $form)
	{
		$calculator = $this->calculators->getById($form->id);
		if(empty($calculator)) {
			return json_encode([]);
		}

		$itemList = [];
		$items = json_decode($calculator->items);
		$levelsRequired = json_decode($calculator->levels_required);
		$xp = json_decode($calculator->xp);

		foreach($levelsRequired as $x => $level) {
			if(!isset($itemList[$level])) {
				$itemList[$level] = [];
			}

			$itemList[$level][count($itemList[$level])] = [
				'name'  => $items[$x],
				'level' => $levelsRequired[$x],
				'xp'    => $xp[$x],
			];
		}

		$itemListNumbered = [];
		for($x = 0; $x <= 99; $x++) {
			if(!empty($itemList[$x][0])) {
				foreach($itemList[$x] as $item) {
					array_push($itemListNumbered, $item);
				}
			}
		}

		return json_encode($itemListNumbered);
	}
}