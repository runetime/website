@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					{{$subforum->name}}
				</h1>
				<p class='text-muted'>
					{!!$subforum->description!!}
				</p>
				<div class='pull-left'>
@if(!empty($paginator))
					<ul class='pagination'>
<?php echo $paginator->render(); ?>
					</ul>
@endif
				</div>
				<div class='pull-right'>
					<ul class='list-inline'>
						<li>
							<i class='fa fa-check'></i> Mark Read
						</li>
						<li>
							<a href='/forums/create/{{\String::slugEncode($subforum->id,$subforum->name)}}' class='btn btn-primary btn-sm}' role='button'{{!\Auth::check()?' disabled':''}}>
								Start New Topic
							</a>
						</li>
					</ul>
				</div>
				<div class='clearfix'>
				</div>
			</div>
@stop