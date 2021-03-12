/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"itr/poc2020/Idoc_Manager_01/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});