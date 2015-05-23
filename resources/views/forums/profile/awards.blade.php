@extends('layouts.profile')
@section('profile')
<h3>
    @lang('profile.awards.title', ['name' => $profile->display_name])
</h3>
@foreach($awards as $award)
    @include('awards._show', ['award' => $award->award, 'at' => $award->created_at])
@endforeach
@stop
