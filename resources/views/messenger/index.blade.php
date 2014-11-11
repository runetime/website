@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Messenger
				</h1>
				<div class='pull-right'>
					<a href='/messenger/compose' class='btn btn-sm btn-primary'>
						Compose
					</a>
				</div>
				<div class='clearfix'></div>
@foreach($messages as $message)
				<div class='well well-sm clearfix'>
					<div class='pull-left'>
						<p>
							<a href='/messenger/{{ \String::slugEncode($message->id, $message->title) }}'>
								{{$message->title}}
							</a>
						</p>
						<p class='text-muted'>
							Started by {!! \Link::name($message->author_id) !!}, {{$message->replies}} replies
						</p>
					</div>
					<div class='pull-right'>
                        Participants:
                        <ul class='list-inline'>
	@foreach($message->users as $user)
                            <li>
                                {!! \Link::name($user->id) !!}
                            </li>
	@endforeach
                        </ul>
					</div>
				</div>
@endforeach
			</div>
@stop