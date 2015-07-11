<?php
namespace App\Http\Controllers;

use App\Http\Requests\Chat\CheckChannelRequest;
use App\Http\Requests\Chat\MessageRequest;
use App\Http\Requests\Chat\StartRequest;
use App\Http\Requests\Chat\StatusChangeRequest;
use App\Http\Requests\Chat\UpdateRequest;
use App\RuneTime\Accounts\UserRepository;
use App\RuneTime\Bans\MuteRepository;
use App\RuneTime\Chat\ActionRepository;
use App\RuneTime\Chat\ChannelRepository;
use App\RuneTime\Chat\Chat;
use App\RuneTime\Chat\ChatRepository;
use App\RuneTime\Chat\FilterRepository;

/**
 * Class ChatController
 */
final class ChatController extends Controller
{
    /**
     * @var FilterRepository
     */
    private $filters;
    /**
     * @var ActionRepository
     */
    private $actions;
    /**
     * @var ChannelRepository
     */
    private $channels;
    /**
     * @var ChatRepository
     */
    private $chat;
    /**
     * @var MuteRepository
     */
    private $mutes;
    /**
     * @var UserRepository
     */
    private $users;

    /**
     * @param \App\RuneTime\Chat\ActionRepository   $actions
     * @param \App\RuneTime\Chat\ChannelRepository  $channels
     * @param \App\RuneTime\Chat\ChatRepository     $chat
     * @param \App\RuneTime\Chat\FilterRepository   $filters
     * @param \App\RuneTime\Bans\MuteRepository     $mutes
     * @param \App\RuneTime\Accounts\UserRepository $users
     */
    public function __construct(
        ActionRepository $actions,
        ChannelRepository $channels,
        ChatRepository $chat,
        FilterRepository $filters,
        MuteRepository $mutes,
        UserRepository $users
    ) {
        $this->actions = $actions;
        $this->channels = $channels;
        $this->chat = $chat;
        $this->filters = $filters;
        $this->mutes = $mutes;
        $this->users = $users;
    }

    /**
     * Returns a JSON string of the name, number of messages,
     * and Unix timestamp of last message of channels.
     *
     * @return string
     */
    public function getChannels()
    {
        $channels = $this->channels->getAll();
        $channelList = [];

        // Cycle through all of the channels and setup data for them
        foreach ($channels as $channel) {
            $message = $this->chat->getLatestByChannel($channel->id);

            $channelList[] = [
                'name'         => $channel->name_trim,
                'messages'     => $channel->messages,
                'last_message' => strtotime($message['created_at']),
            ];
        }

        return json_encode(array_reverse($channelList));
    }

    /**
     * Returns a boolean of whether or
     * not a channel name is valid.
     *
     * @param CheckChannelRequest $form
     *
     * @return array
     */
    public function postCheckChannel(CheckChannelRequest $form)
    {
        $channel = $this->channels->getByNameTrim($form->channel);
        $valid = false;

        if (!empty($channel)) {
            $valid = true;
        }

        return json_encode(['valid' => $valid]);
    }

    /**
     * Posts a message to a channel given the contents
     * and the channel name.  This requires that
     * the user has permission to post a chat
     * message, or else it returns false.
     *
     * @param MessageRequest $form
     *
     * @return string
     */
    public function postMessage(MessageRequest $form)
    {
        $response = ['done' => false];

        if (\Auth::check()) {
            $mute = $this->mutes->getByUserActive(\Auth::user()->id);

            if (!empty($mute)) {
                // The user is muted, return an error
                $response['error'] = -2;
            } else {
                $status = Chat::STATUS_VISIBLE;
                $contents = $form->contents;
                if (\Auth::user()->isStaff()) {
                    // The user is a staff member, enable commands
                    if (\String::startsWith('/pin ', $contents)) {
                        $contents = \String::replaceFirst('/pin ', $contents);
                        $status = Chat::STATUS_PINNED;
                    } elseif (\String::startsWith('/hide ', $contents)) {
                        $contents = \String::replaceFirst('/hide ', $contents);
                        $status = Chat::STATUS_INVISIBLE;
                    } elseif (\String::startsWith('/hid ', $contents)) {
                        $contents = \String::replaceFirst('/hid ', $contents);
                        $status = Chat::STATUS_INVISIBLE;
                    } elseif (\String::startsWith('/pinhid ', $contents)) {
                        $contents = \String::replaceFirst('/pinhid ', $contents);
                        $status = Chat::STATUS_PINNED_INVISIBLE;
                    } elseif (\String::startsWith('/hidpin ', $contents)) {
                        $contents = \String::replaceFirst('/hidpin ', $contents);
                        $status = Chat::STATUS_PINNED_INVISIBLE;
                    }
                }

                // Parse the contents into Markdown
                $contentsParsed = with(new \Parsedown)->text($contents);

                // Filter out words that are censored
                $filters = $this->filters->getAll();
                foreach ($filters as $filter) {
                    $asterisks = str_repeat('*', strlen($filter->text));
                    $contentsParsed = str_ireplace($filter->text, $asterisks, $contentsParsed);
                }

                with(new Chat)->saveNew(\Auth::user()->id, $form->contents, $contentsParsed, $status, $this->channels->getByNameTrim($form->channel)->id);
                $channel = $this->channels->getByNameTrim($form->channel);
                $channel->messages = $channel->messages + 1;
                $channel->save();

                $response['done'] = true;
            }
        } else {
            // The user is not logged in
            $response['error'] = -1;
        }

        return json_encode($response);
    }

