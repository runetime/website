<?php
namespace App\RuneTime\Accounts;

use App\RuneTime\Core\Entity;

/**
 * Class Reset
 * @package App\RuneTime\Accounts
 */
class Reset extends Entity
{
	protected $table = 'password_resets';
	protected $with = [];
	protected $fillable = ['email', 'token'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_INVISIBLE = 0;
	const STATUS_VISIBLE = 1;
}