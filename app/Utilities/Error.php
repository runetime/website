<?php
namespace App\Utilities;
class Error {
	/**
	 * @param $status
	 *
	 * @return \Illuminate\View\View
	 */
	public static function abort($status) {
		switch($status) {
			case 404:
				return view('errors.missing');
			break;
		}
		return view('errors.missing');
	}
}