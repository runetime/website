@extends('layouts.default')
@section('contents')
			<div class='wrapper-dark row row-margin text-center'>
                <div class='col-xs-12'>
                    <h3 class='holo-text'>
                        Membership
                    </h3>
                    <ul class='list-inline holo-text-secondary'>
@foreach($memberships as $membership)
                        <li>
                            <a href='/databases/monsters/membership={{$membership}}' title='{{ucwords($membership)}}'>
@if($searchMembership == $membership)
                                <b>
                                    {{ucwords($membership)}}
                                </b>
@else
                            {{ucwords($membership)}}
@endif
                            </a>
                        </li>
@endforeach
                    </ul>
                </div>
                <div class='col-xs-12'>
                    <a href='/databases/monsters' class='text-muted'>
                        Clear Search
                    </a>
                </div>
			</div>
			<div class='wrapper'>
				<ul class='list-inline pull-right'>
@if(\Auth::check() && \Auth::user()->isContent())
					<li>
						<a href='/databases/monsters/create' class='btn btn-sm btn-success'>
							Create Monster
						</a>
					</li>
@endif
				</ul>
				<table class='table table-hover table-striped table-responsive no-border'>
					<thead>
						<tr>
							<td>
								&nbsp;
							</td>
							<td>
								Name
							</td>
							<td>
								Examine
							</td>
							<td>
								Membership
							</td>
						</tr>
					</thead>
					<tbody>
@foreach($monsters as $monster)
						<tr onclick="">
							<td>
								img
							</td>
							<td>
								<a href='/databases/monsters/{{ \String::slugEncode($monster->id, $monster->name) }}'>
									{{ $monster->name }}
								</a>
							</td>
							<td>
								{!!$monster->examine_parsed!!}
							</td>
							<td>
								{{$monster->membership ? "Yes" : "No"}}
							</td>
						</tr>
@endforeach
					</tbody>
				</table>
			</div>
@stop