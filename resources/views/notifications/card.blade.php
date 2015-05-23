<?php
if(!isset($notification)) $notification = new stdClass;
$url = '/notifications/' . \String::slugEncode($notification->id, 'at-', $notification->created_at);
?>
                <div class='clearfix card hover-pointer {{!empty($status) ? " card-" . $status : "" }}' onclick="window.location.href='{{ $url }}';" rt-data='notifications:{{ $notification->id }}'>
                    <div class='pull-left'>
                        <a href='{{ $url }}' class='text-muted'>
                            {{ \Time::shortReadable($notification->created_at) }}
                        </a>
                        <p class='text'>
                            {!! $notification->contents_parsed !!}
                        </p>
                    </div>
                </div>
