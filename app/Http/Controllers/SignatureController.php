<?php
namespace App\Http\Controllers;
use App\Http\Requests\SignatureFormRequest;
class SignatureController extends BaseController {
	private $request;

	/**
	 * @param SignatureFormRequest $request
	 */
	public function __construct(SignatureFormRequest $request) {
		$this->request = $request;
	}

	/**
	 * @get("signatures")
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$this->nav('RuneTime');
		$this->title('Signature Generator');
		return $this->view('signatures.index');
	}

	/**
	 * @post("signatures")
	 * @return \Illuminate\View\View
	 */
	public function postUsername() {
		$username = $this->request->input('username');
		$this->bc(['signatures' => 'Signature Generator']);
		$this->nav('RuneTime');
		$this->title('Type of Signature');
		return $this->view('signatures.type', compact('username'));
	}

	/**
	 * @param $username
	 * @param $type
	 * @get("signatures/username={username}/type={type}")
	 * @return \Illuminate\View\View
	 */
	public function getStyle($username, $type) {
		$imgs = [];
		foreach(scandir('./img/signatures/backgrounds') as $filename) {
			$imgs[] = $filename;
		}
		unset($imgs[0]);
		unset($imgs[1]);
		$this->bc(['signatures' => 'Signature Generator', '#1' => $username]);
		$this->nav('RuneTime');
		$this->title('Style of Signature');
		return $this->view('signatures.style', compact('username', 'type', 'imgs'));
	}

	/**
	 * @param $username
	 * @param $type
	 * @param $style
	 * @get("signatures/username={username}/type={type}/style={style}")
	 * @return \Illuminate\View\View
	 */
	public function getFinal($username, $type, $style) {
		$args = [
			'u' => $username,
			't' => $type,
			's' => $style,
		];
		$hash = implode(";", $args);
		$location = 'http://runetime.com/signatures/h' . $hash;
		$this->bc(['signatures' => 'Signature Generator', '#1' => $username, 'signatures/username=' . $username . '/type=' . $type => ucwords($type)]);
		$this->nav('RuneTime');
		$this->title('Finished Signature');
		return $this->view('signatures.final', compact('username', 'hash', 'location'));
	}

	/**
	 *
	 * @get("signatures/h{slug}")
	 * @param $slug
	 */
	public function getDisplay($slug) {
		$info = explode(";", $slug);
		header("Content-type: image/png");
//		$scorest=Utilities::CURL('http://hiscore.runescape.com/index_lite.ws?player='.$username);
		$scores = <<<SCORES
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
		$scores = explode("\n", $scores);
		foreach($scores as $key=>$text)
			$scores[$key] = explode(",", $text);
		$image = $this->signatureStat($info, $scores);
		list($width, $height) = [400, 150];
		// Put down the logo
		$logo = imagescale(imagecreatefrompng('./img/header.png'), 85, 24, IMG_BICUBIC_FIXED);
		list($logoW, $logoH) = getimagesize('./img/header.png');
		imagecopy($image, $logo, $width-($logoW/2), $height-($logoH/2), 0, 0, 85, 21);
		imagepng($image);
		imagedestroy($image);
	}

