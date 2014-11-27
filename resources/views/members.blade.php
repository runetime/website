@extends('layouts.default')
@section('contents')
			<div class='wrapper-flat'>
				<h1>
					@lang('members.title')
				</h1>
			</div>
			<div class='wrapper-dark row row-margin text-center'>
				<div class='col-xs-12 col-sm-4'>
					<h3 class='holo-text'>
						@lang('members.search.role')
					</h3>
					<ul class='list-inline holo-text-secondary'>
@foreach($roles as $role)
						<li>
							<a href='/members/role={{$role->name}}/prefix={{$searchPrefix}}/order={{$searchOrder}}'>
	@if($searchRole == $role->name)
								<b>
									{{$role->name}}
								</b>
	@else
								{{$role->name}}
	@endif
							</a>
						</li>
@endforeach
					</ul>
				</div>
				<div class='col-xs-12 col-sm-4'>
					<h3 class='holo-text'>
						@lang('members.search.prefix')
					</h3>
					<ul class='list-inline holo-text-secondary'>
@foreach($prefixes as $prefix)
						<li>
							<a href='/members/role={{$searchRole}}/prefix={{$prefix}}/order={{$searchOrder}}'>
	@if($searchPrefix == $prefix)
								<b>
									{{$prefix}}
								</b>
	@else
								{{$prefix}}
	@endif
							</a>
						</li>
@endforeach
					</ul>
				</div>
				<div class='col-xs-12 col-sm-4'>
					<h3 class='holo-text'>
						@lang('members.search.order')
					</h3>
					<ul class='list-inline holo-text-secondary'>
@foreach($orders as $order)
						<li>
							<a href='/members/role={{$searchRole}}/prefix={{$searchPrefix}}/order={{$order}}'>
	@if($searchOrder == $order)
								<b>
									{{ucwords($order)}}
								</b>
	@else
								{{ucwords($order)}}
	@endif
							</a>
						</li>
@endforeach
					</ul>
				</div>
			</div>
			<div class='wrapper'>
@include('partials._paginator', ['url' => '/members/role=' . $searchRole . '/prefix=' . $searchPrefix . '/order=' . $searchOrder])
				<div class='row'>
@foreach($members as $member)
					<div class='col-xs-12 row row-flat'>
						<div class='col-xs-3 col-md-2 col-lg-1'>
							{!! \Image::userPhoto($member->id, ['center-block']) !!}
						</div>
						<div class='col-xs-9 col-md-10 col-lg-11'>
							<div class='clearfix'>
								<div class='pull-left'>
									{!! \Link::name($member->id) !!}
									<br />
									@lang('members.joined',['date' => Time::long($member->created_at)])
									<br />
									{!! \Link::colorRole($member->importantRole()->id) !!}
								</div>
								<div class='pull-right'>
									<ul class='list-inline'>
@if(Auth::check())
										<li>
											<a href='/messenger/compose/to={{ \String::slugEncode($member->id, $member->display_name) }}' title='Message {{ $member->display_name }}'>
												<i class='text-primary fa fa-inbox fa-3x'></i>
											</a>
										</li>
@endif
									</ul>
								</div>
							</div>
						</div>
					</div>
@endforeach
				</div>
			</div>
@stop