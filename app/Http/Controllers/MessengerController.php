<?php
namespace App\Http\Controllers;
use App\Http\Requests\Messenger\CreateRequest;
use App\Http\Requests\MessengerCreateForm;
use App\RuneTime\Messenger\MessageRepository;
use App\Runis\Accounts\UserRepository;
/**
 * Class AboutController
 * @package App\Http\Controllers
 */
class MessengerController extends BaseController {
	/**
	 * @var MessageRepository
	 */
	private $messages;
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param MessageRepository $messages
	 * @param UserRepository    $users
	 */
	public function __construct(MessageRepository $messages, UserRepository $users) {
		$this->messages = $messages;
		$this->users = $users;
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
	public function getCreate($id = 0) {
		$to = '';
		if($id > 0) {
			$to = $this->users->getById($id);
			if(!$to)
				$to = '';
		}
		$this->bc(['messenger' => 'Messenger']);
		$this->nav('Forums');
		$this->title('Compose a Message');
		return $this->view('messenger.compose.index', compact('to'));
	}

	/**
	 * @param CreateRequest $form
	 */
	public function postCreate(CreateRequest $form) {

	}
}