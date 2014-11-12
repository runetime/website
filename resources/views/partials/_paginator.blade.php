					<ul class='pagination'>
						<li>
							<a href='/forums/thread/{{ \String::slugEncode($thread->id, $thread->title) }}'>
								<i class='fa fa-angle-double-left'></i>
							</a>
						</li>
@for($pageX = 1; $pageX <= $pages; $pageX++)
						<li{!! $pageX !== $page ? "" : " class='current'" !!}>
							<a href='/forums/thread/{{ \String::slugEncode($thread->id, $thread->title) }}/page={{ $pageX }}'>
								{{ $pageX }}
							</a>
						</li>
@endfor
						<li>
							<a href='/forums/thread/{{ \String::slugEncode($thread->id, $thread->title) }}/page={{ $pages }}'>
								<i class='fa fa-angle-double-right'></i>
							</a>
						</li>
					</ul>