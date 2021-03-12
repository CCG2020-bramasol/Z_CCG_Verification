sap.ui.define([
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel"
], function(Device, JSONModel) {
	"use strict";

	// class providing static utility methods.

	// the density class that should be used according to the environment (may be "")
	var sContentDensityClass = (function() {
		var sCozyClass = "sapUiSizeCozy",
			sCompactClass = "sapUiSizeCompact",
			oBody = jQuery(document.body);
		if (oBody.hasClass(sCozyClass) || oBody.hasClass(sCompactClass)) { // density class is already set by the FLP
			return "";
		} else {
			return Device.support.touch ? sCozyClass : sCompactClass;
		}
	}());

	return {
		// provide the density class that should be used according to the environment (may be "")
		getContentDensityClass: function() {
			return sContentDensityClass;
		},

		// defines a dependency from oControl to oView
		attachControlToView: function(oView, oControl) {
			jQuery.sap.syncStyleClass(sContentDensityClass, oView, oControl);
			oView.addDependent(oControl);
		},

		// ********** Srini code to get seleced line item from table control begins **************
		getObjects: function(oView) {
			var controlId = oView.getGlobalModel().getProperty("/controlId");
			var model = oView.byId(controlId).getSelectedItem().getBindingContext("materialList");
			return model;
		},

		getItems: function(oView, oControlId, oModel) {

			return oView.byId(oControlId).getSelectedItem().getBindingContext(oModel);
		},
		// ********** Srini code to get seleced line item from table control ends **************
		navigateChild: function(target, oView) {
			var childScreens = oView.getChildScreens(),
				childScreen = childScreens[target],
				currentScreen = oView.getGlobalModel().getProperty("/currentScreen");
			oView.getGlobalModel().setProperty("/parentScreen", currentScreen);
			oView.getGlobalModel().setProperty("/currentScreen", childScreen);
			oView.getRouter().navTo("" + target + "");

		},
		setParentScreen: function(screen, oView) {
			var viewProperties = oView.getViewProperties();
			viewProperties.parentScreen = screen;

		},
		selectedItems: function(oView, controlId) {
			return oView.byId(controlId).getSelectedItems();
		},
		removeItems: function(oView, controlId) {
			oView.getView().byId(controlId).removeSelections(true);
		},
		barcodeReader: function(oView, fieldId, frag) {
			cordova.plugins.barcodeScanner.scan(function(barcodeData) {
				if (barcodeData.text !== null) {
					if (sap.ui.Device.os.name === "Android") {
						navigator.vibrate(500);
					}
					if (sap.ui.Device.os.name === "iOS") {
						navigator.vibrate(500);
					}
					var inputvalue = barcodeData.text;
					if (!frag) {
						oView.byId(fieldId).setValue(inputvalue);
					} else {
						sap.ui.core.Fragment.byId(oView.getGlobalModel().getProperty("/viewId") + frag, fieldId).setValue(inputvalue);
					}

				}
			});

		},
		checkUiIndicator: function(oView) {
			var uiInd = oView.getGlobalModel().getProperty("/uiInd");
			var controlModel = oView.getProcessModel(uiInd);
			for (var i = 0; i <= Object.keys(controlModel).length; i++) {
				for (var key in controlModel) {
					oView.byId(key).setVisible(controlModel[key]);
				}
			}

		},
		checkVisible: function(oView) {
			var controlId = oView.getControlId();
			if (oView.getGlobalModel().getProperty("/messageType") === "S") {
				oView.byId(controlId).setVisible(true);
				oView.byId(controlId).setBusy(false);
			} else {
				oView.byId(controlId).setVisible(false);
				oView.byId(controlId).setBusy(false);
			}
		},
		bindMessagePop: function(oView, data) {
			var data1 = {
				Msgtext: '',
				Msgtyp: ''
			};
			data1.Msgtext = oView.getGlobalModel().getProperty("/message");
			data1.MsgTyp = oView.getGlobalModel().getProperty("/messageType");
			var messageModel = new JSONModel();
			var oData = {
				aItems: []
			};
			oData.aItems.push(data1);
			messageModel.setData(oData);
			//oView.msgFragmentLoaded.setModel(messageModel, "errorList");
		}

	};
});