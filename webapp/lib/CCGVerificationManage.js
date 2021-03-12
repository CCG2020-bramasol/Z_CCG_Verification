sap.ui.define(["sap/ui/core/mvc/Controller",
	"ccg/Verification/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"ccg/Verification/model/utilities",
	"ccg/Verification/controller/errorHandling",
	"ccg/Verification/lib/ODataModelInterface",
	"sap/m/MessageToast"

], function (Controller, BaseController, JSONModel, MessageBox, utilities, errorHandling, ODataModelInterface, MessageToast) {
	"use strict";

	return BaseController.extend("ccg.Verification.lib.GssWarehouseManage", {
		// This class provides the service of sending approve/reject requests to the backend. Moreover, it deals with concurrency handling and success dialogs.
		// For this purpose, a singleton instance is created and attached to the application controller as public property oApprover.
		// This is used by the instances of SubControllerForApproval and by the S2-controller (for swipe approve).
		// Note that approvals that are caused by SubControllerForApproval make the app busy while approvals done by swiping do not.
		// This cla"ss has the following properties:
		// - _oList"Selector: helper class to interact with the master list (fixed)
		// - iOpenCallsCount: number of running approve/reject calls. This attribute is needed because swipe approvals may cause parallel calls.
		// - _mRunni"ngSwipes: maps the IDs of those POs for which a swipe approve is still in process onto true
		// - _bOneWaitingSuccess: true, if at least one approve/reject operation was successfully performed since the last refresh of the master list 
		constructor: function (oApplication) {
			this._iOpenCallsCount = 0;
			this._mRunningSwipes = {};
			this._bOneWaitingSuccess = false;
			this._bMessageOpen = false;

			this._ODataModelInterface = new ODataModelInterface(this);

		},



		getInvoiceHeaderItems: function (oView, sInputValue1, sInputValue2) {
			var promise = jQuery.Deferred();
			var oFilterFields = oView.getFilterFields();
			var oUrlParameters = oView.getUrlParameters();

			var mInputValues = [];
			mInputValues[0] = sInputValue1;
			//mInputValues[1] = sInputValue2;

			var property = "";
			var _inpVal = 0;
			var filterFieldName = [];
			for (property in oFilterFields) {
				filterFieldName[_inpVal] = property;
				_inpVal = _inpVal + 1;
				//_inpVal = property;
				//break;
			}
			for (var i = 0; i < Object.keys(oFilterFields).length; i++) {
				oFilterFields[filterFieldName[i]] = mInputValues[i];
			}

			property = "";
			_inpVal = 0;
			for (property in oUrlParameters) {
				_inpVal = property;
				break;
			}

			for (var j = 0; j < Object.keys(oUrlParameters).length; j++) {

				oUrlParameters[_inpVal] = Object.values(oUrlParameters)[0];
			}

			var whenOdataCall = this._ODataModelInterface.filterAndUrlModelPopulate(oView, oFilterFields, oUrlParameters);
			whenOdataCall.done(function (oResult) {
				promise.resolve(oResult);
			}.bind(this));

			return promise;

		},

		getModelCount: function (oView, sInputValue) {
			var promise = jQuery.Deferred();
			var oFilterFields = oView.getFilterFields();
			var property = "";
			var _inpVal = 0;
			for (property in oFilterFields) {
				_inpVal = property;
				break;
			}
			for (var i = 0; i < Object.keys(oFilterFields).length; i++) {
				oFilterFields[_inpVal] = sInputValue;
			}
			var oWhenOdataCall = this._ODataModelInterface.filterCountModelPopulate(oView, "");
			oWhenOdataCall.done(function (oResult) {
				promise.resolve(oResult);
			});

			return promise;

		},
		getCoinDetails: function (oView, sInputValue1, sInputValue2, sInputValue3, sInputValue4, sInputValue5) {
			var promise = jQuery.Deferred();
			var oFilterFields = oView.getFilterFieldsById();
			var sEntitySet = "/ZCOIN_LOOLUPSet";  //"/ZMMV_C_CDS_COIN_VIEW";
			var sModelName = "CoinModel";

			var mInputValues = [];
			mInputValues[0] = sInputValue1;
			mInputValues[1] = sInputValue2;
			mInputValues[2] = sInputValue3;
			mInputValues[3] = sInputValue4;
			mInputValues[4] = sInputValue5;

			var property = "";
			var _inpVal = 0;
			var filterFieldName = [];
			for (property in oFilterFields) {
				filterFieldName[_inpVal] = property;
				_inpVal = _inpVal + 1;
				//_inpVal = property;
				//break;
			}
			for (var i = 0; i < Object.keys(oFilterFields).length; i++) {
				oFilterFields[filterFieldName[i]] = mInputValues[i];
			}

			var whenOdataCall = this._ODataModelInterface.filterYesMasterModelPopulate(oView, sEntitySet, sModelName, oFilterFields);
			whenOdataCall.done(function (oResult) {
				promise.resolve(oResult);
			}.bind(this));

			return promise;

		},
		// getDropdown: function (oView, oEntitySet, oModelName, sInputValue) {
		// 	var promise = jQuery.Deferred();
		// 	var oFilterFields = oView.getddFilterFields();
		// 	var property = "";
		// 	var _inpVal = 0;
		// 	for (property in oFilterFields) {
		// 		_inpVal = property;
		// 		break;
		// 	}

		// 	for (var i = 0; i < Object.keys(oFilterFields).length; i++) {
		// 		oFilterFields[_inpVal] = sInputValue;
		// 	}
		// 	var oWhenOdataCall = this._ODataModelInterface.filterYesMasterModelPopulate(oView, oEntitySet, oModelName, oFilterFields);
		// 	oWhenOdataCall.done(function (oResult) {
		// 		promise.resolve(oResult);
		// 	});

		// 	return promise;

		// },

		getMasterTable: function (oView, oEntitySet, oModelName) {
			var promise = jQuery.Deferred();

			var oWhenOdataCall = this._ODataModelInterface.filterMasterModelPopulate(oView, oEntitySet, oModelName);
			oWhenOdataCall.done(function (oResult) {
				promise.resolve(oResult);
			});

			return promise;
		},

		grKeyFields: function (oView, sInputValue, shipInd) {
			var promise = jQuery.Deferred();
			var oKeyFields = oView.getKeyFields();
			var property = "";
			var _inpVal = 0;
			for (property in oKeyFields) {
				_inpVal = property;
				break;
			}
			for (var i = 0; i < Object.keys(oKeyFields).length; i++) {
				oKeyFields[_inpVal] = sInputValue;
			}
			if (shipInd) {
				oKeyFields.ShipInd = shipInd;
			}

			oKeyFields.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");

			var whenOdataCall = this._ODataModelInterface.keyFieldModelPopulate(oView);
			whenOdataCall.done(function (oResult) {
				promise.resolve(oResult);
			}.bind(this));

			return promise;

		},
		updateNotification: function (oView, oInputObject) {
			var promise = jQuery.Deferred();
			//GET VIEW ENTITY SET NAME FROM CONFIQURATION JSON MODEL
			var sEntitySet = oView.getEntitySet();
			sEntitySet = sEntitySet + "('" + oInputObject.Invoice_num + "')";
			var whenOdataCall = this._ODataModelInterface.filterFieldModelUpdate(oView, sEntitySet, oInputObject);
			whenOdataCall.done(function (oResult) {
				promise.resolve(oResult);
			}.bind(this));

			return promise;

		},
		postNotificationNo: function (oView, oInputObject) {
			var promise = jQuery.Deferred();

			var oWhenCallCreateIsDone = this._ODataModelInterface.keyFieldModelCreate(oView, oInputObject);
			oWhenCallCreateIsDone.done(function (oResult) {
				promise.resolve(oResult);
			}.bind(this));
			return promise;

		},
		postInvoiceHeader: function (oView, oHeaderObject) {
			var promise = jQuery.Deferred();

			var oWhenCallCreateIsDone = this._ODataModelInterface.keyFieldModelCreate(oView, oHeaderObject);
			oWhenCallCreateIsDone.done(function (oResult) {
				promise.resolve(oResult);
			}.bind(this));
			return promise;

		},

	});
});