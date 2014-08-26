<?php
namespace RT\News;
use RT\Core\Entity;
class News extends Entity{
	protected $table     ='news';
	protected $with      =['author'];
	protected $fillable  =['author_id','title','contents','status','published_at'];
	protected $dates     =['published_at'];
	protected $softDelete=true;

	public $presenter='RT\News\NewsPresenter';

	const STATUS_HIDDEN   =0;
	const STATUS_PUBLISHED=1;

	protected $validationRules=[
		'author_id'=>'required|exists:users,id',
		'title'    =>'required',
		'content'  =>'required',
		'status'   =>'required'
	];
	public function author(){
		return $this->belongsTo('RT\Accounts\User','author_id');
	}
	public function tags(){
		return $this->belongsToMany('RT\Tags\Tag','article_tag','article_id','tag_id');
	}
	public function comments(){
		return $this->morphMany('RT\Comments\Comment','owner');
	}
}