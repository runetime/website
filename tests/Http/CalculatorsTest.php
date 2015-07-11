<?php
namespace tests\Http;

use App\RuneTime\Calculators\Calculator;
use tests\Test;

/**
 * Tests HTTP routes for the CalculatorController.
 *
 * Class CalculatorsTest
 */
final class CalculatorsTest extends Test
{
    /**
     *
     */
    public function testCalculatorsIndex()
    {
        $response = $this->call('GET', 'calculators');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testCalculatorsView()
    {
        $calculator = Calculator::find(1);

        $response = $this->call('GET', 'calculators/' . $calculator->name_trim);

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testCalculatorsCombat()
    {
        $response = $this->call('GET', 'calculators/combat');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