	/**
	 * @param $info
	 * @param $scores
	 *
	 * @return resource
	 */
	private function signatureStat($info, $scores) {
		$skills = $this->skills();
		$im = imagecreatefrompng('./img/signatures/backgrounds/' . $info[2] . '.png');
		// Resize
		list($width, $height) = getimagesize('./img/signatures/backgrounds/' . $info[2] . '.png');
		$img = imagecreatetruecolor(400, 150);
		imagecopyresized($img, $im, 0, 0, 0, 0, 400, 150, $width, $height);
		imagecopy($img, $skills['attack'], 12, 12, 0, 0, 20, 20);
		imagecopy($img, $skills['defence'], 12, 37, 0, 0, 20, 20);
		imagecopy($img, $skills['strength'], 12, 62, 0, 0, 20, 20);
		imagecopy($img, $skills['constitution'], 12, 88, 0, 0, 20, 20);
		imagecopy($img, $skills['ranged'], 12, 113, 0, 0, 20, 20);
		imagecopy($img, $skills['prayer'], 62, 12, 0, 0, 20, 20);
		imagecopy($img, $skills['magic'], 62, 37, 0, 0, 20, 20);
		imagecopy($img, $skills['cooking'], 62, 62, 0, 0, 20, 20);
		imagecopy($img, $skills['woodcutting'], 62, 87, 0, 0, 20, 20);
		imagecopy($img, $skills['fletching'], 62, 112, 0, 0, 20, 20);
		imagecopy($img, $skills['fishing'], 112, 12, 0, 0, 20, 20);
		imagecopy($img, $skills['firemaking'], 112, 37, 0, 0, 20, 20);
		imagecopy($img, $skills['crafting'], 112, 62, 0, 0, 20, 20);
		imagecopy($img, $skills['smithing'], 112, 87, 0, 0, 20, 20);
		imagecopy($img, $skills['mining'], 112, 112, 0, 0, 20, 20);
		imagecopy($img, $skills['herblore'], 162, 12, 0, 0, 20, 20);
		imagecopy($img, $skills['agility'], 162, 37, 0, 0, 20, 20);
		imagecopy($img, $skills['thieving'], 162, 62, 0, 0, 20, 20);
		imagecopy($img, $skills['slayer'], 162, 87, 0, 0, 20, 20);
		imagecopy($img, $skills['farming'], 162, 112, 0, 0, 20, 20);
		imagecopy($img, $skills['runecrafting'], 212, 12, 0, 0, 20, 20);
		imagecopy($img, $skills['hunter'], 212, 37, 0, 0, 20, 20);
		imagecopy($img, $skills['construction'], 212, 62, 0, 0, 20, 20);
		imagecopy($img, $skills['summoning'], 212, 87, 0, 0, 20, 20);
		imagecopy($img, $skills['dungeoneering'], 212, 112, 0, 0, 20, 20);
		imagecopy($img, $skills['divination'], 262, 12, 0, 0, 20, 20);
		imagecopy($img, $skills['overall'], 262, 37, 0, 0, 20, 20);
		$angle = 0;
		$size = 15;
		$loc = $size+7;
		$color = imagecolorallocate($im, 255, 255, 255);
		$font = './fonts/vendor/open-sans/OpenSans-Light.ttf';
		$h = $size + 3;
		imagettftext($img, $size, $angle, $loc+12, $h+12, $color, $font, $scores[1][1]);
		imagettftext($img, $size, $angle, $loc+12, $h+37, $color, $font, $scores[2][1]);
		imagettftext($img, $size, $angle, $loc+12, $h+62, $color, $font, $scores[3][1]);
		imagettftext($img, $size, $angle, $loc+12, $h+88, $color, $font, $scores[4][1]);
		imagettftext($img, $size, $angle, $loc+12, $h+113, $color, $font, $scores[5][1]);
		imagettftext($img, $size, $angle, $loc+62, $h+12, $color, $font, $scores[6][1]);
		imagettftext($img, $size, $angle, $loc+62, $h+37, $color, $font, $scores[7][1]);
		imagettftext($img, $size, $angle, $loc+62, $h+62, $color, $font, $scores[8][1]);
		imagettftext($img, $size, $angle, $loc+62, $h+87, $color, $font, $scores[9][1]);
		imagettftext($img, $size, $angle, $loc+62, $h+112, $color, $font, $scores[10][1]);
		imagettftext($img, $size, $angle, $loc+112, $h+12, $color, $font, $scores[11][1]);
		imagettftext($img, $size, $angle, $loc+112, $h+37, $color, $font, $scores[12][1]);
		imagettftext($img, $size, $angle, $loc+112, $h+62, $color, $font, $scores[13][1]);
		imagettftext($img, $size, $angle, $loc+112, $h+87, $color, $font, $scores[14][1]);
		imagettftext($img, $size, $angle, $loc+112, $h+112, $color, $font, $scores[15][1]);
		imagettftext($img, $size, $angle, $loc+162, $h+12, $color, $font, $scores[16][1]);
		imagettftext($img, $size, $angle, $loc+162, $h+37, $color, $font, $scores[17][1]);
		imagettftext($img, $size, $angle, $loc+162, $h+62, $color, $font, $scores[18][1]);
		imagettftext($img, $size, $angle, $loc+162, $h+87, $color, $font, $scores[19][1]);
		imagettftext($img, $size, $angle, $loc+162, $h+112, $color, $font, $scores[20][1]);
		imagettftext($img, $size, $angle, $loc+212, $h+12, $color, $font, $scores[21][1]);
		imagettftext($img, $size, $angle, $loc+212, $h+37, $color, $font, $scores[22][1]);
		imagettftext($img, $size, $angle, $loc+212, $h+62, $color, $font, $scores[23][1]);
		imagettftext($img, $size, $angle, $loc+212, $h+87, $color, $font, $scores[24][1]);
		imagettftext($img, $size, $angle, $loc+212, $h+112, $color, $font, $scores[25][1]);
		imagettftext($img, $size, $angle, $loc+262, $h+12, $color, $font, $scores[26][1]);
		imagettftext($img, $size, $angle, $loc+262, $h+37, $color, $font, $scores[0][1]);
		imagettftext($img, $size, $angle, 262, $h+62, $color, $font, $info[0]);
		return $img;
	}

	/**
	 * @return array
	 */
	private function skills() {
		$skills = [];
		$skills['attack'] = 'attack';
		$skills['defence'] = 'defence';
		$skills['strength'] = 'strength';
		$skills['constitution'] = 'constitution';
		$skills['ranged'] = 'ranged';
		$skills['prayer'] = 'prayer';
		$skills['magic'] = 'magic';
		$skills['cooking'] = 'cooking';
		$skills['woodcutting'] = 'woodcutting';
		$skills['fletching'] = 'fletching';
		$skills['fishing'] = 'fishing';
		$skills['firemaking'] = 'firemaking';
		$skills['crafting'] = 'crafting';
		$skills['smithing'] = 'smithing';
		$skills['mining'] = 'mining';
		$skills['herblore'] = 'herblore';
		$skills['agility'] = 'agility';
		$skills['thieving'] = 'thieving';
		$skills['slayer'] = 'slayer';
		$skills['farming'] = 'farming';
		$skills['runecrafting'] = 'runecrafting';
		$skills['hunter'] = 'hunter';
		$skills['construction'] = 'construction';
		$skills['summoning'] = 'summoning';
		$skills['dungeoneering'] = 'dungeoneering';
		$skills['divination'] = 'divination';
		$skills['overall'] = 'overall';
		list($width, $height) = [20, 20];
		foreach($skills as $name=>$dir)
			$skills[$name] = imagescale(imagecreatefrompng('./img/skills/' . $dir . '.png'), $width, $height, IMG_BICUBIC_FIXED);
		return $skills;
	}
}