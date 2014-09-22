<?php
namespace RT\Chat;
use Runis\Core\Entity;
class Action extends Entity{
	protected $table='chat_actions';
	protected $fillable=['author_id','action','message_id'];
	protected $dates=[];
	protected $softDelete=true;
	public $presenter='RT\Chat\ChatPresenter';
	const STATUS_HIDDEN=0;
	const STATUS_PUBLISHED=1;
	protected $validationRules=[
		'author_id'=>'required|exists:users,id',
		'action'=>'integer',
		'message_id'=>'integer'
	];
	public function author(){
		return $this->belongsTo('RT\Accounts\User','author_id');
	}
}