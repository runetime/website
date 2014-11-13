<?php
namespace App\Http\Controllers;
class ResourceController extends BaseController {
	public function getCSS() {
		$path = \base_path('/public/css/style.css');
		$file = file_get_contents($path);
		$lastModified = filemtime($path);
		header("X-Content-Type-Options: nosniff");
		header("Last-Modified: " . $lastModified);
		header("Content-type: text/css");
		header("Cache-Control: public");
		return $file;
	}
}