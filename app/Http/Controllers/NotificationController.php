<?php
namespace App\Http\Controllers;

use App\RuneTime\Notifications\Notification;
use App\RuneTime\Notifications\NotificationRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

/**
 * Class NotificationController
 */
final class NotificationController extends Controller
{
    /**
     * @var NotificationRepository
     */
    private $notifications;

    /**
     * @param NotificationRepository $notifications
     */
    public function __construct(NotificationRepository $notifications)
    {
        $this->notifications = $notifications;
    }

    /**
     * @return View
     */
    public function getIndex()
    {
        $notificationsUnread = $this->notifications->getStatusByUser(\Auth::user()->id, Notification::STATUS_UNREAD);
        $notificationsRead = $this->notifications->getStatusByUser(\Auth::user()->id, Notification::STATUS_READ);

        $this->nav('navbar.runetime.title');
        $this->title('notifications.title');

        return $this->view('notifications.index', compact('notificationsUnread', 'notificationsRead'));
    }

    /**
     * @param $id
     *
     * @return View
     */
    public function getView($id)
    {
        $notification = $this->notifications->getById($id);
        if (empty($notification)) {
            return \Error::abort(404);
        }

        $notification->setRead();

        $this->bc(['notifications' => trans('notifications.title')]);
        $this->nav('navbar.runetime.title');
        $this->title('notifications.title');

        return $this->view('notifications.view', compact('notification'));
    }

    /**
     * @return RedirectResponse
     */
    public function getSetAllRead()
    {
        $notifications = $this->notifications->getStatusByUser(\Auth::user()->id, Notification::STATUS_UNREAD);
        foreach ($notifications as $notification) {
            $notification->setRead();
        }

        return redirect()->to('/notifications');
    }
}
