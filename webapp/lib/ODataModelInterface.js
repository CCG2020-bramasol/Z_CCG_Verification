sap.ui.define(["sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"ccg/Verification/model/utilities",
	"ccg/Verification/controller/errorHandling",
	"ccg/Verification/lib/ODATAService",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"

], function (Object, JSONModel, utilities, errorHandling, ODATAService, Filter, FilterOperator, MessageToast) {
	"use strict";

	return Object.extend("ccg.Verification.lib.ODataModelInterface", {
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

			//CREAT OBJECT FOR ODATA SERVICE
			//GET GLOBAL VARIABLE VALUES FROM BASE CONTROLLER/GLOBAL MODEL

			this._oODATAService = new ODATAService(this);
			this._oRfModel; // = new JSONModel();
		},
		filterCountModelPopulate: function (oView, oFilterFields) {
			var promise = jQuery.Deferred();
			//GET VIEW ENTITY SET NAME FROM CONFIQURATION JSON MODEL
			var sEntitySet = oView.getEntitySet();
			var mFilterFields = oFilterFields;
			//GET FILTER FIELDS FROM CONFIGURATION JSON MODEL
			if (!mFilterFields) {
				mFilterFields = oView.getFilterFields();
			}
			//SETUP FILTER STRING
			var aFilterValues = this.setFilter(mFilterFields);
			//CALL ODATA SERVICE
			var oWhenCallReadIsDone = this._oODATAService.oCallReadCountDeferred(sEntitySet, oView, aFilterValues);

			//Handle response from oData Call
			oWhenCallReadIsDone.done(function (oResult, oFailed) {
				var oRfData;
				oRfData = oResult.results;

				promise.resolve(oRfData);

			});
			return promise;

		},
		filterModelPopulate: function (oView, oFilterFields) {
			var promise = jQuery.Deferred();
			//GET VIEW ENTITY SET NAME FROM CONFIQURATION JSON MODEL
			var sEntitySet = oView.getEntitySet();
			//GET FILTER FIELDS FROM CONFIGURATION JSON MODEL
			if (!oFilterFields) {
				oFilterFields = oView.getFilterFields();
			}
			//SETUP FILTER STRING
			var aFilterValues = this.setFilter(oFilterFields);
			//CALL ODATA SERVICE
			var oWhenCallReadIsDone = this._oODATAService.oCallReadDeferred(sEntitySet, oView, aFilterValues);

			//Handle response from oData Call
			oWhenCallReadIsDone.done(function (oResult, oFailed) {
				var oRfData;
				oRfData = oResult.results;
				oRfData = {
					aItems: oRfData
				};

				this.errorHandlingDelegate(oView, oRfData, true);

				promise.resolve(this._oRfModel);

			}.bind(this));
			return promise;

		},
		filterAndUrlModelPopulate: function (oView, oFilterFields, oUrlParameters) {
			var promise = jQuery.Deferred();
			//GET VIEW ENTITY SET NAME FROM CONFIQURATION JSON MODEL
			var sEntitySet = oView.getEntitySet();
			//sEntitySet = "Total_idocsSet";
			//GET FILTER FIELDS FROM CONFIGURATION JSON MODEL
			if (!oFilterFields) {
				oFilterFields = oView.getFilterFields();
			}
			//SETUP FILTER STRING
			var aFilterValues = this.setFilter(oFilterFields);

			var aUrlParameters = oUrlParameters;
			//CALL ODATA SERVICE
			var oWhenCallReadIsDone = this._oODATAService.oCallReadDeferredWithUrlParam(sEntitySet, oView, aFilterValues, aUrlParameters);
			//var oWhenCallReadIsDone = this._oODATAService.oCallReadDeferredWithUrl(sEntitySet, oView, aFilterValues, aUrlParameters);
			//Handle response from oData Call
			oWhenCallReadIsDone.done(function (oResult, oFailed) {
				var oRfData;
				oRfData = oResult.results;
				oRfData = {
					aItems: oRfData
				};

				this.errorHandlingDelegate(oView, oRfData, true);

				promise.resolve(this._oRfModel);

			}.bind(this));
			return promise;

		},
		filterYesMasterModelPopulate: function (oView, oEntitySet, oModelName, oFilterFields) {
			var promise = jQuery.Deferred();
			var sEntitySet = oEntitySet;
			//GET FILTER FIELDS FROM CONFIGURATION JSON MODEL
			if (!oFilterFields) {
				oFilterFields = oFilterField;
			}

			//SETUP FILTER STRING
			var aFilterValues = this.setFilter(oFilterFields);
			//CALL ODATA SERVICE
			var oWhenCallReadIsDone = this._oODATAService.oCallReadDeferred(sEntitySet, oView, aFilterValues);

			//Handle response from oData Call
			oWhenCallReadIsDone.done(function (oResult, oFailed) {
				var oRfData;
				oRfData = oResult.results;
				oRfData = {
					aItems: oRfData
				};

				this.setGlobalModel(oView, oRfData, true, oModelName);

				promise.resolve(this._oRfModel);

			}.bind(this));
			return promise;

		},
		filterMasterModelPopulate: function (oView, oEntitySet, oModelName) {
			var promise = jQuery.Deferred();
			//GET VIEW ENTITY SET NAME FROM CONFIQURATION JSON MODEL
			var sEntitySet = oEntitySet;

			//SETUP FILTER STRING
			var aFilterValues = "";
			//CALL ODATA SERVICE
			var oWhenCallReadIsDone = this._oODATAService.oCallReadDeferred(sEntitySet, oView, aFilterValues);

			//Handle response from oData Call
			oWhenCallReadIsDone.done(function (oResult, oFailed) {
				var oRfData;
				oRfData = oResult.results;
				oRfData = {
					aItems: oRfData
				};

				this.setGlobalModel(oView, oRfData, true, oModelName);

				promise.resolve(this._oRfModel);

			}.bind(this));
			return promise;

		},
		filterFieldModelUpdate: function (oView, oEntitySetPath, oUpdateItem) {
			var promise = jQuery.Deferred();
			var oWhenCallUpdateIsDone = this._oODATAService.oCallUpdateDeferred(oEntitySetPath, oUpdateItem, oView);
			//Handle response from oData Call
			oWhenCallUpdateIsDone.done(function (oResult, oFailed) {
				var oRfData;
				oRfData = oResult;
				oRfData = {
					aItems: [oRfData]
				};
				this.buildMessage(oView, oResult);
				this.errorHandlingDelegate(oView, oRfData, false);

				promise.resolve(oResult);
			}.bind(this));

			return promise;

		},

		keyFieldModelPopulate: function (oView) {
			var promise = jQuery.Deferred();
			//GET VIEW ENTITY SET NAME FROM CONFIQURATION JSON MODEL
			var sEntitySet = oView.getEntitySet();
			//GET KEY FIELDS FROM CONFIGURATION JSON MODEL
			var oKeyFields = oView.getKeyFields();
			//Setup filter string
			var sPath = this.setKeyField(oKeyFields);

			var oWhenCallReadIsDone = this._oODATAService.oCallReadDeferred(sEntitySet + sPath, oView, "");
			//Handle response from oData Call
			oWhenCallReadIsDone.done(function (oResult, oFailed) {
				var oRfData;
				oRfData = oResult;
				oRfData = {
					aItems: [oRfData]
				};
				this.errorHandlingDelegate(oView, oRfData, true);

				promise.resolve(this._oRfModel);

			}.bind(this));

			return promise;

		},
		keyFieldModelUpdate: function (oView, oUpdateItem) {

			var promise = jQuery.Deferred();
			//GET VIEW ENTITY SET NAME FROM CONFIQURATION JSON MODEL
			var sEntitySet = oView.getEntitySet();
			//GET KEY FIELDS FROM CONFIGURATION JSON MODEL
			var oKeyFields = oView.getKeyFields();
			//Setup filter string
			var sPath = this.setKeyField(oKeyFields);
			var oWhenCallUpdateIsDone = this._oODATAService.oCallUpdateDeferred(sEntitySet + sPath, oUpdateItem, oView);
			//Handle response from oData Call
			oWhenCallUpdateIsDone.done(function (oResult, oFailed) {
				var oRfData;
				oRfData = oResult;
				oRfData = {
					aItems: [oRfData]
				};
				this.buildMessage(oView, oResult);
				this.errorHandlingDelegate(oView, oRfData, false);

				promise.resolve(oResult);
			}.bind(this));

			return promise;

		},

		keyFieldModelCreate: function (oView, oUpdateItem) {
			var promise = jQuery.Deferred();
			//GET VIEW ENTITY SET NAME FROM CONFIQURATION JSON MODEL
			var sEntitySet = oView.getEntitySet();
			//GET KEY FIELDS FROM CONFIGURATION JSON MODEL
			/*var oKeyFields = oView.getKeyFields();*/
			//Setup filter string
			/*var sPath = this.setKeyField(oKeyFields);*/
			var oWhenCallCreateIsDone = this._oODATAService.oCallCreateDeferred(sEntitySet, oUpdateItem, oView);
			//Handle response from oData Call
			oWhenCallCreateIsDone.done(function (oResult, oFailed) {
				var oRfData;
				oRfData = oResult;
				oRfData = {
					aItems: [oRfData]
				};
				this.errorHandlingDelegate(oView, oRfData, false);
				promise.resolve(oResult);
			}.bind(this));
			return promise;
		},
		buildMessage: function (oView, oResult) {
			var oGlobalModel = oView.getModel("globalProperties");
			if (!oResult) {
				oGlobalModel.setProperty("/messageType", "S");
				var sMessage = oView.geti18n(oView.getUpdateToast());
				oGlobalModel.setProperty("/message", sMessage);
			} else {
				oGlobalModel.setProperty("/messageType", "E");
			}

		},

		setGlobalModel: function (oView, oRfData, setModelFlag, mModelName) {
			var oGlobalModel = oView.getModel("globalProperties");

			//if (oRfData.aItems.length !== 0) {

			//SET MODEL TO CURRENT VIEW
			var sModelName = mModelName;
			if (sModelName.length !== 0 && setModelFlag === true) {
				this._oRfModel = new JSONModel();
				this._oRfModel.setData(oRfData);
				oView.setModelData(oRfData);
				sap.ui.getCore().setModel(this._oRfModel, sModelName);
				//oView.setModel(this._oRfModel, mModelName);
			}
			//}
		},

		errorHandlingDelegate: function (oView, oRfData, setModelFlag) {
			var oGlobalModel = oView.getModel("globalProperties");

			//if (oRfData.aItems.length !== 0) {

			//SET MODEL TO CURRENT VIEW
			var sModelName = oView.getModelName();
			if (sModelName.length !== 0 && setModelFlag === true) {
				this._oRfModel = new JSONModel();
				this._oRfModel.setData(oRfData);
				oView.setModelData(oRfData);
				// console.log("error handling model name", oView.getModelName());
				// console.log("error handling model", oView.getModel());
				// console.log("oview in error hadling", oView);
				oView.setModel(this._oRfModel, oView.getModelName());
			}
			//Before call errorhandling delegates
			//Set Response Message and message Type to trigger message box
			if (oRfData.aItems.length !== 0) {
				if (oRfData.aItems[0]) {
					oGlobalModel.setProperty("/message", oRfData.aItems[0].Msgtext);
					oGlobalModel.setProperty("/messageType", oRfData.aItems[0].Msgtyp);
				}
			}

			//}
			/*else {
				//Set Response Message and message Type to trigger message box
				oGlobalModel.setProperty("/message", "Invalid Input");
				oGlobalModel.setProperty("/messageType", "E");

			}*/
			// delegate error handling
			errorHandling.register(oView.getApplication(), oView.getComponent());
		},

		// ************* Srini code to get selected items from table begins ************
		selectedItems: function (oView, controlId) {
			return oView.byId(controlId).getSelectedItems();
		},
		functionCallByFilter: function (oView) {
			var promise = jQuery.Deferred();
			//GET VIEW ENTITY SET NAME FROM CONFIQURATION JSON MODEL
			var sEntitySet = oView.getEntitySet();
			//GET FILTER FIELDS FROM CONFIGURATION JSON MODEL
			var oFilterFields = oView.getFilterFields();
			//SETUP FILTER STRING
			var aFilterValues = this.setFilter(oFilterFields);
			//CALL ODATA SERVICE
			this._oODATAService.oCallFunctionPromise(sEntitySet, oView, aFilterValues)
				.then(function (oResult, response) {
					var oRfData;
					oRfData = oResult;
					oRfData = {
						aItems: [oRfData]
					};
					this.errorHandlingDelegate(oView, oRfData, true);
					promise.resolve(oRfData);
				});

			return promise;

		},

		setUrlFilter: function (oFilterFields) {
			/*	[{"Lgnum":oView.getGlobalModel().getProperty("/currentLgnum"),
				"Nltyp":oView.getGlobalModel().getProperty("/currentNltyp"),
				"Nlpla": sInputValue}];*/
			var index = 0,
				property = "",
				aFilterValues = [];
			var inputValues = [],
				fieldValues = [];
			if (oFilterFields !== null) {
				for (index in oFilterFields) {
					inputValues.push(oFilterFields[index]);
					index++;
				}
				for (property in oFilterFields) {
					fieldValues.push(property);
				}
				for (var i = 0; i < fieldValues.length; i++) {
					aFilterValues.push(this.buildFilter(fieldValues[i], inputValues[i]));
				}
			}
			return aFilterValues;

		},

		buildFilter: function (field, value) {
			var aFilter = new Filter(field, FilterOperator.EQ, value);
			return aFilter;
		},

		setFilter: function (oFilterFields) {
			var index = 0,
				property = "",
				aFilterValues = [];
			var inputValues = [],
				fieldValues = [];
			if (oFilterFields !== null) {
				for (index in oFilterFields) {
					inputValues.push(oFilterFields[index]);
					index++;
				}
				for (property in oFilterFields) {
					fieldValues.push(property);
				}
				for (var i = 0; i < fieldValues.length; i++) {
					aFilterValues.push(this.buildFilter(fieldValues[i], inputValues[i]));
				}
			}
			return aFilterValues;
		},
		setKeyField: function (oKeyFields) {
			var index = 0,
				modelArray = [],
				fieldArray = [];
			var path = "",
				property = "",
				commaVar = ",";

			if (oKeyFields !== null) {
				for (index in oKeyFields) {
					modelArray.push(oKeyFields[index]);
					index++;
				}

				for (property in oKeyFields) {
					fieldArray.push(property);
				}

				for (var i = 0; i < fieldArray.length; i++) {
					if (i === fieldArray.length - 1) {
						commaVar = "";
					}
					path = path + fieldArray[i] + "='" + modelArray[i] + "'" + commaVar;
				}
			}
			var sPath = "(" + path + ")";
			return sPath;
		}

	});
});
// ************* Srini code to get confirm items ends ************