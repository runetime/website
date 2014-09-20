<?php
class SignatureController extends BaseController{
	public function getIndex(){
		$this->nav('RuneTime');
		$this->title('Signature Generator');
		$this->view('signatures.index');
	}
	public function postUsername(){
		$username=Input::get('username');
		$this->bc(['signatures'=>'Signature Generator']);
		$this->nav('RuneTime');
		$this->title('Type of Signature');
		$this->view('signatures.type',compact('username'));
	}
	public function getStyle($username,$type){
		$imgs=[];
		foreach(scandir('./img/signatures/backgrounds') as $filename){
			$imgs[]=$filename;
		}
		unset($imgs[0]);
		unset($imgs[1]);
		$this->bc(['signatures'=>'Signature Generator','#1'=>$username]);
		$this->nav('RuneTime');
		$this->title('Style of Signature');
		$this->view('signatures.style',compact('username','type','imgs'));
	}
	public function getFinal($username,$type,$style){
		$imgSrc="/signatures/username=".$username."/type=".$type."/style=".$style."/display";
		$this->bc(['signatures'=>'Signature Generator','#1'=>$username,'signatures/username='.$username.'/type='.$type=>ucwords($type)]);
		$this->nav('RuneTime');
		$this->title('Finished Signature');
		$this->view('signatures.final',compact('username','type','style','imgSrc'));
	}
	public function getDisplay($username,$type,$style){
//		header("Content-type: image/png");
		$string="test";
		$im=imagecreatefrompng('./img/signatures/backgrounds/'.$style.'.png');

		// Resize
		list($width,$height)=getimagesize('./img/signatures/backgrounds/'.$style.'.png');
		$img=imagecreatetruecolor(400,150);
		imagecopyresized($img,$im,0,0,0,0,400,150,$width,$height);
		
		// RSName
//		$scorest=Utilities::CURL('http://hiscore.runescape.com/index_lite.ws?player='.$username);
		$scores=<<<SCORES
412417,1598,27881258
524694,75,1237847
663711,66,502352
792251,64,414028
698139,69,713063
747710,54,154546
501058,55,178534
644601,65,467900
558870,66,537428
138087,99,13095060
249730,84,3042572
292747,79,1850771
393916,73,1041914
374181,63,388488
213783,74,1098606
508561,63,400159
388685,54,153138
376153,59,260494
366738,58,231525
538759,47,77064
429247,42,47959
556012,47,82234
402324,57,203344
150269,76,1353903
359703,59,249606
442014,49,98723
-1,1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
-1,-1
SCORES;
		$scores=explode("\n",$scores);
		$total=explode(",",$scores[0]);
		$skills=[];
		$minigames=[];
		for($x=1;$x<27;$x++){
			$skills[].=$scores[$x];
		}
		for($x=1;$x>=27;$x++){
			$minigames[].=$scores[$x];
		}
//		imagepng($img);
//		imagedestroy($img);
//		return $im;
		return var_dump($scores);
	}
}