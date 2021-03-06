<?php
namespace App\Http\Requests\Calculators;

use App\Http\Requests\Request;

/**
 * Class CombatLoadRequest
 */
final class CombatLoadRequest extends Request
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'rsn' => 'required',
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
