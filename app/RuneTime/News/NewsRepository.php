<?php
namespace App\RuneTime\News;

use App\RuneTime\Core\EloquentRepository;

class NewsRepository extends EloquentRepository
{
	/**
	 * @param News $model
	 */
	public function __construct(News $model)
	{
		$this->model = $model;
	}

	/**
	 * @param int $count
	 *
	 * @return mixed
	 */
	public function getRecentNews($count = 5)
	{
		return $this->model->
			where('status', '=', News::STATUS_PUBLISHED)->
			orderBy('created_at', 'desc')->
			take($count)->
			get();
	}

	/**
	 * @param int $count
	 *
	 * @return mixed
	 */
	public function getRecentCanView($count = 5)
	{
		$q = $this->model;
		if(!\Auth::check() || !(\Auth::check() && \Auth::user()->isCommunity())) {
			$q = $q->where('status', '=', News::STATUS_PUBLISHED);
		}

		return $q->
			orderBy('created_at', 'desc')->
			take($count)->
			get();
	}
}