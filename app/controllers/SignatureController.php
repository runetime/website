<?php
class SignatureController extends BaseController{
	public function getIndex(){
		$this->title('Signature Generator');
		$this->view('signatures.index');
	}
	public function postUsername(){
		$username=Input::get('username');
		$this->title('Signature Generator - Type');
		$this->view('signatures.type',compact('username'));
	}
	public function getStyle($username,$type){
		$imgs=[];
		foreach(scandir('./img/signatures/backgrounds') as $filename){
			$imgs[]=$filename;
		}
		unset($imgs[0]);
		unset($imgs[1]);
		$this->title('Signature Generator - Style');
		$this->view('signatures.style',compact('username','type','imgs'));
	}
	public function getFinal($username,$type,$style){
		$imgSrc="/signatures/username=".$username."/type=".$type."/style=".$style."/display";
		$this->title('Signature Generator - Done');
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
		$scores=Utilities::CURL('http://hiscore.runescape.com/index_lite.ws?player='.$username);
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
		return var_dump($minigames);
	}
}