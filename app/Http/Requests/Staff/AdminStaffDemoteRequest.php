<?php
namespace App\Http\Requests\Staff;

use App\Http\Requests\Request;

/**
 * Class AdminStaffDemoteRequest
 */
final class AdminStaffDemoteRequest extends Request
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
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
