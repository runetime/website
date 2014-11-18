@extends('layouts.settings')
@section('settings')
						<form action='' class='form-horizontal' method='post' role='form'>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='timezone'>
									@lang('settings.profile.timezone.name')
								</label>
								<div class='col-lg-10'>
									<select id='timezone' name='timezone'>
@foreach($timezoneOptions as $timezoneHour => $timezoneName)
										<option value='{{$timezoneHour}}'{!! $timezoneHour == \Auth::user()->timezone ? " selected='selected'" : ""  !!}>
											{{$timezoneName}}
										</option>
@endforeach
									</select>
								</div>
							</div>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='timezone_dst'>
									@lang('settings.profile.timezone.dst')
								</label>
								<div class='col-lg-10'>
									<input type='checkbox' name='timezone_dst' id='timezone_dst'{{\Auth::user()->dst ? " checked='checked" : ""}} />
								</div>
							</div>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='birthday_year'>
									@lang('settings.profile.birthday.name')
								</label>
								<div class='col-lg-10'>
									<select id='birthday_year' name='birthday_year'>
										<option value='0'>
											--
										</option>
@foreach(range(1900, date('Y')) as $year)
										<option value='{{$year}}'>
											{{$year}}
										</option>
@endforeach
									</select>
									<select id='birthday_month' name='birthday_month'>
										<option value='0'>
											--
										</option>
@foreach(range(1, 12) as $month)
										<option value='{{$month}}'>
											@lang('settings.profile.birthday.months.' . $month)
										</option>
@endforeach
									</select>
									<select id='birthday_day' name='birthday_day'>
										<option value='0'>
											--
										</option>
@foreach(range(1, 31) as $day)
										<option value='{{$day}}'>
											{{$day}}
										</option>
@endforeach
									</select>
									<span class='help-block'>
										@lang('settings.profile.birthday.note')
									</span>
								</div>
							</div>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='gender'>
									@lang('settings.profile.gender')
								</label>
								<div class='col-lg-10'>
									<select id='gender' name='gender'>
										<option value='0'>
											@lang('profile.gender.not_telling')
										</option>
										<option value='1'>
											@lang('profile.gender.female')
										</option>
										<option value='2'>
											@lang('profile.gender.male')
										</option>
									</select>
								</div>
							</div>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='location'>
									@lang('settings.profile.location')
								</label>
								<div class='col-lg-10'>
									<input type='text' id='location' name='location' />
								</div>
							</div>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='interests'>
									@lang('settings.profile.interests')
								</label>
								<div class='col-lg-10'>
									<input type='text' id='interests' name='interests' />
								</div>
							</div>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='referred_by'>
									@lang('settings.profile.referred_by.name'):
								</label>
								<div class='col-lg-10'>
									<input type='text' id='referred_by' name='referred_by' />
									<span class='help-block'>
										@lang('settings.profile.referred_by.note')
									</span>
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