<?php
namespace App\Http\Requests\Databases;

use App\Http\Requests\Request;

/**
 * Class ItemCreateRequest
 * @package App\Http\Requests\Databases
 */
class ItemCreateRequest extends Request
{

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [
			'name'        => 'required',
			'examine'     => 'required',
			'description' => 'required',
			'membership'  => 'required',
			'tradable'    => 'required',
			'quest_item'  => 'required',
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
