<?php
namespace App\RuneTime\Guides;
use App\Runis\Core\Entity;
class Quest extends Entity{
	protected $table = 'guides_quests';
	protected $fillable = ['name', 'author_id', 'editors', 'difficulty', 'length', 'qp', 'membership', 'completed', 'description', 'quest_requirements', 'skill_requirements', 'items_required', 'items_recommended', 'rewards', 'starting_points', 'contents'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_HIDDEN = 0;
	const STATUS_PUBLISHED = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author(){
		return $this->belongsTo('RT\Accounts\User', 'author_id');
	}
}