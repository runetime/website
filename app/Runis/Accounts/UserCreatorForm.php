<?php
namespace App\Runis\Accounts;
use App\Runis\Core\FormModel;
class UserCreatorForm extends FormModel{
    protected $validationRules=[
        'username'=>'required',
        'email'   =>'required|email',
		'password'=>'required'
    ];
}