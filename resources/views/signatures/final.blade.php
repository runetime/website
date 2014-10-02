@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<p class='text-success'>
					@lang('signature.final.made',['name'=>$username])
				</p>
				<img src='{{$imgSrc}}' alt='RuneTime Signature for {{$username}}' />
				<br />
				<details>
					<summary>
						@lang('signature.final.link.direct')
					</summary>
					<p>
						<a href='{{$imgSrc}}'>
							http://runetime.com{{$imgSrc}}
						</a>
					</p>
				</details>
			</div>