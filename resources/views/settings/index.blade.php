@extends('...layouts.settings')
@section('settings')
						<form action='' class='form-horizontal' method='post' role='form'>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='email'>
									@lang('settings.profile.timezone.name')
								</label>
								<div class='col-lg-10'>
									<select name='timezone'>
@foreach($timezoneOptions as $timezoneHour => $timezoneName)
										<option name='{{$timezoneHour}}'>
											{{$timezoneName}}
										</option>
@endforeach
									</select>
								</div>
							</div>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='email'>
									@lang('settings.profile.timezone.dst')
								</label>
								<div class='col-lg-10'>
									<input type='checkbox' name='timezone_dst' />
								</div>
							</div>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='email'>
									@lang('settings.profile.comments_visitors.name')
								</label>
								<div class='col-lg-10'>
									<input type='checkbox' name='visitors_show' />
									<span class='help-block'>
										@lang('settings.profile.comments_visitors.help')
									</span>
								</div>
							</div>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='email'>
									@lang('settings.profile.friends.name')
								</label>
								<div class='col-lg-10'>
									<input type='checkbox' name='friends_show' />
									<span class='help-block'>
										@lang('settings.profile.friends.help')
									</span>
								</div>
							</div>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='email'>
									@lang('settings.profile.birthday.name')
								</label>
								<div class='col-lg-10'>
									<select name='birthday_year'>
@foreach(range(1900, date('Y')) as $year)
										<option value='{{$year}}'>
											{{$year}}
										</option>
@endforeach
									</select>
									<select name='birthday_month'>
@foreach(range(1, 12) as $month)
										<option value='{{$month}}'>
											@lang('settings.profile.birthday.months.' . $month)
										</option>
@endforeach
									</select>
									<select name='birthday_day'>
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
								<label class='col-lg-2 control-label' for='email'>
									@lang('settings.profile.gender')
								</label>
								<div class='col-lg-10'>
									<select name='gender'>
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
								<label class='col-lg-2 control-label' for='email'>
									@lang('settings.profile.location')
								</label>
								<div class='col-lg-10'>
									<input type='text' name='location' />
								</div>
							</div>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='email'>
									@lang('settings.profile.interests')
								</label>
								<div class='col-lg-10'>
									<input type='text' name='interests' />
								</div>
							</div>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='email'>
									@lang('settings.profile.referred_by.name'):
								</label>
								<div class='col-lg-10'>
                                    <input type='text' name='referred_by' />
                                    <span class='help-block'>
                                        @lang('settings.profile.referred_by.note')
                                    </span>
								</div>
							</div>
						</form>
@stop