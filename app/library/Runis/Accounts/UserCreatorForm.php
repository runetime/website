<?php
namespace Runis\Accounts;
use Runis\Core\FormModel;
class UserCreatorForm extends FormModel{
    protected $validationRules=[
        'username'=>'required',
        'email'   =>'required|email',
		'password'=>'required'
    ];
}