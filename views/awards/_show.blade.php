<div class='card clearfix'>
	<div class='pull-left'>
		<img src='/img/awards/{{ $award->id }}.png' alt='{{ $award->name }}' class='img-responsive' />
@if(isset($at))
		<p>
			Awarded on {{ \Time::DMY($at) }}
		</p>
@endif
	</div>
	<div class='pull-right'>
		<h4>
			{{ $award->name }}
		</h4>
		<p>
			{{ $award->description }}
		</p>
	</div>
</div>