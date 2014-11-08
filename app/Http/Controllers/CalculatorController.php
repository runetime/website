<?php
namespace App\Http\Controllers;
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
		$this->nav('navbar.runescape.runescape');
		$this->title('Combat Calculator');
		return $this->view('calculators.combat');
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
	 * @return string
	 */
	public function postLoad(PostRequest $form) {
		header('Content-Type: application/json');
		return json_encode($this->calculators->getById($form->id));
	}
}