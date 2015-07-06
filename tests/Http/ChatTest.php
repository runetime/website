<?php
namespace tests\Http;

use App\RuneTime\Chat\Channel;
use App\RuneTime\Chat\Chat;
use tests\TestCase;

/**
 * Tests HTTP routes for the ChatController.
 *
 * Class ChatTest
 */
class ChatTest extends TestCase
{
    /**
     *
     */
    public function testStart()
    {
        $channel = Channel::orderBy('created_at', 'desc')->first();
        $form = $this->form([
            'channel' => $channel->name_trim,
        ]);

        $response = $this->call('POST', 'chat/start', $form);

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testUpdate()
    {
        $chat = Chat::find(1);
        $id = 0;
        if (!empty($chat)) {
            $id = $chat->id;
        }

        $form = $this->form([
            'id' => $id,
        ]);

        $response = $this->call('POST', 'chat/update', $form);

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testMessage()
    {
        $this->login();

        $channel = Channel::orderBy('created_at', 'desc')->first();
        $data = $this->form([
            'channel'  => $channel->name_trim,
            'contents' => '**test**',
        ]);

        $response = $this->call('POST', 'chat/post/message', $data);

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testChannels()
    {
        $response = $this->call('GET', 'chat/channels');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testCheckChannel()
    {
        $channel = Channel::orderBy('created_at', 'desc')->first();
        $data = $this->form([
            'channel' => $channel->id,
        ]);

        $response = $this->call('POST', 'chat/channels/check', $data);

        $this->assertEquals(200, $response->getStatusCode());
    }
}
