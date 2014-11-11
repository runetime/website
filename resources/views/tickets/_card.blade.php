				<div class='card card-{{ $ticket->status == 0 ? "good" : "bad" }} row'>
					<div class='col-xs-12 col-sm-8'>
						<div class='pull-left'>
							<a href='/tickets/{{ \String::slugEncode($ticket->id, $ticket->name) }}'>
								{{$ticket->name}}
							</a>
							<br />
							Started by {!! \Link::name($ticket->author->id) !!}, {{ \Time::shortReadable($ticket->created_at) }}
						</div>
						<div class='pull-right'>
							<div class='btn-group btn-group-dark'>
								<button type='button' class='btn'>Status</button>
								<button type='button' class='btn dropdown-toggle' data-toggle='dropdown'>
									<span class='caret'></span>
									<span class='sr-only'>Toggle Dropdown</span>
								</button>
								<ul class='dropdown-menu' role='menu'>
									<li>
										<a href='/tickets/{{ \String::slugEncode($ticket->id, $ticket->name) }}/status/switch'>
											{{ $ticket->status == 0 ? "Close" : "Open" }}
										</a>
									</li>
								</ul>
							</div>
						</div>
						<div class='cleafix'></div>
					</div>
					<div class='col-xs-12 col-sm-1'>
						<p>
							{{ $ticket->posts_count }} posts
						</p>
					</div>
					<div class='col-xs-12 col-sm-3'>
						{!! \Link::name($ticket->lastPost()->author->id) !!}
						<br />
						{{ \Time::shortReadable($ticket->lastPost()->created_at) }}
					</div>
				</div>