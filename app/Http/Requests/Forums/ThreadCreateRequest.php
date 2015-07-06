<?php
namespace App\Http\Requests\Forums;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class ThreadCreateRequest
 */
final class ThreadCreateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'title'    => 'required',
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
