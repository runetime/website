<?php

use App\RuneTime\Accounts\User;

/**
 * The base class for HTTP tests.
 *
 * Class TestCase
 */
class TestCase extends Illuminate\Foundation\Testing\TestCase
{
    /**
     *
     */
    public function setUp()
    {
        parent::setUp();
        \Session::start();
    }

    /**
     * @return mixed
     */
    public function createApplication()
    {
        $app = require __DIR__ . '/../bootstrap/app.php';

        $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

        return $app;
    }

    /**
     *
     */
    public function login()
    {
        $user = User::orderBy('created_at', 'desc')->first();
        \Auth::loginUsingId($user->id);
    }

    /**
     * @param array $form
     *
     * @return array
     */
    public function form(Array $form = [])
    {
        $form['_token'] = \Session::token();

        return $form;
    }
}
