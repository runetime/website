<?php
namespace App\Http\Requests\Signatures;

use Illuminate\Foundation\Http\FormRequest;

class RSNRequest extends FormRequest{
	public function rules(){
		return [
			
		];
	}
	public function authorize(){
		return true;
	}
}