<?php
namespace App\Http\Requests\Staff;

use App\Http\Requests\Request;

/**
 * Class CheckupRequest
 * @package App\Http\Requests\Staff
 */
class CheckupRequest extends Request
{

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [
			'active'       => 'required',
			'hours_active' => 'required',
			'team'         => 'required',
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
