@extends('layouts.default')
@section('contents')
			<div class='wrapper wrapper-none-res'>
				<h1>
					News
				</h1>
@if($canAdd)
				<div class='clearfix'>
					<ul class='list-inline pull-right'>
						<li>
							<a href='/news/create' class='btn btn-primary' title='Create News Piece'>
								<i class='fa fa-plus'></i> Create Newspiece
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