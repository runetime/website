<?php
namespace App\Http\Controllers;

use App\Http\Requests\Signatures\RSNRequest;

/**
 * Class SignatureController
 * @package App\Http\Controllers
 */
class SignatureController extends Controller
{
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->nav('navbar.runetime.title');
		$this->title('signature.title');
		return $this->view('signatures.index');
	}

	/**
	 * @param RSNRequest $form
	 *
	 * @return \Illuminate\View\View
	 */
	public function postUsername(RSNRequest $form)
	{
		$username = $form->username;
		$cache = \Cache::get('hiscores.' . $username);
		if(empty($cache)) {
			\String::getHiscore($username);
		}

		$this->bc(['signatures' => trans('signature.title')]);
		$this->nav('navbar.runetime.title');
		$this->title('signature.type.title');
		return $this->view('signatures.type', compact('username'));
	}

	/**
	 * @param $username
	 * @param $type
	 *
	 * @return \Illuminate\View\View
	 */
	public function getStyle($username, $type)
	{
		$imgs = [];
		foreach(scandir('./img/signatures/backgrounds') as $filename) {
			$imgs[] = $filename;
		}

		// Unset . and .. directories
		unset($imgs[0], $imgs[1]);

		$this->bc(['signatures' => trans('signature.title'), '#1' => $username]);
		$this->nav('navbar.runetime.title');
		$this->title('signature.style.title');
		return $this->view('signatures.style', compact('username', 'type', 'imgs'));
	}

	/**
	 * @param $username
	 * @param $type
	 * @param $style
	 *
	 * @return \Illuminate\View\View
	 */
	public function getFinal($username, $type, $style)
	{
		$args = [
			'u' => $username,
			't' => $type,
			's' => $style,
		];
		$hash = implode(";", $args);
		$location = url('signatures/h' . $hash);

		$this->bc(['signatures' => trans('signature.title'), '#1' => $username, 'signatures/username=' . $username . '/type=' . $type => ucwords($type)]);
		$this->nav('navbar.runetime.title');
		$this->title('signature.final.title');
		return $this->view('signatures.final', compact('username', 'hash', 'location'));
	}

	/**
	 * @param $slug
	 */
	public function getDisplay($slug)
	{
		$path = './img/signatures/generated/' . $slug . '.png';
		if(file_exists($path)) {
			return \Img::make($path)->response();
		} else {
			$this->createSignature($slug);
			$image = \Img::make($path);
			return $image->response();
		}
	}

	/**
	 * @param $slug
	 */
	public function createSignature($slug)
	{
		$path = public_path('img/signatures/generated/' . $slug . '.png');
		$info = explode(";", $slug);
		$rsn = $info[0];
		$scores = \String::getHiscore($rsn);
		$image = $this->signatureStat($info, $scores);
		$logo = \Img::make(public_path('img/header.png'))->resize(85, 24);
		$image->insert($logo, 'bottom-right');
		$image->save($path);
	}

	/**
	 * @param $info
	 * @param $scores
	 *
	 * @return resource
	 */
	private function signatureStat($info, $scores)
	{
		$skills = $this->skills();
		$img = \Img::canvas(400, 150);
		$bg = \Img::make(public_path('img/signatures/backgrounds/' . $info[2] . '.png'));
		$bg->resize(400, 150);
		$img->insert($bg, 'top-left', 0, 0);
		$img->insert($skills['attack'], 'top-left', 12, 12);
		$img->insert($skills['defence'], 'top-left', 12, 37);
		$img->insert($skills['strength'], 'top-left', 12, 62);
		$img->insert($skills['constitution'], 'top-left', 12, 88);
		$img->insert($skills['ranged'], 'top-left', 12, 113);
		$img->insert($skills['prayer'], 'top-left', 62, 12);
		$img->insert($skills['magic'], 'top-left', 62, 37);
		$img->insert($skills['cooking'], 'top-left', 62, 62);
		$img->insert($skills['woodcutting'], 'top-left', 62, 87);
		$img->insert($skills['fletching'], 'top-left', 62, 112);
		$img->insert($skills['fishing'], 'top-left', 112, 12);
		$img->insert($skills['firemaking'], 'top-left', 112, 37);
		$img->insert($skills['crafting'], 'top-left', 112, 62);
		$img->insert($skills['smithing'], 'top-left', 112, 87);
		$img->insert($skills['mining'], 'top-left', 112, 112);
		$img->insert($skills['herblore'], 'top-left', 162, 12);
		$img->insert($skills['agility'], 'top-left', 162, 37);
		$img->insert($skills['thieving'], 'top-left', 162, 62);
		$img->insert($skills['slayer'], 'top-left', 162, 87);
		$img->insert($skills['farming'], 'top-left', 162, 112);
		$img->insert($skills['runecrafting'], 'top-left', 212, 12);
		$img->insert($skills['hunter'], 'top-left', 212, 37);
		$img->insert($skills['construction'], 'top-left', 212, 62);
		$img->insert($skills['summoning'], 'top-left', 212, 87);
		$img->insert($skills['dungeoneering'], 'top-left', 212, 112);
		$img->insert($skills['divination'], 'top-left', 262, 12);
		$img->insert($skills['overall'], 'top-left', 262, 37);
		$size = 15;
		$loc = $size + 7;
		$h = $size - 12;
		$img->text($scores[1][1], $loc + 12, $h + 12, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[2][1], $loc + 12, $h + 37, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[3][1], $loc + 12, $h + 62, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[4][1], $loc + 12, $h + 87, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[5][1], $loc + 12, $h + 113, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[6][1], $loc + 62, $h + 12, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[7][1], $loc + 62, $h + 37, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[8][1], $loc + 62, $h + 62, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[9][1], $loc + 62, $h + 87, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[10][1], $loc + 62, $h + 113, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[11][1], $loc + 112, $h + 12, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[12][1], $loc + 112, $h + 37, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[13][1], $loc + 112, $h + 62, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[14][1], $loc + 112, $h + 87, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[15][1], $loc + 112, $h + 113, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[16][1], $loc + 162, $h + 12, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[17][1], $loc + 162, $h + 37, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[18][1], $loc + 162, $h + 62, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[19][1], $loc + 162, $h + 87, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[20][1], $loc + 162, $h + 113, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[21][1], $loc + 212, $h + 12, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[22][1], $loc + 212, $h + 37, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[23][1], $loc + 212, $h + 62, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[24][1], $loc + 212, $h + 87, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[25][1], $loc + 212, $h + 113, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[26][1], $loc + 262, $h + 12, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($scores[0][1], $loc + 262, $h + 37, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		$img->text($info[0], 262, $h + 62, function($font) {
			$font->angle(0);
			$font->color('#ffffff');
			$font->file(public_path('fonts/vendor/open-sans/OpenSans-Light.ttf'));
			$font->size(18);
			$font->valign('top');
		});
		return $img;
	}

	/**
	 * @return array
	 */
	private function skills()
	{
		$skills = [
			'attack'        => 'attack',
			'defence'       => 'defence',
			'strength'      => 'strength',
			'constitution'  => 'constitution',
			'ranged'        => 'ranged',
			'prayer'        => 'prayer',
			'magic'         => 'magic',
			'cooking'       => 'cooking',
			'woodcutting'   => 'woodcutting',
			'fletching'     => 'fletching',
			'fishing'       => 'fishing',
			'firemaking'    => 'firemaking',
			'crafting'      => 'crafting',
			'smithing'      => 'smithing',
			'mining'        => 'mining',
			'herblore'      => 'herblore',
			'agility'       => 'agility',
			'thieving'      => 'thieving',
			'slayer'        => 'slayer',
			'farming'       => 'farming',
			'runecrafting'  => 'runecrafting',
			'hunter'        => 'hunter',
			'construction'  => 'construction',
			'summoning'     => 'summoning',
			'dungeoneering' => 'dungeoneering',
			'divination'    => 'divination',
			'overall'       => 'overall',
		];

		foreach($skills as $name => $dir) {
			$skills[$name] = \Img::make(public_path('img/skills/' . $dir . '.png'))->resize(20, 20);
		}

		return $skills;
	}
}