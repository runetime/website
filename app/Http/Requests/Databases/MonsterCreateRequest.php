<?php
namespace App\Http\Requests\Databases;

use App\Http\Requests\Request;

class MonsterCreateRequest extends Request {

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [
			'name'              => 'required',
			'examine'           => 'required',
			'stats'             => 'required',
			'location'          => 'required',
			'drops'             => 'required',
			'membership'        => 'required',
			'other_information' => 'required',
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
