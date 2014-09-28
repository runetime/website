@extends('layouts.default')
		<div class='wrapper-flat'>
				<h1>
					Member List
				</h1>
			</div>
			<div class='wrapper-dark row row-margin'>
				Search Params
			</div>
			<div class='wrapper'>
@if(!empty($paginator))
				<ul class='pagination'>
<?php echo $paginator->render(); ?>
				</ul>
@endif
				<div class='row'>
@foreach($members as $member)
					<div class='col-xs-1'>
						<img src='/img/forum/photos/{{$member->id}}.png' alt='Member Photo' class='photo-sm img-responsive' />
					</div>
					<div class='col-xs-11'>
						<div class='pull-left'>
							{{Utilities::linkName($member->id)}} 
							<br />
							@lang('members.joined',['date'=>Time::long($member->created_at)])
							<br />
							{{Utilities::colorRole($memberRoles[$member->id]->id)}} 
						</div>
						<div class='pull-right'>
@if(Auth::check())
							STUFF HERE
@endif
						</div>
					</div>
@endforeach
				</div>
			</div>