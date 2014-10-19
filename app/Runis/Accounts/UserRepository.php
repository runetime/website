<?php
namespace App\Runis\Accounts;
use App\Runis\Core\EloquentRepository;
use App\Runis\Core\Exceptions\EntityNotFoundException;
class UserRepository extends EloquentRepository{
	/**
	 * @param User $model
	 */
	public function __construct(User $model){
		$this->model=$model;
	}

	/**
	 * @return mixed
	 */
	public function getTotal(){
		return $this->model->count();
	}

	/**
	 * @param $name
	 *
	 * @return mixed
	 * @throws EntityNotFoundException
	 */
	public function requireByName($name){
		$model=$this->getByName($name);
		if(!$model){
			throw new EntityNotFoundException("User with name ".$name." could not be found");
		}
		return $model;
	}

	/**
	 * @param $name
	 *
	 * @return mixed
	 */
	public function getByName($name){
		return $this->model->where('name','=',$name)->
			first();
	}

	/**
	 * @param $count
	 *
	 * @return mixed
	 */
	public function getFirstX($count){
		return $this->model->
			take($count)->
			get();
	}

	/**
	 * @param $from
	 * @param $to
	 *
	 * @return mixed
	 */
	public function getX($from,$to){
		return $this->model->
			take($to)->
			skip($from)->
			get();
	}

	/**
	 * @param        $id
	 * @param string $op
	 * @param string $order
	 *
	 * @return mixed
	 */
	public function getByRole($id,$op='=',$order='desc'){
		return $this->model->
			where('role',$op,$id)->
			orderBy('id',$order)->
			get();
	}

	/**
	 * @param $username
	 *
	 * @return mixed
	 */
	public function getByUsername($username){
		return $this->model->
			where('username','=',$username)->
			first();
	}

	/**
	 * @param $displayName
	 *
	 * @return mixed
	 */
	public function getByDisplayName($displayName){
		return $this->model->
			where('display_name','=',$displayName)->
			first();
	}

	/**
	 * @param $email
	 *
	 * @return mixed
	 */
	public function getByEmail($email){
		return $this->model->
			where('email','=',$email)->
			first();
	}

	/**
	 * @param array $selections
	 *
	 * @return mixed
	 */
	public function selectArray(array $selections){
		$q=$this->model;
		foreach($selections as $key=>$selection)
			$q=$q->where($key,$selection['op'],$selection['val']);
		return $q->get();
	}

	/**
	 * @return mixed
	 */
	public function getLatest() {
		return $this->model->
			orderBy('id', 'desc')->
			first();
	}
}