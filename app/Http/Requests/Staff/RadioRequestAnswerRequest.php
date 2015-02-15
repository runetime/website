<?php
namespace App\Http\Requests\Staff;

use App\Http\Requests\Request;

/**
 * Class RadioRequestAnswerRequest
 * @package App\Http\Requests\Staff
 */
class RadioRequestAnswerRequest extends Request
{

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [
			'id'     => 'required',
			'status' => 'required',
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
