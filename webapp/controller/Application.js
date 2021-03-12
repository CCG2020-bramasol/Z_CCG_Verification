sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/Device",
	//"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/ui/core/routing/History",
	"ccg/Verification/controller/BaseController",
	"ccg/Verification/controller/ErrorHandler",
	"./errorHandling",
	"ccg/Verification/lib/CCGVerificationManage"

], function (Object, Device, BindingMode, History, BaseController, ErrorHandler, errorHandling, CCGVerificationManage) {
	"use strict";

	return Object.extend("ccg.Verification.controller.Application", {
		constructor: function (oComponent) {
			this._oComponent = oComponent;
		},

		/* =========================================================== */
		/* Lifecycle methods                                              */
		/* =========================================================== */

		/**
		 * Called by component in order to launch the app.
		 * In this method, the json models are set and the router is initialized.
		 * @public
		 */
		init: function () {
			var JSONModel = sap.ui.require("sap/ui/model/json/JSONModel");

			this._oResourceBundle = this._oComponent.getModel("i18n").getResourceBundle();
			// Globalsoft warehouse management
			this._oCCGVerificationManage = new CCGVerificationManage(this);

			// set the globalProperties model
			this._oGlobalModel = new JSONModel({
				application: this,
				fragments: this._ofragments,
				difference: this._odifference,
				yearModel: "",
				gsswm: this._oCCGVerificationManage,
				gsscb: this._oGssCreateElements,
				breadcrumbs: this._ocreateBreadCrumbs,
				menu: this._omenuBinding,
				currentScreen: "overview",
				parentScreen: "",
				currentModel: "",
				controlId: "",
				message: "",
				aCoin_All: "",
				aCoin_Year: "",
				aCoin_MintMark: "",
				aCoin_Denimin: "",
				aCoin_Proofmint: "",
				aCoin_Variety: "",
				notifynumber: "",
				messageType: "",
				isOdataLoading: false,
				isMultiSelect: false,
				isMetaDataLoading: true,
				isBusyApproving: false,
				metaDataLoaded: false,
				isSwipeRunning: false,
				masterImmediateBusy: true,
				detailImmediateBusy: true,
				lastModelSetName: "",
				MenuData: "",
				MainView: "",
				SecondView: "",
				lastSubModelSetName: "",
				viewId: "",
				uiInd: "",
				viewCid: "",
				load: ""
			});
			this._oGlobalModel.setDefaultBindingMode(BindingMode.TwoWay);
			this._oComponent.setModel(this._oGlobalModel, "globalProperties");

			//*******************************************************************************************
			// Warehouse configuration model
			//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			this._oMenuTransactionModelNew = new JSONModel(jQuery.sap.getModulePath("ccg/Verification",
				"/lib/VerificationConfig.json"));

			this._oComponent.setModel(this._oMenuTransactionModelNew, "MenuTransactionProperties");

			//*******************************************************************************************
			// Process configuration model
			//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

			this._oProcessControlModel = new JSONModel(jQuery.sap.getModulePath("ccg/Verification",
				"/lib/ProcessConfiguration.json"));
			this._oComponent.setModel(this._oProcessControlModel, "ProcessControlProperties");

			// delegate error handling
			errorHandling.register(this, this._oComponent, "");

		},

		/* =========================================================== */
		/* Route handlers (attached during initialization)             */
		/* =========================================================== */

		/* =========================================================== */
		/* Master handling                                             */
		/* =========================================================== */

		// Handling of back functionality.
		// bPreferHistory: Information whether back should be realized via browser-history if browser history is available.
		//                 This should be true with the exception of those views which do not have an own url (like the summary page in our example)
		// bFromDetailScreen: Information whether back is called from master or from detail screen. This is used to decide where to go when history
		// cannot be used. The 'merged header' calls the navButtonPress-handler of the sap.m.semantic.MasterPage when the master list is shown in full
		// screen mode (happens only on phones). Otherwise the the navButtonPress-handler of the sap.m.semantic.DetailPage is called:
		// When coming from a detail screen on a phone go to master, when coming from master or from the detail but not on a phone, go back to previous app/shell.
		navBack: function (bPreferHistory, bFromDetailScreen) {
			// this._oGlobalModel.setProperty("/currentPOId", null);
			if (bPreferHistory) {
				var oHistory = History.getInstance(),
					sPreviousHash = oHistory.getPreviousHash();

				if (sPreviousHash !== undefined) {
					history.go(-1);
					return;
				}
			}
			if (bFromDetailScreen && sap.ui.Device.system.phone) {
				this._oRootView.getController().backMaster();
				this._oRouter.navTo("Main", {}, true);
				return;
			}
			// var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			// oCrossAppNavigator.backToPreviousApp();
		},

		/* =========================================================== */
		/* Empty view handling                                         */
		/* =========================================================== */

		/**
		 * Show view EmptyPage in the detail area
		 * @public
		 * @param {string} sReason the reason for showing the empty view. The following reasons can be used:
		 * - bypassed: invalid url hash
		 * - noObjects: master list is empty (and attribute currentPOId in the global model is faulty)
		 * - objectNotFound: attribute currentPOId in the global model is truthy but does not specify a valid PO
		 */
		showEmptyView: function (sReason) {
			var oEmptyPageSettings = {
				title: this._oResourceBundle.getText(this._getEmptyTitleKey(sReason)),
				text: this._getEmptyText(sReason),
				icon: sReason === "bypassed" ? "sap-icon://document" : null,
				description: ""
			};
			this._oGlobalModel.setProperty("/emptyPage", oEmptyPageSettings);
			this._oGlobalModel.setProperty("/isBusyApproving", false);
			this._oGlobalModel.setProperty("/detailImmediateBusy", false);
			//this._oRouter.getTargets().display("empty");
		},

		_getEmptyTitleKey: function (sReason) {
			switch (sReason) {
			case "bypassed":
				return "notFoundTitle";
			case "noObjects":
				return "masterTitle";
			default:
				return "detailTitle";
			}
		},

		_getEmptyText: function (sReason) {
				if (sReason === "noObjects") {
					return this._oGlobalModel.getProperty("/listNoDataText");
				}
				return this._oResourceBundle.getText(sReason === "bypassed" ? "notFoundText" : "noObjectFoundText");
			}
			/* =========================================================== */
			/* OData metadata handling                                     */
			/* =========================================================== */

	});
});