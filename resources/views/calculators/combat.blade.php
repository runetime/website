@extends('layouts.default')
@section('contents')
			<div class='wrapper-dark'>
				<h1>
					<img src='/img/skills/large/attack.png' alt='Combat Calculator' class='img-responsive pull-left' /> Combat Calculator
				</h1>
				<div class='row text-center'>
					<div class='col-xs-12 col-sm-4'>
						<label class='holo-text' for='combat-calculator-display-name'>
							@lang('calculator.username')
						</label>
						<input type='text' class='center-block' rt-data='combat.calculator:name' />
						<p>
							<a rt-data='combat.calculator:submit'>
								@lang('calculator.submit')
							</a>
						</p>
					</div>
					<div class='col-xs-12 col-sm-6'>
						<h3 class='holo-text'>
							Combat Level
						</h3>
						<p class='holo-text-secondary' rt-data='combat.calculator:level'>
							4
						</p>
					</div>
				</div>
			</div>
			<div class='wrapper'>
				<dl class='dl-horizontal'>
					<dt>
						Attack
					</dt>
					<dd>
						<img src='/img/skills/attack.png' />
						<input type='text' size='3' value='1' style='display:inline !important;' rt-data='combat.calculator:attack' />
					</dd>
					<dt>
						Defence
					</dt>
					<dd>
						<img src='/img/skills/defence.png' />
						<input type='text' size='3' value='1' style='display:inline !important;' rt-data='combat.calculator:defence' />
					</dd>
					<dt>
						Strength
					</dt>
					<dd>
						<img src='/img/skills/strength.png' />
						<input type='text' size='3' value='1' style='display:inline !important;' rt-data='combat.calculator:strength' />
					</dd>
					<dt>
						Constitution
					</dt>
					<dd>
						<img src='/img/skills/constitution.png' />
						<input type='text' size='3' value='10' style='display:inline !important;' rt-data='combat.calculator:constitution' />
					</dd>
					<dt>
						Ranged
					</dt>
					<dd>
						<img src='/img/skills/ranged.png' />
						<input type='text' size='3' value='1' style='display:inline !important;' rt-data='combat.calculator:ranged' />
					</dd>
					<dt>
						Prayer
					</dt>
					<dd>
						<img src='/img/skills/prayer.png' />
						<input type='text' size='3' value='1' style='display:inline !important;' rt-data='combat.calculator:prayer' />
					</dd>
					<dt>
						Magic
					</dt>
					<dd>
						<img src='/img/skills/magic.png' />
						<input type='text' size='3' value='1' style='display:inline !important;' rt-data='combat.calculator:magic' />
					</dd>
					<dt>
						Summoning
					</dt>
					<dd>
						<img src='/img/skills/summoning.png' />
						<input type='text' size='3' value='1' style='display:inline !important;' rt-data='combat.calculator:summoning' />
					</dd>
				</dl>
			</div>
			<script>
                $(function() {
                    RuneTime.CombatCalculator = new RuneTime.CombatCalculator();
                    RuneTime.CombatCalculator.setup();
                });
			</script>
@stop