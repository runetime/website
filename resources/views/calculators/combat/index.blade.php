@extends('layouts.default')
@section('contents')
<div class='wrapper wrapper-flat'>
    <h1>
        @lang('calculator.combat.title')
    </h1>
    <div class='row row-flat text-center'>
        <div class='col-xs-12 col-sm-6'>
            <a href='/calculators/combat/3'>
                Runescape 3 Calculator
            </a>
        </div>
        <div class='col-xs-12 col-sm-6'>
            <a href='/calculators/combat/old-school'>
                Old School Calculator
            </a>
        </div>
    </div>
</div>
@stop
