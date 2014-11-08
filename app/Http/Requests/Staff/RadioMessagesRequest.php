<?php namespace App\Http\Requests\Staff;

use App\Http\Requests\Request;
/**
 * Class StaffMessagesRequest
 * @package App\Http\Requests\Staff
 */
class StaffMessagesRequest extends Request {

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [
			'contents' => 'required',
		];
	}

	/**
	 * Determine if the user is authorized to make this request.
	 *
	 * @return bool
	 */
	public function authorize()
	{
		return true;
	}

}
