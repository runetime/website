<p>
@if(!empty($done))
    <a href='/language/set/{{ $initial }}' title='{{ $lang['local'] }}'>
@endif
        {{ $lang['local'] }} ({{ $lang['english'] }})
@if(!empty($done))
    </a>
@endif
</p>
