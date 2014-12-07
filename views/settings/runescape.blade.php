@extends('layouts.settings')
@section('settings')
						<h3>
							@lang('settings.runescape.edit')
						</h3>
						<form action='' class='form-horizontal' method='post' role='form'>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='version'>
									Version
								</label>
								<div class='col-lg-10'>
									<select id='version' name='version'>
@foreach($versions as $version)
										<option{{ $version == \Auth::user()->runescape_version ? " selected='selected'" : "" }}>
											{{ $version }}
										</option>
@endforeach
									</select>
								</div>
							</div>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='rsn'>
									RSN
								</label>
								<div class='col-lg-10'>
									<input type='text' id='rsn' name='rsn' value='{{ \Auth::user()->runescape_rsn }}' />
								</div>
							</div>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='clan'>
									Clan
								</label>
								<div class='col-lg-10'>
									<input type='text' id='clan' name='clan' value='{{ \Auth::user()->runescape_clan }}' />
								</div>
							</div>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='allegiance'>
									Allegiance
								</label>
								<div class='col-lg-10'>
									<select id='allegiance' name='allegiance'>
@foreach($allegiances as $allegiance)
										<option{{ $allegiance == \Auth::user()->runescape_allegiance ? " selected='selected'" : "" }}>
											{{ $allegiance }}
										</option>
@endforeach
									</select>
								</div>
							</div>
							<div class='form-group'>
								<div class='col-lg-offset-2 col-lg-10'>
									<button class='btn btn-primary' type='submit'>
										Save
									</button>
								</div>
							</div>
						</form>
@stop