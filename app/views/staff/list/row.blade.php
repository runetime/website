						<tr>
							<td>
								{{HTML::image(Utilities::URL('img/forum/photos/'.$member->id.'.png'),'Photo',['class'=>'img-responsive photo-sm'])}} 
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