<?php
use RT\Guides\QuestRepository;
class GuideController extends BaseController{
	private $quests;
	public function __construct(QuestRepository $quests){
		$this->quests=$quests;
	}
	public function getIndex(){
		$this->nav('Runescape');
	}
	public function getType($type,$searchDifficulty=0,$searchLength=0,$searchMembership=0){
		$difficulties=$this->quests->getOptions('difficulty');
		$lengths=$this->quests->getOptions('length');
		$memberships=$this->quests->getOptions('membership');
		$guides=$this->quests->getAll();
		$paginate=Paginator::make((array)$guides,count($guides),20);
		$this->bc(['guides'=>'Guides']);
		$this->nav('Runescape');
		$this->title('Quest Guides');
		$this->view('guides.quests.index',compact('difficulties','lengths','memberships','guides','searchDifficulty','searchLength','searchMembership'));
	}
	public function getViewGuide($type,$id,$name){
		$guide=$this->quests->getById($id);
		$guide=new stdClass;
		$guide->name='All Fired Up';
		$guide->author_id=20;
		$guide->editors=json_encode([21]);
		$guide->difficulty=7;
		$guide->length=2;
		$guide->qp=1;
		$guide->membership=1;
		$guide->completed=1;
		$guide->description='Test description';
		$guide->quest_requirements=json_encode([
			0=>[
				'id'=>11,
				'name'=>'Priest in Peril'
			]
		]);
		$guide->skill_requirements=json_encode([
			'Firemaking'=>43
		]);
		$guide->items_required=json_encode([
			0=>[
				'id'=>-1,
				'description'=>'logs of any kind (but must be the same kind)',
				'amount'=>50
			]
		]);
		$guide->items_recommended=json_encode([
			0=>[
				'id'=>-1,
				'description'=>'Explorer\'s ring',
				'amount'=>1
			],
			1=>[
				'id'=>-1,
				'description'=>'Varrock lodestone unlocked',
				'amount'=>1
			]
		]);
		$guide->rewards=json_encode([
			0=>[
				'id'=>-1,
				'description'=>'coins',
				'amount'=>'20000'
			],
			1=>[
				'id'=>-1,
				'description'=>'Access to the All Fired Up mini-game',
				'amount'=>0
			],
			2=>[
				'id'=>-1,
				'description'=>'Treasure hunter keys',
				'amount'=>2
			]
		]);
		$guide->starting_point="To start the quest, you need to talk King Roald. He is located in the throne room in Varrock Palace. The throne room is located on the ground floor (1st floor) in the south-eastern part of the palace.<br />
The king will ask you to help with the testing of the beacon network which has been put in place to warn off any attacks on misthalin. Agree and he will tell you to talk to a blaze sharpeye.";
		$guide->contents=[
			1=>'test 1',
			2=>'test 2'
		];
		$guide->created_at='2014-09-18 22:26:14';
		$guide->updated_at='2014-09-18 23:31:31';
		$difficulty=$this->quests->getOptionById($guide->difficulty);
		$length=$this->quests->getOptionById($guide->length);
		if($guide){
			$this->bc(['guides'=>'Guides','guides/quests'=>'Quests']);
			$this->nav('Runescape');
			$this->title($guide->name);
			$this->view('guides.quests.view',compact('guide','difficulty','length'));
		}
		else{
			return App::abort(404);
		}
	}
	public function getSearch(){

	}
}