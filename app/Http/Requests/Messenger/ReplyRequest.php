<?php
namespace App\Http\Requests\Messenger;

use App\Http\Requests\Request;

/**
 * Class ReplyRequest
 * @package App\Http\Requests\Messenger
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
