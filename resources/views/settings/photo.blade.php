@extends('layouts.settings')
@section('settings')
<h3>
    @lang('settings.photo.current')
</h3>
<div class='well well-sm'>
    {!! \Image::userPhoto(\Auth::user()->id) !!}
</div>
<h3>
    @lang('settings.photo.change')
</h3>
<form action='' class='form-horizontal' method='post' role='form' enctype='multipart/form-data'>
    <div class='form-group'>
        <div class='col-lg-10 col-lg-offset-2'>
            <input id='photo' class='form-control' type='file' name='photo' />
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
