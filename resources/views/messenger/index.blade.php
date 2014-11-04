@extends('...layouts.default')
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
@foreach($messages as $message)
				<div class='well well-sm'>
					<div class='pull-left'>
						<p>
							<a href='/messenger/view/{{$message->id}}'>
								{{$message->title}}
							</a>
						</p>
						<p class='text-muted'>
							Started by {{\Link::name($message->author_id)}}, {{$message->reply_count}} replies
						</p>
					</div>
					<div class='pull-right'>
						<p>
							Participants:
							<ul class='list-inline'>
	@foreach(json_decode($messages->participants) as $participant)
								<li>
									{{\Link::name($message->author_id)}}
								</li>
	@endforeach
							</ul>
						</p>
					</div>
				</div>
@endforeach
			</div>
@stop