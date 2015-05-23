@extends('layouts.settings')
@section('settings')
@if(!empty($error))
                        <p class='text-warning'>
                            {{ $error }}
                        </p>
@endif
                        <form action='' class='form-horizontal' method='post' role='form'>
                            <div class='form-group'>
                                <label class='col-lg-2 control-label' for='current'>
                                    @lang('settings.password.current')
                                </label>
                                <div class='col-lg-10'>
                                    <input type='password' id='current' name='current' value='{{ $current }}' required />
                                </div>
                            </div>
                            <div class='form-group'>
                                <label class='col-lg-2 control-label' for='new'>
                                    @lang('settings.password.new')
                                </label>
                                <div class='col-lg-10'>
                                    <input type='password' id='new' name='new' value='{{ $new }}' required />
                                </div>
                            </div>
                            <div class='form-group'>
                                <label class='col-lg-2 control-label' for='new_confirm'>
                                    @lang('settings.password.confirm_new')
                                </label>
                                <div class='col-lg-10'>
                                    <input type='password' id='new_confirm' name='new_confirm' value='{{ $newConfirm }}' required />
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
