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
    @if($timezoneHour == \Auth::user()->timezone)
                                        <option value='{{ $timezoneHour }}' selected='selected'>
    @else
                                        <option value='{{ $timezoneHour }}'>
    @endif
                                            {{ $timezoneName }}
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
@if(\Auth::user()->dst)
                                    <input type='checkbox' name='timezone_dst' id='timezone_dst' checked='checked' />
@else
                                        <input type='checkbox' name='timezone_dst' id='timezone_dst' />
@endif
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
@foreach(range(1900, date('Y') - 13) as $year)
    @if($bYear === $year)
                                        <option value='{{ $year }}' selected='selected'>
    @else
                                        <option value='{{ $year }}'>
    @endif
                                            {{ $year }}
                                        </option>
@endforeach
                                    </select>
                                    <select id='birthday_month' name='birthday_month'>
                                        <option value='0'>
                                            --
                                        </option>
@foreach(range(1, 12) as $month)
    @if($bMonth === $month)
                                        <option value='{{ $month }}' selected='selected'>
    @else
                                        <option value='{{ $month }}'>
    @endif
                                            @lang('settings.profile.birthday.months.' . $month)
                                        </option>
@endforeach
                                    </select>
                                    <select id='birthday_day' name='birthday_day'>
                                        <option value='0'>
                                            --
                                        </option>
@foreach(range(1, 31) as $day)
    @if($bDay === $day)
                                        <option value='{{ $day }}' selected='selected'>
    @else
                                        <option value='{{ $day }}'>
    @endif
                                            {{ $day }}
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
@foreach($genders as $genderId => $genderName)
    @if($genderId === \Auth::user()->gender)
                                        <option value='{{ $genderId }}' selected='selected'>
    @else
                                        <option value='{{ $genderId }}'>
    @endif

                                            {{ $genderName }}
                                        </option>
@endforeach
                                    </select>
                                </div>
                            </div>
                            <div class='form-group'>
                                <label class='col-lg-2 control-label' for='location'>
                                    @lang('settings.profile.location')
                                </label>
                                <div class='col-lg-10'>
                                    <input type='text' id='location' name='location' value='{{ \Auth::user()->location }}' />
                                </div>
                            </div>
                            <div class='form-group'>
                                <label class='col-lg-2 control-label' for='interests'>
                                    @lang('settings.profile.interests')
                                </label>
                                <div class='col-lg-10'>
                                    <textarea name='interests' id='interests' rows='5' class='form-control'>{{ \Auth::user()->interests }}</textarea>
                                </div>
                            </div>
                            <div class='form-group'>
                                <label class='col-lg-2 control-label' for='referred_by'>
                                    @lang('settings.profile.referred_by.name'):
                                </label>
                                <div class='col-lg-10'>
                                    <input type='text' id='referred_by' name='referred_by' value='{{ !empty(\Auth::user()->referredBy->id) ? \Auth::user()->referredBy->display_name : "" }}' />
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
