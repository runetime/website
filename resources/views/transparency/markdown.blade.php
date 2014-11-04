@extends('layouts.default')
@section('contents')
<div class='wrapper'>
	<h1>
		Markdown
	</h1>
	<p class='text-info'>
		Each of these is an example of how different components of Markdown works, which is similar to BBCode.
	</p>
	<p class='text-info'>
		RuneTime uses a Markdown renderer called <a href='http://parsedown.com'>Parsedown</a>.  These Markdown templates are from their <a href='https://github.com/erusev/parsedown'>Github repository</a> and rendered by their Markdown parser on pageload.  Their Markdown parser is under MIT license.
	</p>
	@foreach($files as $name => $markdown)
	<div class='well'>
		<h3 class='text-center'>
			{{$name}}
		</h3>
		<div class='row'>
			<div class='col-xs-12 col-sm-6'>
				<h4 class='text-center'>
					Markdown
				</h4>
				<pre>
{{$markdown}}
				</pre>
			</div>
			<div class='col-xs-12 col-sm-6'>
				<h4 class='text-center'>
					Rendered Result
				</h4>
				<div>
					{!!$renderedFiles[$name]!!}
				</div>
			</div>
		</div>
	</div>
	@endforeach
</div>
@stop