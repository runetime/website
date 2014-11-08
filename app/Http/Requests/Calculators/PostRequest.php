<?php namespace App\Http\Requests\Calculators;

use App\Http\Requests\Request;
/**
 * Class PostRequest
 * @package App\Http\Requests\Calculators
 */
class PostRequest extends Request {

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [
			'id' => 'required',
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
