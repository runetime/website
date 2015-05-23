@extends('layouts.default')
@section('contents')
            <div class='wrapper'>
                <ul class='list-inline pull-right'>
@if(\Auth::check() && \Auth::user()->isContent())
                    <li>
                        <a href='/guides/locations/create' class='btn btn-sm btn-success'>
                            @lang('guides.locations.create_location')
                        </a>
                    </li>
@endif
                </ul>
                <table class='table table-hover table-striped table-responsive no-border'>
                    <tbody>
@foreach($guides as $guide)
                        <tr>
                            <td>
                                <a href='/guides/locations/{{ \String::slugEncode($guide->id, $guide->name) }}' title='{{ $guide->name }}'>
                                    {{ $guide->name }}
                                </a>
                            </td>
                        </tr>
@endforeach
                    </tbody>
                </table>
            </div>
@stop
