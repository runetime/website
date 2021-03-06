<?php
namespace App\Http\Requests\Auth;

use App\Http\Requests\Request;

/**
 * Class PasswordResetRequest
 */
final class PasswordResetRequest extends Request
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'token'                 => '',
            'email'                 => '',
            'password'              => '',
            'password_confirmation' => '',
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
