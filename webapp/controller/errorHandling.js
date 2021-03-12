// This class provides a static error-handling facility. Its only method (register) is called during application startup.
// Suitable error handlers are attached to the OData model of this app.

sap.ui.define([
		"sap/ui/Device",
		"sap/m/MessageBox",
		"ccg/Verification/model/utilities",
		"sap/m/MessageToast"
	], function(Device, MessageBox, utilities,MessageToast) {
	"use strict";

	function fnShowMetadataError(oApplication, oParams, oErrorTexts, oDisplayState) {
		oDisplayState.bMessageOpen = true;
		MessageBox.error(
			oErrorTexts.sErrorText, {
				title: oErrorTexts.sErrorTitle,
				details: oParams.response,
				actions: [MessageBox.Action.RETRY, MessageBox.Action.CLOSE],
				onClose: function(sAction) {
					oDisplayState.bMessageOpen = false;
					if (sAction === MessageBox.Action.RETRY) {
						oApplication.whenMetadataIsFinished();
					}
				},
				styleClass: utilities.getContentDensityClass()
			}
		);
	}

	function fnShowServiceError(oParams, oErrorTexts, oDisplayState) {
		if (!oDisplayState.bMessageOpen) {
			oDisplayState.bMessageOpen = true;
			MessageBox.error(
				oErrorTexts.sErrorText, {
					title: oErrorTexts.sErrorTitle,
					details: oParams.response,
					actions: [MessageBox.Action.CLOSE],
					onClose: function() {
						oDisplayState.bMessageOpen = false;
					},
					styleClass: utilities.getContentDensityClass()
				}
			);
		}
	}
	
	function fnShowServiceMessage(sDetails, oDisplayState) {
		if (!oDisplayState.bMessageOpen) {
			oDisplayState.bMessageOpen = true;
			MessageBox.error(
				sDetails, {
					title: "Information",
					details: sDetails,
					actions: [MessageBox.Action.CLOSE],
					onClose: function() {
						oDisplayState.bMessageOpen = false;
					},
					styleClass: utilities.getContentDensityClass()
				}
			);
		}
	}
	

	return {
		register: function(oApplication, oComponent) {
			var oResourceBundle = oComponent.getModel("i18n").getResourceBundle(),
				oModel = oComponent.getModel(),
				oGlobalModel = oComponent.getModel("globalProperties"),
				oErrorTexts = {
					sErrorText: oResourceBundle.getText("errorText"),
					sErrorTitle: oResourceBundle.getText("errorTitle")
				},
				oDisplayState = {
					bMessageOpen: false
				};
			oModel.attachEvent("metadataFailed", function(oEvent) {
				oGlobalModel.setProperty("/listNoDataText", oErrorTexts.sErrorText);
				var oParams = oEvent.getParameters();
				if (!Device.system.phone) {
					oApplication.showEmptyView("noObjects");
				}
				fnShowMetadataError(oApplication, oParams, oErrorTexts, oDisplayState);
			});

			oModel.attachEvent("requestFailed", function(oEvent) {
				var oParams = oEvent.getParameters();
				// An entity that was not found in the service is also throwing a 404 error in oData.
				// We already cover this case with a notFound target so we skip it here.
				// A request that cannot be sent to the server is a technical error that we have to handle though.
				if (oParams.response.statusCode !== "404" || (oParams.response.statusCode === 404 && oParams.response.responseText.indexOf(
					"Cannot POST") === 0) || oParams.response.statusCode === "404") {
					fnShowServiceError(oParams, oErrorTexts, oDisplayState);
				}
			});
			
			oModel.attachEvent("dataReceived", function(oEvent) {
				var oParams = oEvent.getParameters();
					fnShowServiceError(oParams, oErrorTexts, oDisplayState);

			});
			
			
				var sMessage = oGlobalModel.getProperty("/message"),
				    sMessageType = oGlobalModel.getProperty("/messageType");
				if (sMessageType === "E" || sMessageType === "W") {
					fnShowServiceMessage(sMessage,oDisplayState);
				} else if(sMessageType === "S"){
					MessageToast.show(oGlobalModel.getProperty("/message"));
				}

			
		
		}
	};
});