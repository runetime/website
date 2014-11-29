@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('guides.title')
				</h1>
				<ul>
					<li>
						<a href='/guides/locations'>
							@lang('guides.locations.title')
						</a>
					</li>
					<li>
						<a href='/guides/quests'>
							@lang('guides.quests.title')
						</a>
					</li>
				</ul>
			</div>
@stop