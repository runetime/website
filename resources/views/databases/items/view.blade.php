@extends('layouts.default')
@section('contents')
            <div class='wrapper'>
                <h1>
                    {{ $item->name }}
                </h1>
                <p>
                    <small>
                        @lang('guides.written_by', ['name' => Link::name($item->author_id), 'date' => $item->created_at])
                    </small>
                    <br />
                    <small>
                        @lang('guides.last_updated', ['date' => Time::long($item->updated_at)])
                    </small>
                    <br />
                    <small>
                        @lang('guides.edited_by', ['users' => $item->getEditors()])
                    </small>
                </p>
            </div>
            <div class='wrapper-dark'>
                <dl class='dl-horizontal'>
                    <dt>
                        @lang('database.items.view.examine')
                    </dt>
                    <dd>
                        {!! $item->examine_parsed !!}
                    </dd>
                    <dt>
                        @lang('database.items.view.membership')
                    </dt>
                    <dd>
                        {{ $item->membership == 1 ? trans('utilities.yes') : trans('utilities.no') }}
                    </dd>
                    <dt>
                        @lang('database.items.view.tradable')
                    </dt>
                    <dd>
                        {{ $item->tradable == 1 ? trans('utilities.yes') : trans('utilities.no') }}
                    </dd>
                    <dt>
                        @lang('database.items.view.quest_item')
                    </dt>
                    <dd>
                        {{ $item->quest_item == 1 ? trans('utilities.yes') : trans('utilities.no') }}
                    </dd>
                </dl>
            </div>
@stop
