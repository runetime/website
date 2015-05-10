<?php
namespace App\RuneTime\Forum\Threads;

use App\RuneTime\Core\Entity;

/**
 * Class Vote
 */
class Vote extends Entity
{
    protected $table = 'forum_votes';
    protected $with = [];
    protected $fillable = [
        'author_id',
        'post_id',
        'status',
    ];
    protected $dates = [];
    protected $softDelete = false;
    const STATUS_DOWN = 0;
    const STATUS_NEUTRAL = 1;
    const STATUS_UP = 2;

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function post()
    {
        return $this->belongsTo('App\RuneTime\Forum\Threads\Post', 'post_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function author()
    {
        return $this->belongsTo('App\RuneTime\Accounts\User', 'author_id');
    }
}
