@extends('layouts.default')
@section('contents')
<div class='wrapper'>
    <h1>
        Staff Checkup
    </h1>
    <form class='form-horizontal' method='post' action='' role='form'>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='username'>
                @lang('fields.username')
            </label>
            <div class='col-lg-10'>
                <input type='text' id='username' name='username' class='form-control' placeholder='{{\Auth::user()->display_name}}' required readonly />
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='date'>
                @lang('fields.date')
            </label>
            <div class='col-lg-10'>
                <input type='text' id='date' name='date' class='form-control' placeholder='{{$date}}' required readonly />
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='active'>
                @lang('fields.active')
            </label>
            <div class='col-lg-10'>
                <div class='radio'>
                    <label>
                        <input type='radio' name='active' id='active-yes' value='1' checked />
                        Yes
                    </label>
                </div>
                <div class='radio'>
                    <label>
                        <input type='radio' name='active' id='active-no' value='0' />
                        No
                    </label>
                </div>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='hours_active'>
                @lang('fields.hours_active')
            </label>
            <div class='col-lg-10'>
                <textarea name='hours_active' class='form-control' rows='5'></textarea>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='date'>
                @lang('fields.team')
            </label>
            <div class='col-lg-10'>
                <div class='radio'>
                    <label>
                        <input type='radio' name='team' id='team-content' value='content' checked />
                        @lang('staff.checkup.team.content')
                    </label>
                </div>
                <div class='radio'>
                    <label>
                        <input type='radio' name='team' id='team-development' value='development' />
                        @lang('staff.checkup.team.development')
                    </label>
                </div>
                <div class='radio'>
                    <label>
                        <input type='radio' name='team' id='team-community' value='community' />
                        @lang('staff.checkup.team.community')
                    </label>
                </div>
                <div class='radio'>
                    <label>
                        <input type='radio' name='team' id='team-radio' value='radio' />
                        @lang('staff.checkup.team.radio')
                    </label>
                </div>
                <div class='radio'>
                    <label>
                        <input type='radio' name='team' id='team-graphics' value='graphics' />
                        @lang('staff.checkup.team.graphics')
                    </label>
                </div>
            </div>
        </div>
        <div class='form-group'>
            <div class='col-lg-offset-2 col-lg-10'>
                <button class='btn btn-primary' type='submit'>
                    @lang('utilities.submit')
                </button>
            </div>
        </div>
    </form>
</div>
@stop
