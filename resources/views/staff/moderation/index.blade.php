@extends('layouts.default')
@section('contents')
            <div class='wrapper'>
                <h1>
                    Moderation Centre
                </h1>
                <div class='row'>
                    <div class='col-xs-12 col-sm-6 col-md-3'>
                        <h2>
                            Open Reports
                        </h2>
@foreach($reportList as $report)
                        <div class='card card-bad'>
                            <h4>
                                {{$report->reportee->id}}
                            </h4>
                            <p>
                                User reported the {{$type}} located in thread <a href='/forum/threads/{{\String::slugEncode($report->thread->id, $report->thread->title)}}' title='{{$report->thread->title}}'>
                                    {{$report->thread->title}}
                                </a>
                            </p>
                            <p class='text-muted'>
                                Reported at {{\Time::shortTime($report->created_at)}}
                            </p>
                        </div>
@endforeach
                    </div>
                </div>
            </div>
@stop