    /**
     * Returns a boolean of whether or not the
     * user is a moderator on the website.
     *
     * @return string
     */
    public function getModerator()
    {
        $mod = false;

        if (\Auth::check() && \Auth::user()->isCommunity()) {
            $mod = true;
        }

        return json_encode(['mod' => $mod]);
    }

    /**
     * Returns a collection of all of the pinned messages,
     * getting them based on their moderator status.
     *
     * @return mixed
     */
    public function getPinned()
    {
        if (\Auth::check() && \Auth::user()->isStaff()) {
            // The user is a moderator, get invisible messages as well
            $messages = $this->chat->getByStatus(Chat::STATUS_PINNED, '>=');
        } else {
            $messages = $this->chat->getByStatus(Chat::STATUS_PINNED);
        }

        $messageList = $this->sortMessages($messages);

        return json_encode($messageList);
    }

    /**
     * Returns normal and pinned messages based on the given channel.
     *
     * @param StartRequest $form
     *
     * @return string
     */
    public function postStart(StartRequest $form)
    {
        $channel = $this->channels->getByNameTrim($form->channel);
        if (\Auth::check() && \Auth::user()->isStaff()) {
            $messages = $this->chat->getByChannel($channel->id, Chat::PER_PAGE, Chat::STATUS_VISIBLE, '>=');
        } else {
            $messages = $this->chat->getByChannel($channel->id, Chat::PER_PAGE, Chat::STATUS_VISIBLE);
        }

        $messageList = $this->sortMessages($messages);
        $messageList = array_reverse($messageList);

        if (\Auth::check() && \Auth::user()->isStaff()) {
            $pinned = $this->chat->getByStatus(Chat::STATUS_PINNED, '>=');
        } else {
            $pinned = $this->chat->getByStatus(Chat::STATUS_PINNED);
        }

        $pinnedList = $this->sortMessages($pinned);
        $res = (object) [
            'messages' => $messageList,
            'pinned'   => $pinnedList,
        ];

        return json_encode($res);
    }

    /**
     * For moderators only, it changes the status of a message.
     * Say from visible to hidden, the status is changed.
     *
     * @param StatusChangeRequest $form
     *
     * @return string
     */
    public function postStatusChange(StatusChangeRequest $form)
    {
        $response = ['done' => false];
        $chat = $this->chat->getById($form->id);
        if (!empty($chat)) {
            $chat->status = $form->status;
            $chat->save();
            $response['done'] = true;
        } else {
            $response['error'] = -1;
        }

        return json_encode($response);
    }

    /**
     * Checks to see if any messages have been sent on
     * a given channel since the message that the
     * user last has seen.  Basically it
     * checks for new messages.
     *
     * @param UpdateRequest $form
     *
     * @return string
     */
    public function postUpdate(UpdateRequest $form)
    {
        if ($form->id <= 0) {
            return json_encode([]);
        }

        $status = Chat::STATUS_VISIBLE;
        $operator = '=';

        if (\Auth::check() && \Auth::user()->isStaff()) {
            $status = Chat::STATUS_INVISIBLE;
            $operator = '<=';
        }

        $messages = $this->chat
            ->getAfterIdByStatus($form->id, $form->channel, $status);

        $messageList = $this->sortMessages($messages);

        return json_encode(array_reverse($messageList));
    }

    /**
     * Sorts the messages, returning an array of messages
     * with only the information we want users to
     * be able to receive from the server.
     *
     * @param $messages
     *
     * @return array
     */
    private function sortMessages($messages)
    {
        $messageList = [];
        $users = [];

        foreach ($messages as $message) {
            if (!isset($users[$message->author_id])) {
                $users[$message->author_id] = $this->users
                    ->getById($message->author_id);
            }

            $messageList[] = (object) [
                'id'              => $message->id,
                'author_name'     => $users[$message->author_id]->display_name,
                'class_name'      => $message->author->importantRole()->class_name,
                'contents_parsed' => $message->contents_parsed,
                'created_at'      => strtotime($message->created_at),
                'uuid'            => uniqid(md5(microtime(true)), true),
                'status'          => $message->status,
            ];
        }

        return $messageList;
    }
}
