<?php
namespace App\RuneTime\Chat;

use App\RuneTime\Core\Entity;

class Filter extends Entity
{
	protected $table = 'chat_filters';
	protected $fillable = ['text'];
	protected $dates = [];
	protected $softDelete = true;
}