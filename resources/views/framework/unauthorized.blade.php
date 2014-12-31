@extends('layouts.default')
@section('contents')
    <div class='wrapper'>
        <p class='lead text-danger'>
            You don't have access to this page.
        </p>
        <p class='text-info'>
            It looks like you don't have access to this page!  Most likely it's a staff-only page, sorry. :(
        </p>
        <p>
            <a href='/' class='btn btn-info btn-lg' title='Back to Homepage' role='button'>
                Back to Homepage
            </a>
        </p>
    </div>
@stop