<?php
namespace App\Runis\Accounts;
use App\Runis\Core\Entity;
class Reset extends Entity {
	protected $table = 'password_resets';
	protected $with = [];
	protected $fillable = ['email', 'token'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_INVISIBLE = 0;
	const STATUS_VISIBLE = 1;
}