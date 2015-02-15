<?php
namespace App\Http\Requests\News;

use App\Http\Requests\Request;

/**
 * Class ReplyRequest
 * @package App\Http\Requests\News
 */
class ReplyRequest extends Request
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
