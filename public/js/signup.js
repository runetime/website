/*global $:false, jQuery:false */
/*jslint browser: true, devel: true */
$(function () {
	"use strict";
	setTimeout(function () {
		RuneTime.FormSignup = new RuneTime.SignupForm();
		RuneTime.FormSignup.setup();
	}, 1000);
});