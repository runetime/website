@extends('layouts.default')
@section('contents')
			<div class='wrapper-flat'>
				<h1>
					Member List
				</h1>
			</div>
			<div class='wrapper-dark row row-margin text-center'>
				<div class='col-xs-12 col-sm-4'>
					<h3 class='holo-text'>
						Role
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
						Prefix Letter
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
						Order
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
				<div class='row'>
@foreach($members as $member)
					<div class='col-xs-1'>
						<img src='/img/forum/photos/{{ $member->id }}.png' alt='Member Photo' class='img-responsive' />
					</div>
					<div class='col-xs-11'>
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
@endforeach
				</div>
			</div>
@stop