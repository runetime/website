<?php
namespace App\RuneTime\Chat;
use App\Runis\Core\Entity;
class Channel extends Entity{
	protected $table = 'chat_channels';
	protected $fillable = ['name','name_trim','messages'];
	protected $dates = [];
	protected $softDelete = false;
	const PER_PAGE = 20;
	const STATUS_INVISIBLE = 0;
	const STATUS_VISIBLE = 1;
}