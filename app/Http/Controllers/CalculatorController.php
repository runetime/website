<?php
namespace App\Http\Controllers;
use App\RuneTime\Calculators\CalculatorRepository;
class CalculatorController extends BaseController {
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
		$this->nav('Runescape');
		$this->title('Calculators');
		return $this->view('calculators.index');
	}

	/**
	 * @param $type
	 *
	 * @return \Illuminate\View\View
	 */
	public function getView($type) {
		$calculator = $this->calculators->getByNameTrim($type);
		if($calculator) {
			$items = json_decode($calculator->items);
			$levelsRequired = json_decode($calculator->levels_required);
			$xp = json_decode($calculator->xp);
			$this->bc(['calculators' => 'Calculators']);
			$this->js('calculator');
			$this->nav('Runescape');
			$this->title($calculator->name . ' Calculator');
			return $this->view('calculators.view', compact('calculator', 'items', 'levelsRequired', 'xp'));
		}
		\App::abort(404);
	}

	/**
	 * @return string
	 */
	public function postLoad() {
		return json_encode($this->calculators->getById(\Input::get('id')));
	}
}