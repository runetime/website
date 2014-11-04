@extends('......layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Checkup by {{$displayName}}
				</h1>
				<div class='well well-sm'>
					<dl class='dl-horizontal'>
						<dt>
							Author
						</dt>
						<dd>
							{!!\Link::name($checkup->author()->first()->id)!!}
						</dd>
						<dt>
							Submitted At
						</dt>
						<dd>
							{{\Time::long($checkup->created_at)}}
						</dd>
						<dt>
							Active
						</dt>
						<dd>
							{{$checkup->active == 1 ? "Yes" : "No"}}
						</dd>
						<dt>
							Hours Active
						</dt>
						<dd>
							Hours Active: {{$checkup->hours_active}}
						</dd>
						<dt>
							Team
						</dt>
						<dd>
							Team: {{ucwords($checkup->team)}}
						</dd>
					</dl>
				</div>
			</div>
@stop