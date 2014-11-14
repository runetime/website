<?php
namespace App\Http\Controllers;
use App\Http\Requests\Calculators\CombatLoadRequest;
use App\Http\Requests\Calculators\PostRequest;
use App\RuneTime\Calculators\CalculatorRepository;
/**
 * Class CalculatorController
 * @package App\Http\Controllers
 */
class CalculatorController extends BaseController {
	/**
	 * @var CalculatorRepository
	 */
	private $calculators;

	/**
	 * @param CalculatorRepository $calculators
	 */
	public function __construct(CalculatorRepository $calculators) {
		$this->calculators = $calculators;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$calculators = $this->calculators->getAll();
		$this->nav('Runescape');
		$this->title('Calculators');
		return $this->view('calculators.index', compact('calculators'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getCombat() {
		$this->bc(['calculators' => 'Calculators']);
		$this->nav('navbar.runescape.runescape');
		$this->title('Combat Calculator');
		return $this->view('calculators.combat');
	}

	public function getCombatLoad(CombatLoadRequest $form) {
		$url='http://services.runescape.com/m=hiscore/index_lite.ws?player=' . $form->rsn;
		$results = \String::CURL($url);
		$scoreset = explode("\n", $results);
		$scores = [];
		foreach($scoreset as $key=>$text) {
			$temp = explode(",", $text);
			$scores[$key] = (int) $temp[1];
		}
		$skills = (object)[
			'attack' => $scores[1],
			'defence' => $scores[2],
			'strength' => $scores[3],
			'constitution' => $scores[4],
			'ranged' => $scores[5],
			'prayer' => $scores[6],
			'magic' => $scores[7],
			'summoning' => $scores[24],
		];
		header('Content-Type: application/json');
		return json_encode($skills);
	}

	/**
	 * @param $type
	 * @return \Illuminate\View\View
	 */
	public function getView($type) {
		$calculator = $this->calculators->getByNameTrim($type);
		if(!$calculator)
			\App::abort(404);
		$items = json_decode($calculator->items);
		$levelsRequired = json_decode($calculator->levels_required);
		$xp = json_decode($calculator->xp);
		$this->bc(['calculators' => 'Calculators']);
		$this->js('calculator');
		$this->nav('Runescape');
		$this->title($calculator->name . ' Calculator');
		return $this->view('calculators.view', compact('calculator', 'items', 'levelsRequired', 'xp'));
	}

	/**
	 * @param PostRequest $form
	 *
	 * @return string
	 */
	public function postLoad(PostRequest $form) {
		$calculator = $this->calculators->getById($form->id);
		if(!$calculator)
			return json_encode([]);
		$itemList = [];
		$items = json_decode($calculator->items);
		$levelsRequired = json_decode($calculator->levels_required);
		$xp = json_decode($calculator->xp);
		foreach($levelsRequired as $x => $level) {
			if(!isset($itemList[$level]))
				$itemList[$level] = [];
			$itemList[$level][count($itemList[$level])] = [
				'name'  => $items[$x],
				'level' => $levelsRequired[$x],
				'xp'    => $xp[$x],
			];
		}
		$itemListNumbered = [];
		for($x = 0; $x <= 99; $x++)
			if(!empty($itemList[$x][0]))
				foreach($itemList[$x] as $item)
					array_push($itemListNumbered, $item);
		header('Content-Type: application/json');
		return json_encode($itemListNumbered);
	}
}