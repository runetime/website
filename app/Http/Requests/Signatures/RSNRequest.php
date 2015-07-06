<?php
namespace App\Http\Requests\Signatures;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class RSNRequest
 */
final class RSNRequest extends FormRequest
{
    /**
     * @return array
     */
    public function rules()
    {
        return [

        ];
    }

    /**
     * @return bool
     */
    public function authorize()
    {
        return true;
    }
}
