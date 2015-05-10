<?php
namespace App\RuneTime\Forum\Polls;

use App\RuneTime\Core\Entity;

/**
 * Class Question
 */
class Question extends Entity
{
    protected $table = 'forum_poll_questions';
    protected $with = [];
    protected $fillable = [
        'poll_id',
        'contents',
        'votes',
    ];
    protected $dates = [];
    protected $softDelete = true;

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function poll()
    {
        return $this->belongsTo('App\RuneTime\Forum\Polls\Poll', 'poll_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function answers()
    {
        return $this->hasMany('App\RuneTime\Forum\Polls\Answer');
    }
}
