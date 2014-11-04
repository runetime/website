@extends('...layouts.default')
@section('contents')
			<div class='wrapper'>
				<p class='text-success'>
					@lang('signature.final.made',['name'=>$username])
				</p>
				<img src='/signatures/h{{$hash}}' alt='RuneTime Signature for {{$username}}' />
				<br />
				<dl class='dl-horizontal'>
				    <dt>
						@lang('signature.final.link.direct')
				    </dt>
				    <dd>
						<a href='{{$location}}'>
							{{$location}}
						</a>
				    </dd>
				    <dt>
				        @lang('signature.final.link.html')
				    </dt>
				    <dd>
				        {{'<img src="' . $location . '" alt="My RuneTime Signature" />'}}
				    </dd>
				    <dt>
                        @lang('signature.final.link.markdown')
				    </dt>
				    <dd>
				        ![RuneTime Signature for {{$username}}]({{$location}}]
				    </dd>
				    <dt>
				        @lang('signature.final.link.bbcode')
                    </dt>
                    <dd>
				        [img={{$location}}]
				    </dd>
				    <dt>
				        @lang('signature.final.link.alternative_bbcode')
				    </dt>
				    <dd>
				        [img]{{$location}}[/img]
				    </dd>
				    <dt>
				        @lang('signature.final.link.linked_bbcode')
				    </dt>
				    <dd>
				        [a href=http://runetime.com][img={{$location}}][/a]
				    </dd>
				</dl>
			</div>
@stop