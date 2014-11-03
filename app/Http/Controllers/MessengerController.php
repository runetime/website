<?php
namespace App\Http\Controllers;
use App\Http\Requests\Messenger\CreateRequest;
use App\Http\Requests\MessengerCreateForm;
/**
 * Class AboutController
 * @package App\Http\Controllers
 *
 * @middleware("auth.logged")
 */
class MessengerController extends BaseController {
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$messages = $this->messages->getByUser(\Auth::user()->id);
		$this->nav('Forums');
		$this->title('Messenger');
		return $this->view('messenger.index', compact('messages'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getView() {
		$this->nav('Forums');
		$this->title('');
		return $this->view('messenger.view', compact(''));
	}

	/**
	 *
	 */
	public function getCreate() {

	}

	/**
	 * @param CreateRequest $form
	 */
	public function postCreate(CreateRequest $form) {

	}
}