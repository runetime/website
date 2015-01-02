<div id='morphsearch' class='morphsearch'>
	<form class='morphsearch-form'>
		<input class='morphsearch-input' type='search' placeholder='Search...' />
		<button class='morphsearch-submit' type='submit'>
            Search
        </button>
	</form>
	<div class='morphsearch-content'>
		<div class='column'>
			<h2>People</h2>
@for($i = 1; $i <= 6; $i++)
			<a class='media-object' href='/{{ $i }}'>
				<img class='round' src='/img/forums/photos/1.png' />
				<h3>
                    Person {{ $i }}
                </h3>
			</a>
@endfor
		</div>
		<div class='column'>
			<h2>Threads</h2>
@for($i = 1; $i <= 6; $i++)
			<a class='media-object' href='/{{ $i }}'>
				<img src='/img/forums/photos/1.png' />
				<h3>
                    Thread {{ $i }}
                </h3>
			</a>
@endfor
		</div>
		<div class='column'>
			<h2>News</h2>
@for($i = 1; $i <= 6; $i++)
			<a class='media-object' href='/{{ $i }}'>
				<img src='/img/forums/photos/1.png' />
				<h3>
                    News {{ $i }}
                </h3>
			</a>
@endfor
		</div>
	</div>
	<span class='morphsearch-close'></span>
</div>