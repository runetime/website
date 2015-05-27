@extends('layouts.default')
@section('contents')
<div class='wrapper'>
    <h1>
        @lang('messenger.create.title')
    </h1>
    <form action='' method='post' class='form-horizontal' role='form'>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='participants'>
                @lang('messenger.participants')
            </label>
            <div class='col-lg-10'>
                <input type='text' id='participants' name='participants' class='form-control' required {{!empty($to) ? "value=" . $to->display_name : ""}} />
                <span class='help-block'>
                    @lang('messenger.create.note')
                </span>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='title'>
                @lang('fields.subject')
            </label>
            <div class='col-lg-10'>
                <input type='text' id='title' name='title' class='form-control' required />
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='contents'>
                @lang('fields.message')
            </label>
            <div class='col-lg-10'>
                <textarea class='form-control' id='contents' name='contents' rows='15' required></textarea>
            </div>
        </div>
        <div class='form-group'>
            <div class='col-lg-offset-2 col-lg-10'>
                <button class='btn btn-primary' type='submit'>
                    @lang('messenger.create.send')
                </button>
            </div>
        </div>
    </form>
</div>
@stop
