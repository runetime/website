<?php
namespace App\RuneTime\Statuses;
use App\Runis\Core\Entity;
class Status extends Entity{
	protected $table='statuses';
	protected $fillable=['author_id','contents','comment_amount','published_at','status'];
	protected $dates=['published_at'];
	protected $softDelete=true;
	public $presenter='RT\Statuses\StatusPresenter';
	const STATUS_HIDDEN=0;
	const STATUS_PUBLISHED=1;
	protected $validationRules=[
		'author_id'=>'required|exists:users,id',
		'contents'=>'required'
	];
	public function author(){
		return $this->belongsTo('RT\Accounts\User','author_id');
	}
	public function comments(){
		return $this->morphMany('RT\Comments\Comment','owner');
	}
}