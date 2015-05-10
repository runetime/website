<?php
namespace App\RuneTime\News;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class NewsRepository
 * @package App\RuneTime\News
 */
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

	/**
	 * @param $amount
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getXSkipFrom($amount, $id) {
		return $this->model->
			where('id', '>=', ($id - $amount))->
			take(($amount * 2) + 1)->
			get();
	}

	/**
	 * @param     $name
	 * @param int $amount
	 *
	 * @return mixed
	 */
	public function getLikeName($name, $amount = 5)
	{
		return $this->model->
			where('title', '=', $name)->
			orWhere('title', 'LIKE', '%' . $name)->
			orWhere('title', 'LIKE', '%' . $name . '%')->
			orWhere('title', 'LIKE', '%' . $name)->
			take($amount)->
			get();
	}
}