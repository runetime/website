@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<div class='row row-flat'>
					<div class='col-xs-12 col-md-10'>
@foreach($subforumList[-1] as $subforums)
	@if(empty(json_decode($subforums->roles))||Auth::check()&&in_array(\Auth::user()->importantRole()->id,json_decode($subforums->roles)))
						<div class='panel panel-dark'>
							<div class='panel-heading'>
								<h3 class='panel-title'>
									<a href='/forums/{{\String::slugEncode($subforums->id,$subforums->name)}}' title='{{$subforums->name}}'>
										{{$subforums->name}} 
									</a>
								</h3>
							</div>
							<div class='panel-body padding-none'>
								<table class='table table-subforums'>
									<tbody>
		@foreach($subforumList[$subforums->id] as $subforum)
										<tr>
											<td>
											</td>
											<td>
												<h4>
													<a href='/forums/{{\String::slugEncode($subforum->id,$subforum->name)}}' title='{{$subforum->name}}'>
														{{$subforum->name}} 
													</a>
												</h4>
												{{$subforum->description}} 
											</td>
											<td>
												{{$subforum->threads}} threads
												<br />
												{{$subforum->posts}} posts
											</td>
											<td>
												Recent Post Info
											</td>
										</tr>
		@endforeach
									</tbody>
								</table>
							</div>
						</div>
	@endif
@endforeach
					</div>
					<div class='col-xs-12 col-md-2'>
						<h3>
							Recent Threads
						</h3>
						<h3>
							Recent Posts
						</h3>
					</div>
				</div>
			</div>
@stop