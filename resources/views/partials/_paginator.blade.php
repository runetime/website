                    <ol class='breadcrumb'>
                        <li>
                            <a href='{{ $url }}'>
                                <i class='fa fa-angle-double-left'></i>
                            </a>
                        </li>
@for($pageX = 1; $pageX <= $pages; $pageX++)
    @if($pageX === $page)
                        <li class='current'>
    @else
                        <li>
    @endif
                            <a href='{{ $url }}/page={{ $pageX }}'>
                                {{ $pageX }}
                            </a>
                        </li>
@endfor
                        <li>
                            <a href='{{ $url }}/page={{ $pages }}'>
                                <i class='fa fa-angle-double-right'></i>
                            </a>
                        </li>
                    </ol>
