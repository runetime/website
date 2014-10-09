/*jslint browser: true*/
/*global $, jQuery, alert*/
/*jslint devel: true */
/* jshint -W097 */
$(function () {
	"use strict";
	RuneTime.Radio = new RuneTime.Radio();
	RuneTime.Radio.setup();
	RuneTime.ChatBox = new RuneTime.ChatBox();
	RuneTime.ChatBox.setup('radio');
});