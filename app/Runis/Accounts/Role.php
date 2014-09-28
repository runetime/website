<?php
namespace App\Runis\Accounts;
use App\Runis\Core\Entity;
class Role extends Entity{
	protected $table='roles';
	protected $fillable=['name','name_trim','class'];
	protected $validationRules=[
		'name'     =>'required',
		'name_trim'=>'required',
		'class'    =>'required'
	];
	public function users(){
		$this->belongsToMany('Runis\Accounts\User');
	}
}