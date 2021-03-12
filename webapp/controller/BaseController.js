sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/m/library",
	"sap/ui/model/resource/ResourceModel",
	"ccg/Verification/model/utilities"

], function (Controller, History, UIComponent, library, ResourceModel, utilities) {
	"use strict";

	return Controller.extend("ccg.Verification.controller.BaseController", {

		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		onNavBack: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				this.getGlobalModel().setProperty("/currentScreen", "overview");
				window.history.go(-1);
			} else {
				this.getGlobalModel().setProperty("/currentScreen", "overview");
				this.getRouter().navTo("TargetIdoc_Overview", {}, false /*no history*/ );
			}
		},
		//*************Custom Wrappers added by us
		//*****************************************
		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function () {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			mobileLibrary.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},
		/**
		 * Convenience method to get the global model containing the global state of the app.
		 * @returns {object} the global Propery model
		 */
		getGlobalModel: function () {
			return this.getOwnerComponent().getModel("globalProperties");
		},
		/**
		 * Convenience method to get the fragment model containing the fragments used in the app.
		 * @returns {object} the fragment model
		 */

		getFragmentControllerModel: function () {
			return this.getOwnerComponent().getModel("fragmentControllerProperties");
		},
		/**
		 * Convenience method to get the screen model containing the necessary fields and filters for the view.
		 * @returns {object} the screen Propery 
		 */

		getScreenModel: function (currentScreen) {
			var menuModel = this.getMenuTransactionModel(),
				//filterVal = menuModel.getProperty("/" + currentScreen).split("@").pop();
				ScreenModel = menuModel.getProperty("/" + currentScreen);
			return ScreenModel;
		},
		/**
		 * Convenience method to get the WM configuration model containing the global state of the app.
		 * @returns {object} the configuration Propery model
		 */
		getMenuTransactionModel: function () {
			return this.getOwnerComponent().getModel("MenuTransactionProperties");

		},
		/**
		 * Convenience method to get the process model containing .
		 * @returns {object} the process Propery
		 */
		getProcessModel: function (uiIndicator) {
			var processModel = this.getProsessControlModel(),
				controlModel = processModel.getProperty("/" + uiIndicator);
			return controlModel;
		},
		/**
		 * Convenience method to get the WM Process Configuration model containing the global state of the app.
		 * @returns {object} the Process configuration Propery model
		 */
		getProsessControlModel: function () {
			return this.getOwnerComponent().getModel("ProcessControlProperties");

		},
		/**
		 * Convenience method for getting Tcode
		 * @returns {object} Tcode for the view
		 */
		getCurrentScrn: function () {
			return this.getGlobalModel().getProperty("/currentScreen");
		},
		/**
		 * Convenience method for getting data binded to the view
		 * * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @returns {object} data from the model
		 */
		getModelData: function (oModel) {
			return this.getView().getModel(oModel).getData();
		},
		//*************************************************************************************************
		//THESE METHODS ARE USED TO ACCESS LIBRARY,MODULES AND MODELS
		//***************************************************************************************************
		/**
		 * Convenience method
		 * @returns {object} the CCGVerificationManage controller
		 */
		callOdataService: function () {
			return this.getGlobalModel().getProperty("/gsswm");
		},
		/**
		 * Convenience method
		 * @returns {object} the CreateElements controller
		 */
		createElements: function () {
			return this.getGlobalModel().getProperty("/gsscb");

		},
		/**
		 * Convenience method
		 * @returns {object} the application controller
		 */

		getApplication: function () {
			return this.getGlobalModel().getProperty("/application");
		},
		/**
		 * Convenience method
		 * @returns {object} the CreateBreadCrumbs controller
		 */
		gssCallBreadcrumbs: function () {
			return this.getGlobalModel().getProperty("/breadcrumbs");
		},
		/**
		 * Convenience method
		 * @returns {object} the fragments controller
		 */
		gssFragmentsFunction: function () {
			return this.getGlobalModel().getProperty("/fragments");
		},
		/**
		 * Convenience method
		 * @returns {object} the difference controller
		 */
		gssDifferenceFunction: function () {
			return this.getGlobalModel().getProperty("/difference");
		},
		/**
		 * Convenience method
		 * @returns {object} the menubinding controller
		 */
		gssCallMenu: function () {
			return this.getGlobalModel().getProperty("/menu");
		},
		/**
		 * Convenience method
		 * @returns {object} the Component 
		 */
		getComponent: function () {
			return this.getOwnerComponent();
		},
		/**
		 * Convenience method to set i18n model to the view
		 */

		seti18nModel: function (oView) {
			// set i18n model on view
			var i18nModel = new ResourceModel({
				bundleName: "ccg.Verification.i18n.i18n"
			});
			oView.setModel(i18nModel, "i18n");
		},
		/**
		 * Convenience method to destroy model binded to the view
		 */
		destroyModel: function () {
			if (this.getView().getModel(this.getModelName())) {
				this.getView().getModel(this.getModelName()).setData("");
			}

		},
		/**
		 * Convenience method to check indicators for the data
		 * @param {object} data - oData instance
		 * @param {boolean} flag  
		 */
		checkInd: function (data, flag) {
			if (flag) {
				this.getGlobalModel().setProperty("/indiTO", data.ToInd);
				this.gssFragmentsFunction().uiIndCheck(this, data.ToInd, data.ToConfirmInd, data.PostInd, flag); //uiIndCheck:to perform ui operations with data

				utilities.bindMessagePop(this, data); //bindMessagePop:set message to messagepopover
			} else {
				utilities.bindMessagePop(this, data); //bindMessagePop:set message to messagepopover
			}

		},
		/**
		 * Convenience method to get controlId of the view
		 */
		getControlId: function () {
			var viewProperties = this.getViewProperties();
			return viewProperties.uiControl;
		},
		/**
		 * Convenience method to set retrieved data to the global property
		 * @param {object} data - oData instance
		 */
		setModelData: function (data) {
			var viewProperties = this.getViewProperties();
			viewProperties.modelData = data;
		},
		/**
		 * Convenience method to set retrieved data to the view from global property
		 * @public
		 */
		getBackModelData: function () {
			var viewProperties = this.getViewProperties(),
				jsonModel = new sap.ui.model.json.JSONModel(viewProperties.modelData);
			this.setModel(jsonModel, this.getModelName());
		},
		/**
		 * Convenience method to update load status to the data to the view from global property
		 * @public
		 */
		loadCheck: function () {
			var viewProperties = this.getViewProperties();
			var data = viewProperties.modelData;
			if (this.getGlobalModel().getProperty("/load") === "X") {
				data.aItems[0].LoadStat = "X";
			} else if (this.getGlobalModel().getProperty("/load") === "Y") {
				data.aItems[0].LoadStat = "";
			}
			this.setModelData(data); //updated data set to global property of the view 
			this.getGlobalModel().setProperty("/load", ""); //empty the global property for the next loadcheck process
		},
		/**
		 * Convenience method to update title the view from global property
		 * @public
		 */
		titleSet: function () {
			var title = this.getGlobalModel().getProperty("/title");
			this.byId("title").setTitle(title);

		},
		/**
		 * Convenience method to  title the view from global property
		 * @public
		 */
		setPageTitle: function () {
			var titleId = this.getPageTitle(), //to get pagetitle from globalproperty
				title = this.geti18n(titleId);
			this.byId("title").setProperty("title", title);
			this.byId("title").setTitle(title);

		},
		/**
		 * Convenience method to show the current Queue  
		 * @public
		 */
		handleUserNamePress: function (event) {
			var popover = new sap.m.Popover({ // To build popup&nbsp;
				showHeader: false,
				placement: sap.m.PlacementType.Bottom,
				content: [
					new sap.m.Text({ // To display text field in the popover
						text: this.geti18n("queue") + "- " + this.getGlobalModel().getProperty("/currentQueue"), // To display assigned queue to that user
						type: sap.m.ButtonType.Transparent // Text type
					})

				]
			}).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover'); // CSS style for the popup

			popover.openBy(event.getSource()); // To open popup event
		},
		/**
		 * Convenience method to update the toast message in the global property of the view 
		 * @public
		 */
		setUpdateToast: function (toast) {
			var properties = this.getViewProperties();
			properties.toastMsg = toast;
		},
		/**
		 * Convenience method to access i18n translated text
		 * @public
		 * * @param {string} key - i18n key
		 */
		geti18n: function (key) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			return oResourceBundle.getText(key);

		},
		/**
		 * Convenience method to get global property
		 * @public
		 * * @param {string} property
		 */
		getGlobalProperty: function (property) {
			return this.getGlobalModel().getProperty("/" + property + "");

		},
		/**
		 * Convenience method to set global property
		 * @public
		 * * @param {string} property
		 * * @param {string} sValue
		 */
		setGlobalProperty: function (property, sValue) {
			return this.getGlobalModel().setProperty("/" + property + "", sValue);

		},
		//**********************************************************************************************
		//THESE METHODS ARE USED IN ODATASERVICE LIBRARY
		//**********************************************************************************************
		/**
		 * Convenience method to get View property
		 * @public
		 * */
		getViewProperties: function () {
			var sCurrentScrnName = this.getCurrentScrn();
			return this.getScreenModel(sCurrentScrnName);
		},
		/**
		 * Convenience method to get entity set property
		 * @public
		 * */
		getEntitySet: function () {
			var viewProperties = this.getViewProperties();
			return viewProperties.entitySet;
		},
		/**
		 * Convenience method to get modelname property
		 * @public
		 * */
		getModelName: function () {
			var viewProperties = this.getViewProperties();
			return viewProperties.modelName;
		},
		/**
		 * Convenience method to get Filterfields property
		 * @public
		 * */
		getFilterFields: function () {
			var viewProperties = this.getViewProperties();
			return viewProperties.filters;
		},
		/**
		 * Convenience method to get Filterfields property
		 * @public
		 * */
		getddFilterFields: function () {
			var viewProperties = this.getViewProperties();
			return viewProperties.dropDownFilters;
		},
		getNoteFilterFields: function () {
			var viewProperties = this.getViewProperties();
			return viewProperties.notifyUpdate;
		},
		getFilterFieldsById: function (oFilterName) {
			var viewProperties = this.getViewProperties();
			return viewProperties.coinFilter;
		},
		/**
		 * Convenience method to get url parameters like $select/#expand property
		 * @public
		 * */
		getUrlParameters: function () {
			var viewProperties = this.getViewProperties();
			return viewProperties.urlParameters;
		},
		/**
		 * Convenience method to get keyFields property
		 * @public
		 * */
		getKeyFields: function () {
			var properties = this.getViewProperties();
			return properties.keyFields;
		},
		/**
		 * Convenience method to get ChildScreen property of the view
		 * @public
		 * */
		getChildScreens: function () {
			var properties = this.getViewProperties();
			return properties.childScreens;
		},
		/**
		 * Convenience method to get Parent screen property of the view
		 * @public
		 * */
		getParentScreen: function () {
			var properties = this.getViewProperties();
			return properties.parentScreen;
		},
		/**
		 * Convenience method to get Page Title property of the view
		 * @public
		 * */
		getPageTitle: function () {
			var properties = this.getViewProperties();
			return properties.pageTitle;
		},
		/**
		 * Convenience method to get Update toast property of the view
		 * @public
		 * */
		getUpdateToast: function () {
			var properties = this.getViewProperties();
			return properties.toastMsg;
		}

		//************End

	});

});