@if($staff!==array_filter($staff))
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
								Title
							</td>
							<td>
								Joined
							</td>
						</tr>
					</thead>
					<tbody>
@foreach($staff as $member)
@if(!empty($member))
@include('staff.list.row',['staff'=>$member])
@endif
@endforeach
					</tbody>
				</table>
@endif