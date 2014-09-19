						<tr>
							<td>
								{{HTML::image(Utilities::URL(Utilities::memberPhoto($member->id)),'Photo',['class'=>'img-responsive photo-sm'])}} 
							</td>
							<td>
								{{$member->display_name}} 
							</td>
							<td>
								{{$member->title}} 
							</td>
							<td>
								{{Time::short($member->created_at)}} 
							</td>
						</tr>