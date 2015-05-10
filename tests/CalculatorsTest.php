<?php

use App\RuneTime\Calculators\Calculator;

/**
 * Tests HTTP routes for the CalculatorController.
 *
 * Class CalculatorsTest
 */
class CalculatorsTest extends TestCase
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
