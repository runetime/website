<?php
namespace App\Http\Requests;
use Response;
use Illuminate\Foundation\Http\FormRequest;
class SignatureFormRequest extends FormRequest{
	public function rules(){
		return [
			
		];
	}
	public function authorize(){
		return true;
	}
}