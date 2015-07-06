<?php
namespace App\Http\Controllers;

use App\Http\Requests\Calculators\CombatLoadRequest;
use App\Http\Requests\Calculators\PostRequest;
use App\RuneTime\Calculators\CalculatorRepository;

/**
 * Class CalculatorController
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
     * Returns the index of the calculators.
     *
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
     * Returns the combat calculator.
     *
     * @return \Illuminate\View\View
     */
    public function getCombat()
    {
        $this->bc(['calculators' => trans('calculator.title')]);
        $this->nav('navbar.runescape.title');
        $this->title('calculator.combat.title');

        return $this->view('calculators.combat.index');
    }

    /**
     * Returns the combat calculator for RS3.
     *
     * @return \Illuminate\View\View
     */
    public function getCombat3()
    {
        $this->bc(['calculators' => trans('calculator.title'), 'calculators/combat' => trans('calculator.combat.title')]);
        $this->nav('navbar.runescape.title');
        $this->title('calculator.combat.title');

        return $this->view('calculators.combat.3');
    }

    /**
     * Returns the combat calculator for OSRS.
     *
     * @return \Illuminate\View\View
     */
    public function getCombatOSRS()
    {
        $this->bc(['calculators' => trans('calculator.title'), 'calculators/combat' => trans('calculator.combat.title')]);
        $this->nav('navbar.runescape.title');
        $this->title('calculator.combat.title');

        return $this->view('calculators.combat.osrs');
    }

    /**
     * Receives a display name and retrieves hiscores
     * for the combat portions of their skills.
     *
     * @param CombatLoadRequest $form
     *
     * @return string
     */
    public function getCombatLoad(CombatLoadRequest $form)
    {
        $scores = \String::getHiscore($form->rsn);

        return json_encode([
            'attack'       => $scores[1][1],
            'defence'      => $scores[2][1],
            'strength'     => $scores[3][1],
            'constitution' => $scores[4][1],
            'ranged'       => $scores[5][1],
            'prayer'       => $scores[6][1],
            'magic'        => $scores[7][1],
            'summoning'    => $scores[24][1],
        ]);
    }

    /**
     * Returns the page for a specific calculator, given by name.
     *
     * @param $type
     *
     * @return \Illuminate\View\View
     */
    public function getView($type)
    {
        $calculator = $this->calculators->getByNameTrim($type);

        if (empty($calculator)) {
            return \Error::abort(404);
        }

        $items = json_decode($calculator->items);
        $levelsRequired = json_decode($calculator->levels_required);
        $xp = json_decode($calculator->xp);
        $data = compact('calculator', 'items', 'levelsRequired', 'xp');

        $this->bc(['calculators' => trans('calculator.title')]);
        $this->nav('navbar.runescape.title');
        $this->title('calculator.calculator', ['name' => $calculator->name]);

        return $this->view('calculators.view', $data);
    }

    /**
     * Returns a JSON string of the given display name's skills.
     *
     * @param PostRequest $form
     *
     * @return string
     */
    public function postLoad(PostRequest $form)
    {
        $calculator = $this->calculators->getById($form->id);

        if (empty($calculator)) {
            return json_encode([]);
        }

        // Setup details for all of the skills' methods of XP gains
        $itemList = [];
        $items = json_decode($calculator->items);
        $levelsRequired = json_decode($calculator->levels_required);
        $xp = json_decode($calculator->xp);

        // Cycle through and build an array of skills' data
        foreach ($levelsRequired as $x => $level) {
            if (!isset($itemList[$level])) {
                $itemList[$level] = [];
            }

            $itemList[$level][count($itemList[$level])] = [
                'name'  => $items[$x],
                'level' => $levelsRequired[$x],
                'xp'    => $xp[$x],
            ];
        }

        // Order the items by required level
        $itemListNumbered = [];

        for ($x = 0; $x <= 99; $x++) {
            if (!empty($itemList[$x][0])) {
                foreach ($itemList[$x] as $item) {
                    $itemListNumbered[] = $item;
                }
            }
        }

        return json_encode($itemListNumbered);
    }
}
