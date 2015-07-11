<?php
namespace App\Http\Controllers;

use App\Http\Requests\Contact\ContactRequest;
use Illuminate\View\View;

/**
 * Class ContactController
 */
final class ContactController extends Controller
{
    /**
     * Returns the Contact page.
     *
     * @return View
     */
    public function getIndex()
    {
        $this->nav('navbar.runetime.title');
        $this->title('contact.title');

        return $this->view('contact');
    }

    /**
     * Posts the message that a user has and mails
     * it off to RuneTime's email address.
     *
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

        // Mail off the message
        \Mail::send('emails.contact', $data, function ($message) {
            $message->to(getenv('CONTACT_EMAIL'));
            $message->subject(trans('contact.submit.contact_message', ['website' => 'runetime.net']));
        });

        return json_encode($response);
    }
}
