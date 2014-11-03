<?php
namespace App\Http\Controllers;
use App\Http\Requests\MessengerCreateForm;
/**
 * Class AboutController
 * @package App\Http\Controllers
 *
 * @middleware("auth.logged")
 */
class MessengerController extends BaseController {
	/**
	 * @get("messenger")
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$messages = $this->messages->getByUser(\Auth::user()->id);
		$this->nav('Forums');
		$this->title('Messenger');
		return $this->view('messenger.index', compact('messages'));
	}

	/**
	 * @get("messenger/{id}-{name}")
	 */
	public function getView() {
		$this->nav('Forums');
		$this->title('');
		return $this->view('messenger.view', compact(''));
	}

	/**
	 * @get("messenger/compose")
	 */
	public function getCreate() {

	}

	/**
	 * @post("messenger/compose")
	 *
	 * @param MessengerCreateForm $form
	 */
	public function postCreate(MessengerCreateForm $form) {

	}
}