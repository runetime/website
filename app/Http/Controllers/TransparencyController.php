<?php
namespace App\Http\Controllers;

class TransparencyController extends Controller
{
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->nav('navbar.runetime.title');
		$this->title('transparency.title');
		return $this->view('transparency.index');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getMarkdownIndex()
	{
		$paths = \File::allFiles(\base_path('resources/views/parsedown/tutorial'));
		$files = [];
		foreach($paths as $path) {
			$name = str_replace("_", " ", $path);
			$name = str_replace(".md", "", $name);
			$name = explode("parsedown/tutorial/", $name)[1];
			$name = ucwords($name);
			$files[$name] = \File::get($path);
		}

		$renderedFiles = [];
		$parsedown = new \Parsedown;
		foreach($files as $name => $file) {
			$renderedFiles[$name] = $parsedown->text($file);
		}

		$this->bc(['transparency' => trans('transparency.title')]);
		$this->nav('navbar.runetime.title');
		$this->title('transparency.markdown.title');
		return $this->view('transparency.markdown.index', compact('files', 'renderedFiles'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getMarkdownReference()
	{
		$paths = \File::allFiles(\base_path('resources/views/parsedown/reference'));
		$files = [];
		foreach($paths as $path) {
			$name = str_replace("_", " ", $path);
			$name = str_replace(".md", "", $name);
			$name = explode("parsedown/reference/", $name)[1];
			$name = ucwords($name);
			$files[$name] = \File::get($path);
		}

		$renderedFiles = [];
		$parsedown = new \Parsedown;
		foreach($files as $name => $file) {
			$renderedFiles[$name] = $parsedown->text($file);
		}

		$this->bc(['transparency' => trans('transparency.title'), 'transparency/markdown' => trans('transparency.markdown.title')]);
		$this->nav('navbar.runetime.title');
		$this->title('transparency.markdown.reference.title');
		return $this->view('transparency.markdown.reference', compact('files', 'renderedFiles'));
	}
}