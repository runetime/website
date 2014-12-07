@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					IP Banning
				</h1>
				<form action='' method='post' class='form-horizontal' role='form'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='ip'>
							IP
						</label>
						<div class='col-lg-10'>
							<input type='text' id='ip' class='form-control' name='ip' required />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='contents'>
							Reason
						</label>
						<div class='col-lg-10'>
							<input type='text' id='contents' class='form-control' name='contents' />
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								Ban
							</button>
						</div>
					</div>
				</form>
@foreach($addresses as $ip)
				<div class='card'>
					{{ \String::decodeIP($ip->ip) }} <span class='text-muted'>{{ \Time::long($ip->created_at) }}</span>
					<br />
					{{ $ip->reason }}
				</div>
@endforeach
			</div>
@stop