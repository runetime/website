@extends('layouts.default')
@section('contents')
<div class='wrapper'>
    <h1>
        {{ $user->display_name }}
    </h1>
    <p>
        Check a checkbox to have that be one of the user's role and the radio to denote which is their most important role.
    </p>
    <form class='form-horizontal' method='post' action='' role='form'>
        <div class='form-group'>
            <label class='col-lg-2 control-label' for='role'>
                @lang('profile.role')
            </label>
            <div class='col-lg-10'>
@foreach($roles as $role)
                <div class='checkbox'>
    @if($user->importantRole()->id === $role->id)
                    <input type='radio' name='important' value='{{ $role->id }}' checked />
    @else
                    <input type='radio' name='important' value='{{ $role->id }}' />
    @endif
                    <label>

    @if($user->hasRole($role->name))
                        <input type='checkbox' name='role[]' value='{{ $role->id }}' checked />
    @else
                        <input type='checkbox' name='role[]' value='{{ $role->id }}' />
    @endif
                        {{ $role->name }}
                    </label>
                </div>
@endforeach
            </div>
        </div>
        <div class='form-group'>
            <div class='col-lg-offset-2 col-lg-10'>
                <button class='btn btn-primary' type='submit'>
                    @lang('fields.submit')
                </button>
            </div>
        </div>
    </form>
</div>
@stop
