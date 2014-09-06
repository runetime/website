						<tr>
							<td>
								{{HTML::image(Utilities::URL('img/forum/photos/'.$staff->id.'.png'),'Photo',['class'=>'img-responsive photo-sm'])}} 
							</td>
							<td>
								{{$staff->display_name}} 
							</td>
							<td>
								{{$staff->title}} 
							</td>
							<td>
								{{Time::short($staff->created_at)}} 
							</td>
						</tr>