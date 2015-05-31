@extends('layouts.default')
@section('contents')
<div class='wrapper-dark row row-margin text-center'>
    <div class='col-xs-12 col-sm-4'>
        <h3 class='holo-text'>
            @lang('guides.quests.difficulty.title')
        </h3>
        <ul class='list-inline holo-text-secondary'>
@foreach($difficulties as $difficulty)
            <li>
                <a href='/guides/quests/difficulty={{$difficulty->id}}/length={{$searchLength}}/membership={{$searchMembership}}' title='{{$difficulty->name}}'>
@if($searchDifficulty==$difficulty->id)
                    <b>
                        {{$difficulty->name}}
                    </b>
@else
                    {{$difficulty->name}}
@endif
                </a>
            </li>
@endforeach
        </ul>
    </div>
    <div class='col-xs-12 col-sm-4'>
        <h3 class='holo-text'>
            @lang('guides.quests.length.title')
        </h3>
        <ul class='list-inline holo-text-secondary'>
@foreach($lengths as $length)
            <li>
                <a href='/guides/quests/difficulty={{$searchDifficulty}}/length={{$length->id}}/membership={{$searchMembership}}' title='{{$length->name}}'>
@if($searchLength==$length->id)
                    <b>
                        {{$length->name}}
                    </b>
@else
                    {{$length->name}}
@endif
                </a>
            </li>
@endforeach
        </ul>
    </div>
    <div class='col-xs-12 col-sm-4'>
        <h3 class='holo-text'>
            @lang('utilities.membership.title')
        </h3>
        <ul class='list-inline holo-text-secondary'>
@foreach($memberships as $membership)
            <li>
                <a href='/guides/quests/difficulty={{$searchDifficulty}}/length={{$searchLength}}/membership={{$membership->id}}' title='{{$membership->name}}'>
@if($searchMembership==$membership->id)
                    <b>
                        {{$membership->name}}
                    </b>
@else
                    {{$membership->name}}
@endif
                </a>
            </li>
@endforeach
        </ul>
    </div>
    <div class='col-xs-12'>
        <a href='/guides/quests' class='text-muted'>
            @lang('guides.quests.search.clear')
        </a>
    </div>
</div>
<div class='wrapper'>
    <ul class='list-inline pull-right'>
@if(\Auth::check() && \Auth::user()->isContent())
        <li>
            <a href='/guides/quests/create' class='btn btn-sm btn-success'>
                @lang('guides.quests.create_quest')
            </a>
        </li>
@endif
    </ul>
    <table class='table table-hover table-striped table-responsive no-border'>
        <thead>
            <tr>
                <td>
                    @lang('guides.quests.create.name')
                </td>
                <td>
                    @lang('guides.quests.difficulty.title')
                </td>
                <td>
                    @lang('guides.quests.length.title')
                </td>
                <td>
                    @lang('guides.quests.view.quest_points')
                </td>
                <td>
                    @lang('guides.quests.view.membership')
                </td>
                <td>
                    @lang('guides.quests.view.completed')
                </td>
            </tr>
        </thead>
        <tbody data-link='row' class='rowlink'>
@if(!empty($guides))
    @foreach($guides as $guide)
            <tr>
                <td>
                    <a href='/guides/quests/{{\String::slugEncode($guide->id, $guide->name)}}' title='{{$guide->name}}'>
                        {{$guide->name}}
                    </a>
                </td>
                <td>
                    {{$guide->getDifficulty()}}
                </td>
                <td>
                    {{$guide->getLength()}}
                </td>
                <td>
                    {{$guide->qp}}
                </td>
                <td>
                    {{$guide->getMembership()}}
                </td>
                <td>
                    {{$guide->completed == 1 ? trans('utilities.yes') : trans('utilities.no')}}
                </td>
            </tr>
    @endforeach
@endif
        </tbody>
    </table>
</div>
@stop
