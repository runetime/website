<?php
namespace App\RuneTime\Radio;
use App\Runis\Core\Entity;
/**
 * Class Session
 * @package App\RuneTime\Radio
 */
class Session extends Entity{
	protected $table = 'radio_requests';
	protected $with = [];
	protected $fillable = ['dj_id', 'message_id', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_DONE = 0;
	const STATUS_PLAYING = 1;
}