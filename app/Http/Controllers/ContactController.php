<?php
namespace App\Http\Controllers;

use App\Http\Requests\Contact\ContactRequest;

/**
 * Class ContactController
 * @package App\Http\Controllers
 */
class ContactController extends Controller
{
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->nav('navbar.runetime.title');
		$this->title('contact.title');
		return $this->view('contact');
	}

	/**
	 * @param ContactRequest $form
	 *
	 * @return string
	 */
	public function postSubmit(ContactRequest $form)
	{
		$response['done'] = true;

		$data = [
			'contents' => $form->contents,
			'email'    => $form->email,
			'username' => $form->username,
		];

		\Mail::send('emails.contact', $data, function($message) {
			$message->to(getenv('CONTACT_EMAIL'));
			$message->subject(trans('contact.submit.contact_message', ['website' => 'runetime.net']));
		});

		return json_encode($response);
	}
}