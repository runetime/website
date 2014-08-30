			<div class='wrapper'>
				<h1>
					Award
				</h1>
				<table class='table'>
					<thead>
						<tr>
							<td>
								&nbsp;
							</td>
							<td>
								Name
							</td>
							<td>
								Table
							</td>
							<td>
								Date Awarded
							</td>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								{{HTML::image(Utilities::URL('img/forum/photos/'.$awardee->id.'.png'),'Photo',['class'=>'img-responsive photo-sm'])}} 
							</td>
							<td>
								{{$awardee->name}} 
							</td>
							<td>
								{{$awardee->title}} 
							</td>
							<td>
								{{Time::short($awardee</td>
						</tr>
					</tbody>
				</table>
			</div>@foreach($awardees as $awardee)
{{var_dump($awardee)}}
@endforeach