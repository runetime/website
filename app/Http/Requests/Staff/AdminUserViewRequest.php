<?php
namespace App\Http\Requests\Staff;

use App\Http\Requests\Request;

/**
 * Class AdminUserViewRequest
 * @package App\Http\Requests\Staff
 */
class AdminUserViewRequest extends Request
{

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [
			'important' => 'required',
			'role'      => 'required',
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
