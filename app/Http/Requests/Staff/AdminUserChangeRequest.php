<?php namespace App\Http\Requests\Staff;

use App\Http\Requests\Request;
/**
 * Class AdminUserChangeRequest
 * @package App\Http\Requests
 */
class AdminUserChangeRequest extends Request {

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [
			'id'    => 'required',
			'field' => 'required',
			'value' => 'required',
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
