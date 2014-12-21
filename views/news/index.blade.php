@extends('layouts.default')
@section('contents')
			<div class='wrapper wrapper-flat'>
				<h1>
					@lang('news.title')
				</h1>
@if($canAdd)
				<div class='clearfix'>
					<ul class='list-inline pull-right'>
						<li>
							<a href='/news/create' class='btn btn-primary'>
								<i class='fa fa-plus'></i> @lang('news.create_newspiece')
							</a>
						</li>
					</ul>
				</div>
@endif
			</div>
@foreach($news as $newsPiece)
	@include('news._show', ['news' => $newsPiece])
@endforeach
			</div>
@stop