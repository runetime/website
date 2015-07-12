@extends('layouts.default')
@section('contents')
<div class='wrapper-flat'>
    <h1>
        @lang('members.title')
    </h1>
</div>
<div class='wrapper-dark row row-margin text-center'>
    <div class='col-xs-12 col-sm-4'>
        <h3 class='holo-text'>
            @lang('members.search.role')
        </h3>
        <select class='holo-text-secondary textarea-width' multiple>
@foreach($roles as $role)
            <option onclick="window.location.href='/members/role={{ $role->name }}/prefix={{ $searchPrefix }}/order={{ $searchOrder }}';" @if($searchRole == $role->name) selected @endif>
                {{ $role->name }}
            </option>
@endforeach
        </select>
    </div>
    <div class='col-xs-12 col-sm-4'>
        <h3 class='holo-text'>
            @lang('members.search.prefix')
        </h3>
        <select class='holo-text-secondary textarea-width' multiple>
@foreach($prefixes as $prefix)
            <option onclick="window.location.href='/members/role={{ $searchRole }}/prefix={{ $prefix }}/order={{ $searchOrder }}';" @if($searchPrefix == $prefix) selected @endif>
                {{ $prefix }}
            </option>
@endforeach
        </select>
    </div>
    <div class='col-xs-12 col-sm-4'>
        <h3 class='holo-text'>
            @lang('members.search.order')
        </h3>
        <select class='holo-text-secondary textarea-width' multiple>
@foreach($orders as $order)
            <option onclick="window.location.href='/members/role={{ $searchRole }}/prefix={{ $searchPrefix }}/order={{ $order }}';" @if($searchOrder == $order) selected @endif>
                {{ ucwords($order) }}
            </option>
@endforeach
        </select>
    </div>
</div>
<div class='wrapper wrapper-flat'>
@include('partials._paginator', ['url' => '/members/role=' . $searchRole . '/prefix=' . $searchPrefix . '/order=' . $searchOrder])
    <div class='row row-flat'>
@foreach($members as $member)
        <div class='col-xs-12 row row-flat' style='padding-bottom: 15px !important;'>
            <div class='col-xs-3 col-md-2 col-lg-1'>
                <a href='{{ $member->toSlug() }}'>
                    {!! \Image::userPhoto($member->id, ['center-block']) !!}
                </a>
            </div>
            <div class='col-xs-9 col-md-10 col-lg-11'>
                <div class='clearfix'>
                    <div class='pull-left'>
                        {!! \Link::name($member->id) !!}
                        <br />
                        @lang('members.joined',['date' => Time::long($member->created_at)])
                        <br />
                        {!! \Link::colorRole($member->importantRole()->id) !!}
                    </div>
                    <div class='pull-right'>
                        <ul class='list-inline'>
@if(Auth::check())
                            <li>
                                <a href='/messenger/compose/to={{ \String::slugEncode($member->id, $member->display_name) }}' title='@lang('members.message', ['name' => $member->display_name])'>
                                    <i class='text-primary fa fa-inbox fa-3x'></i>
                                </a>
                            </li>
@endif
                        </ul>
                    </div>
                </div>
            </div>
        </div>
@endforeach
    </div>
</div>
@stop
