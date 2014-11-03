<?php
namespace App\RuneTime\Radio;
use App\Runis\Core\Entity;
/**
 * Class History
 * @package App\RuneTime\Radio
 */
class History extends Entity{
	protected $table = 'radio_history';
	protected $with = [];
	protected $fillable = ['user_id', 'artist', 'song'];
	protected $dates = [];
	protected $softDelete = true;
}