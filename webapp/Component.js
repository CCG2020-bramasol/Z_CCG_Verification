sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"ccg/Verification/model/models",
	"ccg/Verification/controller/Application"
], function (UIComponent, Device, models, Application) {
	"use strict";

	return UIComponent.extend("ccg.Verification.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
		//	console.log("Default Odata Model", this.getModel());
			
			//*****My Code********************************
			//********************************************
			// call the base component's init function
			var oApplication = new Application(this);
			oApplication.init();
			//********************************************
			//My Code End
			//*********************************************
			
		}
	});
});