<?php namespace App\Http\Controllers;

use App\RuneTime\Notifications\Notification;
use App\RuneTime\Notifications\NotificationRepository;

class NotificationController extends BaseController {
	/**
	 * @var NotificationRepository
	 */
	private $notifications;

	/**
	 * @param NotificationRepository $notifications
	 */
	public function __construct(NotificationRepository $notifications) {
		$this->notifications = $notifications;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$notificationsUnread = $this->notifications->getStatusByUser(\Auth::user()->id, Notification::STATUS_UNREAD);
		$notificationsRead = $this->notifications->getStatusByUser(\Auth::user()->id, Notification::STATUS_READ);
		$this->nav('navbar.runetime.runetime');
		$this->title('Notification Center');
		return $this->view('notifications.index', compact('notificationsUnread', 'notificationsRead'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getView($id) {
		$notification = $this->notifications->getById($id);
		$notification->setRead();
		$this->bc(['notifications' => 'Notification Center']);
		$this->nav('navbar.runetime.runetime');
		$this->title('Notification Center');
		return $this->view('notifications.view', compact('notification'));
	}

	public function getSetAllRead() {
		$notifications = $this->notifications->getStatusByUser(\Auth::user()->id, Notification::STATUS_UNREAD);
		foreach($notifications as $notification)
			$notification->setRead();
		return \redirect()->to('/notifications');
	}
}
