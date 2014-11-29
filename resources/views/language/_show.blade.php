<p>
@if(!empty($done))
<a href='/language/set/{{ $initials }}' title='{{ $name }}'>
@endif
    {{$name}}
@if(!empty($done))
</a>
@endif
</p>