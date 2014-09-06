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
@foreach($awardees as $awardee)
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
							</td>
						</tr>
@endforeach
					</tbody>
				</table>
			</div>