@extends('layouts.default')
@section('contents')
            <div class='wrapper'>
                <h1>
                    @lang('database.title')
                </h1>
                <ul>
                    <li>
                        <a href='/databases/items'>
                            @lang('database.items.title')
                        </a>
                    </li>
                    <li>
                        <a href='/databases/monsters'>
                            @lang('database.monsters.title')
                        </a>
                    </li>
                </ul>
            </div>
@stop
