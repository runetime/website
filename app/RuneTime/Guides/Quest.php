<?php
namespace App\RuneTime\Guides;
use App\Runis\Core\Entity;
class Quest extends Entity{
	protected $table='guides_quests';
	protected $fillable=['name','author_id','editors','difficulty','length','qp','membership','completed','description','quest_requirements','skill_requirements','items_required','items_recommended','rewards','starting_points','contents'];
	protected $dates=[];
	protected $softDelete=true;
	public $presenter='RT\Guides\QuestPresenter';
	const STATUS_HIDDEN=0;
	const STATUS_PUBLISHED=1;
	protected $validationRules=[
		'name'=>'required',
		'author_id'=>'required|exists:users,id',
		'editors'=>'required',
		'difficulty'=>'integer',
		'length'=>'integer',
		'qp'=>'integer',
		'membership'=>'integer',
		'completed'=>'integer',
		'description'=>'required',
		'quest_requirements'=>'required',
		'skill_requirements'=>'required',
		'items_required'=>'required',
		'items_recommended'=>'required',
		'rewards'=>'required',
		'starting_points'=>'required',
		'contents'=>'required'
	];
	public function author(){
		return $this->belongsTo('RT\Accounts\User','author_id');
	}
}