@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Livestream Reset
				</h1>
			</div>
			<h3 class='text-info text-center'>
				Reseting livestream status...
			</h3>
			<p class='text-center'>
				Status: <span class='text-muted' rt-hook='livestream.reset:status'>checking</span>
			</p>
			<p class='text-center' rt-hook='livestream.reset:spinner'>
				<i class='fa fa-spinner fa-spin fa-3x text-info'></i>
			</p>
			<p rt-hook='livestream.reset:note'></p>
			<script>
				livestreamReset = new LivestreamReset();
			</script>
@stop