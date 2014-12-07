					<ul class='pagination'>
						<li>
							<a href='{{ $url }}'>
								<i class='fa fa-angle-double-left'></i>
							</a>
						</li>
@for($pageX = 1; $pageX <= $pages; $pageX++)
						<li{!! $pageX !== $page ? "" : " class='current'" !!}>
							<a href='{{ $url }}/page={{ $pageX }}'>
								{{ $pageX }}
							</a>
						</li>
@endfor
						<li>
							<a href='{{ $url }}/page={{ $pages }}'>
								<i class='fa fa-angle-double-right'></i>
							</a>
						</li>
					</ul>