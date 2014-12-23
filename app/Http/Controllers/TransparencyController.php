<?php
namespace App\Http\Controllers;

class TransparencyController extends BaseController
{
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->nav('navbar.runetime.runetime');
		$this->title('transparency.title');
		return $this->view('transparency.index');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getMarkdown()
	{
		$paths = \File::allFiles(\base_path('views/parsedown'));
		$files = [];
		foreach($paths as $path) {
			$name = str_replace("_", " ", $path);
			$name = str_replace(".md", "", $name);
			$name = explode("parsedown/", $name)[1];
			$name = ucwords($name);
			$files[$name] = \File::get($path);
		}

		$renderedFiles = [];
		$parsedown = new \Parsedown;
		foreach($files as $name => $file) {
			$renderedFiles[$name] = $parsedown->text($file);
		}

		$this->bc(['transparency' => trans('transparency.title')]);
		$this->nav('navbar.runetime.runetime');
		$this->title('transparency.markdown.title');
		return $this->view('transparency.markdown', compact('files', 'renderedFiles'));
	}
}