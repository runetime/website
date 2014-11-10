<?php
namespace App\RuneTime\Radio;
use App\Runis\Core\Entity;
class Request extends Entity{
	protected $table = 'radio_requests';
	protected $with = [];
	protected $fillable = ['song_artist', 'song_name', 'requester', 'tiem_sent', 'ip_address', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_NEUTRAL = 0;
	const STATUS_ACCEPTED = 1;
	const STATUS_REJECTED = 2;
}