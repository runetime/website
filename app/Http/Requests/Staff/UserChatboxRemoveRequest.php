<?php
namespace App\Http\Requests\Staff;

use App\Http\Requests\Request;

/**
 * Class UserChatboxRemoveRequest
 */
final class UserChatboxRemoveRequest extends Request
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'username' => 'required',
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
