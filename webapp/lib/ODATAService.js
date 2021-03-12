sap.ui.define(["sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel"

], function (Object, Device, JSONModel) {
	"use strict";

	return Object.extend("ccg.Verification.lib.ODATAService", {
		// This class provides the service of sending approve/reject requests to the backend. Moreover, it deals with concurrency handling and success dialogs.
		// For this purpose, a singleton instance is created and attached to the application controller as public property oApprover.
		// This is used by the instances of SubControllerForApproval and by the S2-controller (for swipe approve).
		// Note that approvals that are caused by SubControllerForApproval make the app busy while approvals done by swiping do not.
		// This class has the following properties:
		// - _oListSelector: helper class to interact with the master list (fixed)
		// - iOpenCallsCount: number of running approve/reject calls. This attribute is needed because swipe approvals may cause parallel calls.
		// - _mRunningSwipes: maps the IDs of those POs for which a swipe approve is still in process onto true
		// - _bOneWaitingSuccess: true, if at least one approve/reject operation was successfully performed since the last refresh of the master list 
		constructor: function (oApplication) {
			this._iOpenCallsCount = 0;
			this._mRunningSwipes = {};
			this._bOneWaitingSuccess = false;
		},
		oCallFunctionService: function (sEntityName, oView, oUriParameters) {
			var promise = jQuery.Deferred();
			var oModel = oView.getModel(); //To get the Model data//
			var para = oUriParameters[0];
			oModel.callFunction(sEntityName, { // function import name //
				method: "GET", // http method //
				urlParameters: para,
				success: function (oData, response) { //Success Function //
					promise.resolve(oData);
				}.bind(this), // callback function for success
				error: function (oError) {
					promise.reject(oError);
				}.bind(this)
			}); // callback function for error
			return promise;
		},

		//reference example url https://blogs.sap.com/2014/05/06/promises-in-native-javascript/
		oCallFunctionPromise: function (sEntityName, oView, oUriParameters) {
			return new Promise(function (fnResolve, fnReject) {
				var oModel = oView.getModel();
				var para = oUriParameters[0];
				var fnOnError = function (oError) {
					this._callEnded(false, oView);
					fnReject(oError);
				}.bind(this);
				var fnOnSuccess = function (oData, response) {
					this._callEnded(true, oView);
					fnResolve(oData, response);
				}.bind(this);
				oModel.callFunction(sEntityName, { // function import name //
					method: "GET", // http method //
					urlParameters: para,
					success: fnOnSuccess,
					error: fnOnError
				});
			}.bind(this));
		},
		//The Deferred object, introduced in jQuery 1.5, 
		//is a chainable utility object created by calling the jQuery.Deferred() method.
		oCallReadCountDeferred: function (sEntityName, oComponent, aFilters) {
			var promise = jQuery.Deferred(),
				oDataModel = oComponent.getModel();
			//"/ITRINDSVR03/sap/opu/odata/sap/ZITR_IDM_GW_IDOC_SRV/Total_idocsSetcount?$filter=Idoc_status%20eq%20"
			// "/ITRINDSVR03/sap/opu/odata/sap/ZITR_IDM_GW_IDOC_SRV/Total_idocsSet/count?$filter=Idoc_status%20eq%20%27%27"
			oDataModel.read(sEntityName + "/$count?", {
				filters: aFilters,
				success: function (oData) {
					promise.resolve(oData);
				},
				error: function (oData) {
					promise.reject(oData);
				}
			});
			return promise;
		},

		//The Deferred object, introduced in jQuery 1.5, 
		//is a chainable utility object created by calling the jQuery.Deferred() method.
		oCallReadDeferred: function (sEntityName, oComponent, aFilters) {
			var promise = jQuery.Deferred(),
				oDataModel = oComponent.getModel();

			oDataModel.read(sEntityName, {
				filters: aFilters,
				success: function (oData) {
					promise.resolve(oData);
				}.bind(this),
				error: function (oData) {
					sap.ui.core.BusyIndicator.hide();
					promise.reject(oData);
				}.bind(this)
			});
			return promise;
		},
		//?$filter=IDoc_Number eq '0000000000528173'&$expand=Nav_IDoc_matnr
		oCallReadDeferredWithUrlParam: function (sEntityName, oComponent, aFilters, oUrlParameters) {
			var promise = jQuery.Deferred(),
				oDataModel = oComponent.getModel();

			oDataModel.read(sEntityName, {
				filters: aFilters,
				urlParameters: oUrlParameters,
				success: function (oData) {
					promise.resolve(oData);
				}.bind(this),
				error: function (oData) {
					sap.ui.core.BusyIndicator.hide();
					promise.reject(oData);
				}.bind(this)
			});
			return promise;
		},

		oCallUpdateDeferred: function (sEntityset, oItems, oView) {
			var promise = jQuery.Deferred(),
				oDataModel = oView.getModel();

			oDataModel.update(sEntityset, oItems, {
				success: function (oData, oResponse) {
					promise.resolve(oData);
				}.bind(this),
				error: function (oData, oResponse) {
					sap.ui.core.BusyIndicator.hide();
					promise.reject(oData);
				}.bind(this)
			});
			return promise;
		},

		oCallCreateDeferred: function (sEntityset, oItems, oView) {
			var promise = jQuery.Deferred(),
				oDataModel = oView.getModel();
			oDataModel.create(sEntityset, oItems, {

				method: "POST",
				headers: {},
				success: function (oData) {
					sap.ui.core.BusyIndicator.hide();
					promise.resolve(oData);

				}.bind(this),
				error: function (oData) {
					sap.ui.core.BusyIndicator.hide();
					promise.reject(oData);
				}.bind(this)
			});
			return promise;
		},
		oCallUpdateDeferred: function (sEntityset, oItems, oView) {
			var promise = jQuery.Deferred(),
				oDataModel = oView.getModel();

			oDataModel.update(sEntityset, oItems, {
				success: function (oData) {
					sap.ui.core.BusyIndicator.hide();
					promise.resolve(oData);

				}.bind(this),
				error: function (oData) {
					sap.ui.core.BusyIndicator.hide();
					promise.reject(oData);
				}.bind(this)
			});
			return promise;
		},

		//This odata read function write return value into global variable to handle later in UI
		oCallRead: function (sFunction, oOwnerComponent, oGlobalModel) {
			//var oModel = oOwnerComponent.getModel();
			var oRfData;
			oOwnerComponent.read(sFunction, {
				success: function (oRetrievedResult) {
					//return odata result 
					oRfData = oRetrievedResult.results;
					oGlobalModel.setProperty("/oDataResult", oRfData);
					// this.oCallEnd(oGlobalModel);
				},
				error: function (oError) {
					return "";
				}
			});
			return oRfData;
		},

		oCallCreate: function (sFunction, oOwnerComponent, oGlobalModel) {
			var oRfData;
			oOwnerComponent.create(sFunction, {
				success: function (oRetrievedResult) {
					//return odata result 
					oRfData = oRetrievedResult.results;
					oGlobalModel.setProperty("/oDataResult", oRfData);
					// this.oCallEnd(oGlobalModel);
				},
				error: function (oError) {
					return "";
				}
			});
			return oRfData;
		},

		oCallEnd: function (oGlobalModel) {
			oGlobalModel.setProperty("/oDataResult", this._oResultData);

		},

		//handl multiple request
		oCallDifferedMultiple: function (sFunction, oOwnerComponent) {
			return new Promise(function (fnResolve, fnReject) {
				var oRfData;
				//var sFunction = "/configurationsSet",
				//	oModel = oOwnerComponent.getModel();
				var oModel = oOwnerComponent;
				this._iOpenCallsCount++;
				var fnOnError = function () {
					fnReject();
				}.bind(this);
				var fnOnSuccess = function (oRetrievedResult) {
					//return odata result 
					oRfData = oRetrievedResult.results;
					var oGlobalModel = oOwnerComponent.getModel("globalProperties");
					oGlobalModel.setProperty("/oDataResult", oRfData);
					// this.oCallEnd(oGlobalModel);
					//	this._callEnded(true, oGlobalModel);
					// A success message is only sent when the last request has returned. Thus, when the user sents several requests via swipe, only one
					// message toast is sent; this represents the request that came back as last.
					if (this._iOpenCallsCount === 0) {
						var oResourceBundle = oOwnerComponent.getModel("i18n").getResourceBundle(),
							sSuccessMessage = "";
						sSuccessMessage = oResourceBundle.getText("ymsg.sucssfullCallMessageToast");
						sap.ui.require(["sap/m/MessageToast"], function (MessageToast) {
							MessageToast.show(sSuccessMessage);
						});
					}
					fnResolve();
				}.bind(this);
				oModel.callFunction(sFunction, {
					method: "POST",
					groupId: "oDataCall"
				});

				oModel.submitChanges({
					groupId: "oDataCall",
					success: fnOnSuccess,
					error: fnOnError
				});
			}.bind(this));
		},

		// This method is called when a backend call has finished.
		// bSuccess states whether the call was successful
		// oGlobalModel is the global JSON model of the app
		_callEnded: function (bSuccess, oGlobalModel) {
			// Book-keeping:
			this._iOpenCallsCount--;
			this._bOneWaitingSuccess = bSuccess || this._bOneWaitingSuccess;
			if (this._iOpenCallsCount === 0) { // When we are not waiting for another call
				if (this._bOneWaitingSuccess) { // At least one PO was approved/rejected successfully, therefore the list should be refreshed
					this._bOneWaitingSuccess = false;
				} else {
					oGlobalModel.setProperty("/isBusyApproving", false); // As no refresh is triggered in this case, we reset the busy status immediately.
				}
			}
		}
	});
});