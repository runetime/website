<?php
namespace App\RuneTime\Forum\Subforums;

use App\RuneTime\Core\Entity;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\Thread;
use App\RuneTime\Forum\Threads\ThreadRepository;

/**
 * Class Subforum
 */
class Subforum extends Entity
{
    protected $table = 'forum_subforums';
    protected $with = [];
    protected $fillable = [
        'name',
        'description',
        'roles',
        'posts_enabled',
        'posts_active',
        'thread_count',
        'post_count',
        'last_post',
        'position',
        'parent',
    ];
    protected $dates = [];
    protected $softDelete = true;
    const STATUS_HIDDEN = 0;
    const STATUS_PUBLISHED = 1;
    const THREADS_PER_PAGE = 20;

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function threads()
    {
        return $this->hasMany('App\RuneTime\Forum\Threads\Thread', 'subforum_id');
    }

    /**
     * @return mixed
     */
    public function lastPost()
    {
        if (!$this->cachePosts) {
            $this->cachePosts = with(new PostRepository(new Post))->getByid($this->last_post);
        }

        return $this->cachePosts;
    }

    /**
     * @return bool|mixed
     */
    public function lastThread()
    {
        $post = $this->lastPost();
        if (!$this->cacheThreads) {
            $this->cacheThreads = with(new ThreadRepository(new Thread()))->getById($post->thread[0]->id);
        }

        return $this->cacheThreads;
    }

    /**
     * @return bool
     */
    public function isRead()
    {
        if (\Auth::check()) {
            $lastRead = \Cache::get('user' . \Auth::user()->id . '.subforum#' . $this->id . '.read');
            $lastPost = $this->lastPost();
            if (!empty($lastPost)) {
                if ($lastRead > \Time::getEpoch($this->lastPost()->created_at)) {
                    return true;
                } else {
                    return false;
                }
            } elseif (empty($lastPost)) {
                return true;
            }
        }

        return true;
    }

    /**
     * @return string
     */
    public function toSlug()
    {
        return '/forums/' . \String::slugEncode($this->id, $this->name);
    }

    /**
     * @return bool
     */
    public function canPost()
    {
        if (\Auth::check() && $this->posts_enabled === true) {
            return true;
        }

        return false;
    }

    /**
     * @return bool
     */
    public function canView()
    {
        $good = false;
        $roles = json_decode($this->roles);
        if (\Auth::check()) {
            $userRole = \Auth::user()->importantRole()->id;
        } else {
            $userRole = -1;
        }

        if (!empty($roles)) {
            if (\Auth::check() && in_array($userRole, $roles)) {
                $good = true;
            }
        } else {
            $good = true;
        }

        if ($good) {
            $parent = Subforum::find($this->parent);
            $continue = true;
            while ($continue === true) {
                if (!empty($parent)) {
                    if ($parent->canView()) {
                        $parent = Subforum::find($parent->parent);
                    } else {
                        $good = false;
                        $continue = false;
                    }
                } else {
                    $continue = false;
                }
            }
        }

        return $good;
    }
}
