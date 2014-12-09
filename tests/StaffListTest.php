<?php
class StaffListTest extends TestCase {
	/**
	 *
	 */
	public function testList()
	{
		$response = $this->call('GET', 'staff/list');

		$this->assertEquals(200, $response->getStatusCode());
	}
}
