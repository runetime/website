@extends('layouts.default')
@section('contents')
            <div class='wrapper'>
@if (Session::has('error'))
                <p class='text-warning'>
                    {{ Session::get('error') }}
                </p>
@endif
                <form action='' method='post' class='form-horizontal' role='form'>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='email'>
                            @lang('auth.login.email_address')
                        </label>
                        <div class='col-lg-10'>
                            <input id='email' class='form-control' type='text' name='email' value='{{ $reset->email }}' required disabled />
                        </div>
                    </div>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='password'>
                            @lang('auth.reset.password_new')
                        </label>
                        <div class='col-lg-10'>
                            <input id='password' class='form-control' type='password' name='password' required />
                        </div>
                    </div>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='password_confirmation'>
                            @lang('auth.reset.password_confirmation')
                        </label>
                        <div class='col-lg-10'>
                            <input id='password_confirmation' class='form-control' type='password' name='password_confirmation' required />
                        </div>
                    </div>
                    <div class='form-group'>
                        <div class='col-lg-offset-2 col-lg-10'>
                            <button class='btn btn-primary' type='submit'>
                                @lang('auth.reset.reset_password')
                            </button>
                        </div>
                    </div>
                </form>
            </div>
@stop
