@if(!empty($staff))
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
		@include('staff.list.row',['member'=>json_decode($member)])
	@endforeach
					</tbody>
				</table>
@endif