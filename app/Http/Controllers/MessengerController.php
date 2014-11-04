<?php
namespace App\Http\Controllers;
use App\Http\Requests\Messenger\CreateRequest;
use App\Http\Requests\MessengerCreateForm;
use App\RuneTime\Messenger\MessageRepository;
/**
 * Class AboutController
 * @package App\Http\Controllers
 *
 * @middleware("auth.logged")
 */
class MessengerController extends BaseController {
	/**
	 * @var MessageRepository
	 */
	private $messages;

	/**
	 * @param MessageRepository $messages
	 */
	public function __construct(MessageRepository $messages) {
		$this->messages = $messages;
	}
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$messages = \Auth::user()->messages();
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
		$this->bc(['messenger' => 'Messenger']);
		$this->nav('Forums');
		$this->title('Compose a Message');
		return $this->view('messenger.compose.index');
	}

	/**
	 * @param CreateRequest $form
	 */
	public function postCreate(CreateRequest $form) {

	}
}