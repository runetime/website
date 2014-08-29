<?php
namespace RT\Awards;
use RT\Core\Entity;
class Award extends Entity{
	protected $table     ='news';
	protected $with      =['author'];
	protected $fillable  =['author_id','title','contents','status','published_at'];
	protected $dates     =['published_at'];
	protected $softDelete=true;
	public $presenter='RT\Awards\AwardPresenter';
	const STATUS_UNAVAILABLE=0;
	const STATUS_AVAILABLE  =1;
	protected $validationRules=[
		'author_id'=>'required|exists:users,id',
		'title'    =>'required',
		'content'  =>'required',
		'status'   =>'required'
	];
}
