<?php
namespace App\Http\Controllers;
use App\RuneTime\Databases\DatabaseRepository;
class DatabaseController extends BaseController {
	private $databases;

	/**
	 * @param DatabaseRepository $databases
	 */
	public function __construct(DatabaseRepository $databases) {
		$this->databases = $databases;
	}

	/**
	 * @get("database")
	 */
	public function getIndex() {
	}

	/**
	 *
	 */
	public function getViewDatabase() {
	}

	/**
	 *
	 */
	public function getViewItem() {
	}

	/**
	 *
	 */
	public function getSearch() {
	}
}