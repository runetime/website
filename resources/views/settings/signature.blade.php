@extends('layouts.settings')
@section('settings')
                        <h3>
                            @lang('settings.signature.current')
                        </h3>
                        <div class='well well-sm'>
@if(!empty(\Auth::user()->signature_parsed))
                            <p class='inline'>{!! \Auth::user()->signature_parsed !!}</p>
@else
                            <p class='text-info'>
                                <em>
                                    You do not have a Signature.
                                </em>
                            </p>
@endif
                        </div>
                        <h3>
                            @lang('settings.signature.edit')
                        </h3>
                        <form action='' class='form-horizontal' method='post' role='form' enctype='multipart/form-data'>
                            <div class='form-group'>
                                <label class='col-lg-2 control-label' for='contents'>
                                    Contents
                                </label>
                                <div class='col-lg-10'>
                                    <textarea name='contents' id='contents' rows='15' class='form-control'>{{ \Auth::user()->signature }}</textarea>
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
