<?php
namespace App\Http\Requests\Statuses;

use App\Http\Requests\Request;

/**
 * Class StatusCreateRequest
 * @package App\Http\Requests\Statuses
 */
class StatusCreateRequest extends Request
{

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
