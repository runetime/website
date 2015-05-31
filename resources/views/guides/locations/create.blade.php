@extends('layouts.default')
@section('contents')
<div class='wrapper'>
    <h1>
        @lang('guides.locations.create.title')
    </h1>
    <p class='text-info'>
        @lang('guides.create_note')
    </p>
    <form action='' method='post' class='form-horizontal' role='form'>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='name'>
                @lang('guides.locations.create.name')
            </label>
            <div class='col-lg-10'>
                <input id='name' class='form-control' type='text' name='name' required />
            </div>
        </div>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='contents'>
                @lang('guides.locations.create.contents')
            </label>
            <div class='col-lg-10'>
                <textarea name='contents' id='contents' class='form-control' rows='10' required></textarea>
            </div>
        </div>
        <div class='form-group'>
            <div class='col-lg-offset-2 col-lg-10'>
                <button class='btn btn-primary' type='submit'>
                    @lang('guides.locations.create.submit')
                </button>
            </div>
        </div>
    </form>
</div>
@stop
