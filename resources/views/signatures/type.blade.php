@extends('layouts.default')
@section('contents')
			<div class='wrapper row row-flat'>
				<div class='col-xs-12 col-sm-6 col-md-4'>
					<a href='/signatures/username={{ $username }}/type=stat'>
						<h3 class='text-center'>
							@lang('signature.type.stat')
						</h3>
						<img src='/signatures/hStatic;stat;wp69497ed6_06' class='center-block img-responsive' />
					</a>
				</div>
			</div>
@stop