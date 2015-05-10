<?php
namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class SignupRequest
 * @package App\Http\Requests\Auth
 */
class SignupRequest extends FormRequest
{
	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [
			'display_name' => 'required',
			'email'        => 'required|email',
			'password'     => 'required',
			'password2'    => 'required',
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