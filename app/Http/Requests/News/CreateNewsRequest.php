<?php
namespace App\Http\Requests\News;

use App\Http\Requests\Request;

/**
 * Class CreateNewsRequest
 * @package App\Http\Requests\News
 */
class CreateNewsRequest extends Request
{

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [
			//
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
