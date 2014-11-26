@extends('layouts.default')
@section('contents')
			<div class='wrapper-dark'>
				<h1>
					<img src='/img/skills/large/{{$calculator->name_trim}}.png' alt='Firemaking' class='img-responsive pull-left' /> {{$calculator->name}} Calculator
				</h1>
				<div class='row text-center'>
					<div class='col-xs-12 col-sm-4'>
						<label for='calculator-display-name'>
							@lang('calculator.username')
						</label>
						<input type='text' id='calculator-display-name' class='center-block' />
						<p>
							<a id='calculator-submit'>
								@lang('calculator.submit')
							</a>
						</p>
					</div>
					<div class='col-xs-12 col-sm-4'>
						<label for='calculator-current-xp'>
							@lang('calculator.current')
						</label>
						<input type='text' id='calculator-current-xp' class='center-block' />
					</div>
					<div class='col-xs-12 col-sm-3'>
						<label for='calculator-target-level'>
							@lang('calculator.target')
						</label>
						<input type='text' id='calculator-target-level' class='center-block' />
					</div>
				</div>
			</div>
			<div class='wrapper'>
				<table id='calculator-table' class='full-width text-center'>
					<thead>
						<tr>
							<td>
								@lang('calculator.table.name')
							</td>
							<td>
								@lang('calculator.table.level_required')
							</td>
							<td>
								@lang('calculator.table.xp_per')
							</td>
							<td>
								@lang('calculator.table.amount_needed')
							</td>
						</tr>
					</thead>
					<tbody>
					</tbody>
				</table>
			</div>
			<script>
                $(function() {
                    "use strict";
                    calculator = new Calculator({{ $calculator->id }});
                });
			</script>
@stop