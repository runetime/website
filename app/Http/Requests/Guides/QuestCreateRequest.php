<?php
namespace App\Http\Requests\Guides;

use App\Http\Requests\Request;

/**
 * Class QuestCreateRequest
 * @package App\Http\Requests\Guides
 */
class QuestCreateRequest extends Request
{

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [
			'name'               => 'required',
			'difficulty'         => 'required',
			'length'             => 'required',
			'membership'         => 'required',
			'qp'                 => 'required',
			'completed'          => 'required',
			'description'        => 'required',
			'quest_requirements' => 'required',
			'skill_requirements' => 'required',
			'items_required'     => 'required',
			'items_recommended'  => 'required',
			'reward'             => 'required',
			'starting_point'     => 'required',
			'contents'           => 'required',
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
