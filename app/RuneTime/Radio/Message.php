<?php
namespace App\RuneTime\Radio;
use App\Runis\Core\Entity;
/**
 * Class Message
 * @package App\RuneTime\Radio
 */
class Message extends Entity{
	protected $table = 'radio_messages';
	protected $with = [];
	protected $fillable = ['author_id', 'contents', 'contents_parsed'];
	protected $dates = [];
	protected $softDelete = true;
}