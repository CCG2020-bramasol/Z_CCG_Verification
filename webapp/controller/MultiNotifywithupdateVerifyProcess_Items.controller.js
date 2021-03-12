sap.ui.define([
	"ccg/Verification/controller/BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox"
], function (BaseController, MessageToast, Filter, FilterOperator, BusyIndicator, MessageBox) {
	"use strict";

	return BaseController.extend("ccg.Verification.controller.VerifyProcess_Items", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ccg.Verification.view.Idoc_Items
		 */
		onInit: function () {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table1");

			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();

			this._oSelectValue = "";
			this._oTableModel = "";
			this._selectedIndex = 0;

			console.log("Default Odata Model-Second Scrn", this.getOwnerComponent().getModel());

			this.getRouter().getRoute("verifyprocessitems").attachPatternMatched(this._onObjectMatched, this);

			this._acoins_All = this.getGlobalModel().getProperty("/aCoin_All");
			//this._yearModel = this.getGlobalModel().getProperty("/yearModel");

			this._aCoin_Year = this.getGlobalModel().getProperty("/aCoin_Year");
			this._aCoin_MintMark = this.getGlobalModel().getProperty("/aCoin_MintMark");
			this._aCoin_Denimin = this.getGlobalModel().getProperty("/aCoin_Denimin");
			this._aCoin_Proofmint = this.getGlobalModel().getProperty("/aCoin_Proofmint");
			this._aCoin_Variety = this.getGlobalModel().getProperty("/aCoin_Variety");

		},
		_onObjectMatched: function (oEvent) {
			this._sInvoice = oEvent.getParameter("arguments").objectId;
			this._sSales = oEvent.getParameter("arguments").salesid;
			console.log("objectid: ", this._sInvoice);
			console.log("sales id:", this._sSales);
			this.GetServerData(this._sInvoice, this._sSales);
		},
		onAfterRendering: function () {},

		GetServerData: function (mInvoiceNo, mSalDocNo) {
			sap.ui.core.BusyIndicator.show(0);
			var whenOdataCall = this.callOdataService().getInvoiceHeaderItems(this, mInvoiceNo, mSalDocNo); // odata function call with input field to get response from backend
			//	var whenOdataCall = this.callOdataService().getInvoiceHeaderItems(this, mSalDocNo); // odata function call with input field to get response from backend
			whenOdataCall.done(function (oResult) {
				//this.getGlobalModel().setProperty("/mainviewModel", this.getModel("invoiceHeaderModel"));
				console.log("Invoice Header Model", this.getModel("invoiceHeaderModel").getProperty("/aItems/"));
				//Invoice_HeaderSet('')
				this.getModel("invoiceHeaderModel").setProperty("/aItems/1/Nav_header_detail/year", this._aCoin_Year);
				this.getModel("invoiceHeaderModel").setProperty("/aItems/1/Nav_header_detail/mintmark", this._aCoin_MintMark);
				this.getModel("invoiceHeaderModel").setProperty("/aItems/1/Nav_header_detail/denim", this._aCoin_Denimin);
				this.getModel("invoiceHeaderModel").setProperty("/aItems/1/Nav_header_detail/proof", this._aCoin_Proofmint);
				this.getModel("invoiceHeaderModel").setProperty("/aItems/1/Nav_header_detail/variety", this._aCoin_Variety);

				var tempArray = this.getModel("invoiceHeaderModel").getProperty("/aItems");

				console.log("temp array", tempArray);
				// var tempArray1 = sap.ui.getCore().getModel("yearModel").getProperty("/aItems");
				// console.log("temp array", tempArray1);

				//var iPath = "invoiceHeaderModel>/aItems/1/Nav_header_detail/results";
				//var sPath = "invoiceHeaderModel>/aItems/0";

				var sPath = "/Invoice_HeaderSet('" + this._sInvoice + "')";
				this.getView().bindElement({
					path: sPath,
					// events: {
					// 	change: this._onBindingChange.bind(this)
					// }
				});

				this.oSemanticPage = this.byId("mySemanticPage");
				this.oSemanticPage.bindElement({
					path: sPath
				});

				this._bindView(sPath);
				// console.log("sem model", this.oSemanticPage.getModel());
				// console.log("item model", this.getView().getModel());
				var oTable = this.byId("table1")
				oTable.setBusy(false);
				sap.ui.core.BusyIndicator.hide();
			}.bind(this));
		},

		//**************GRid table****************************
		// //*******************************************************

		onSwitchChange: function (oEvent) {
			var oTable = this.byId("table1");
			oTable.setEnableSelectAll(oEvent.getParameter("state"));
		},
		// creatNotification: function (oEvent) {
		// 	var oTable = this.byId("table1");
		// 	var mSelectedRow = oTable.getSelectedIndex();
		// 	var mCount = oTable.getSelectedIndex() + 1;
		// 	var sText = "Confirm Notification for Item No.:" + mCount + "?";
		// 	var itemPath = "/aItems/1/Nav_header_detail/results/" + mSelectedRow;
		// 	itemPath = "/aItems/1/Nav_header_detail/results"
		// 	var itemArray = this.getView().getModel("invoiceHeaderModel").getProperty(itemPath);
		// 	this.showBusyIndicator(5000, 0);

		// 	var sMsg;
		// 	if (mSelectedRow < 0) {
		// 		sMsg = "No item selected";
		// 		MessageToast.show(sMsg);
		// 	} else {

		// 		console.log("Final Model to send", itemArray);
		// 		var VerficationObj = {};
		// 		VerficationObj.Invoice_num = this._sInvoice;
		// 		VerficationObj.Sales_doc = this._sSales;
		// 		VerficationObj.Nav_header_detail = itemArray;

		// 		var whenOdataCall = this.callOdataService().postInvoiceHeader(this, VerficationObj);
		// 		// odata function call with post to get response from backend
		// 		whenOdataCall.done(function (oResult) {
		// 			console.log("Create Response", oResult);
		// 			this.getGlobalModel().setProperty("/notifynumber", oResult["Notifiction_Num"]);

		// 			MessageToast.show("Notification Number Created :" + oResult["Notifiction_Num"]);
		// 		}.bind(this));
		// 	}

		// },
		creatMultiItemNotification: function (oEvent) {
			var oTable = this.byId("table1");
			var mSelectedRow = oTable.getSelectedIndices();
			var mCount = oTable.getSelectedIndex() + 1;
			var sText = "Do you want create notification for selected Item(s)?";
			var that = this;
			var sMsg;
			if (mSelectedRow.length < 1) {
				sMsg = "No Item Selected";
				MessageToast.show(sMsg);
			} else {
				MessageBox.confirm(sText, {
					title: "Confirmation?",
					initialFocus: sap.m.MessageBox.Action.OK,
					onClose: function (sButton) {
						if (sButton === MessageBox.Action.OK) {
							sap.ui.core.BusyIndicator.show(0);
							this._itemArray = [];
							var itemPath = "";
							console.log("Invoice Header Model", that.getModel("invoiceHeaderModel"));

							for (var inx = 0; inx < mSelectedRow.length; inx++) {
								itemPath = "/aItems/1/Nav_header_detail/results/" + mSelectedRow[inx];
								this._itemArray[inx] = that.getView().getModel("invoiceHeaderModel").getProperty(itemPath);
							}
							console.log("Selected Items for Notification", this._itemArray);
							var VerficationObj = {};
							VerficationObj.Invoice_num = that._sInvoice;
							VerficationObj.Sales_doc = that._sSales;
							VerficationObj.Nav_header_detail = this._itemArray;

							var whenOdataCall = that.callOdataService().postInvoiceHeader(that, VerficationObj);
							// odata function call with post to get response from backend
							whenOdataCall.done(function (oResult) {
								console.log("Create Response", oResult);
								if (oResult["Notifiction_Num"] !== "") {
									that.getGlobalModel().setProperty("/notifynumber", oResult["Notifiction_Num"]);
									var mNotification = oResult["Notifiction_Num"];
									this._itemArray = [];
									console.log("Invoice Header Model", that.getModel("invoiceHeaderModel"));
									//Update Notification Number to Backend
									for (var inx1 = 0; inx1 < mSelectedRow.length; inx1++) {
										itemPath = "/aItems/1/Nav_header_detail/results/" + mSelectedRow[inx1];
										this._itemArray[inx1] = that.getView().getModel("invoiceHeaderModel").getProperty(itemPath);
									}

									console.log("Selected Items for Notification", this._itemArray);
									var notificationObj = {};
									notificationObj.Notifiction_Update = mNotification;
									notificationObj.Invoice_num = that._sInvoice;
									notificationObj.Sales_doc = that._sSales;
									notificationObj.Nav_header_detail = this._itemArray;
									//Update Notification backto backend
									var whenOdataupdateCall = that.callOdataService().postNotificationNo(that, notificationObj);
									whenOdataupdateCall.done(function (oResult) {
										console.log("Notifi Update Response", oResult);
										if (oResult["Notifiction_Num"] !== "") {
											MessageToast.show("Notification Number Created:" + oResult["Notifiction_Num"]);
										} else {
											MessageToast.show("Notification Number Not Created");
										}

										sap.ui.core.BusyIndicator.hide();
									}.bind(that));
								} else {
									MessageToast.show("Could not create notification!");
								}

							}.bind(that));

						};
					}
				});
			}
		},

		creatNotification: function (oEvent) {
			var oTable = this.byId("table1");
			var mSelectedRow = oTable.getSelectedIndex();
			var mCount = oTable.getSelectedIndex() + 1;
			var sText = "Do you want create notification for selected Item(s)?";
			var that = this;
			var sMsg;
			if (mSelectedRow < 0) {
				sMsg = "No Item Selected";
				MessageToast.show(sMsg);
			} else {
				MessageBox.confirm(sText, {
					title: "Confirmation?",
					initialFocus: sap.m.MessageBox.Action.OK,
					onClose: function (sButton) {
						if (sButton === MessageBox.Action.OK) {
							sap.ui.core.BusyIndicator.show(0);
							var itemPath = "/aItems/1/Nav_header_detail/results/" + mSelectedRow;
							itemPath = "/aItems/1/Nav_header_detail/results"
							var itemArray = that.getView().getModel("invoiceHeaderModel").getProperty(itemPath);
							console.log("Final Model to send", itemArray);
							var VerficationObj = {};
							VerficationObj.Invoice_num = that._sInvoice;
							VerficationObj.Sales_doc = that._sSales;
							VerficationObj.Nav_header_detail = itemArray;

							var whenOdataCall = that.callOdataService().postInvoiceHeader(that, VerficationObj);
							// odata function call with post to get response from backend
							whenOdataCall.done(function (oResult) {
								console.log("Create Response", oResult);
								that.getGlobalModel().setProperty("/notifynumber", oResult["Notifiction_Num"]);
								var mNotification = oResult["Notifiction_Num"];
								var notificationObj = {};
								notificationObj.Notifiction_Update = mNotification;
								notificationObj.Invoice_num = that._sInvoice;
								notificationObj.Sales_doc = that._sSales;
								//Update Notification backto backend
								var whenOdataupdateCall = that.callOdataService().updateNotification(that, notificationObj);
								whenOdataupdateCall.done(function (oResult) {
									console.log("Notifi Update Response", oResult);
									if (oResult.getData().aItems.length > 0) {
										MessageToast.show("Notification Created Successfully");
									} else {
										MessageToast.show("Notification Create Failed!");
									}
									sap.ui.core.BusyIndicator.hide();
								}.bind(that));

							}.bind(that));

						};
					}
				});
			}
		},

		getSelectedIndices: function (evt) {
			var aIndices = this.byId("table1").getSelectedIndices();
			var sMsg;
			if (aIndices.length < 1) {
				sMsg = "no item selected";
			} else {
				sMsg = aIndices;
			}

			MessageToast.show(sMsg);

		},
		getCoinInfo: function (oEvent) {
			var oTable = this.byId("table1");
			//Get Coin Button Click Index
			var iIndex = oEvent.getSource().getParent().getIndex(); //oTable.getSelectedIndex();
			var sMsg;

			var _oTableModel = oTable.getContextByIndex(iIndex).getModel();
			var _oSelectValue = oTable.getContextByIndex(iIndex).getModel().getData().aItems[1].Nav_header_detail.results[iIndex];
			console.log("selected value", _oSelectValue);
			console.log("conintablearr", this._acoins_All);
			var yr = _oSelectValue["NG_YEAR"];
			var mm = _oSelectValue["NG_MINTMARK"];
			var de = _oSelectValue["NG_DENOMIN"];
			var pr = _oSelectValue["NG_PROOFMINT"];
			var va = _oSelectValue["NG_VARIETY"];

			var _mCoinNo = "";
			var _mValueSum = "";
			sap.ui.core.BusyIndicator.show(0);
			var whenOdataupdateCall = this.callOdataService().getCoinDetails(this, yr, mm, de, pr, va);
			whenOdataupdateCall.done(function (oResult) {
				console.log("Coin request response", oResult);
				if (oResult.getData().aItems.length > 0) {
					var _mCoinNo = oResult.getData().aItems[0]["NG_COIN_NO"];
					var _mValueSum = oResult.getData().aItems[0]["NG_VALUE_SUM"];
					_oSelectValue["NG_COIN_NO"] = _mCoinNo;
					_oSelectValue["NG_VALUE_SUM"] = _mValueSum;
					sMsg = "Coin #" + _mCoinNo + " Fetched";
				} else {
					sMsg = "No Coin# Found!";
				}
				MessageToast.show(sMsg);
				oTable.getContextByIndex(iIndex).getModel().refresh(true);
				oTable.clearSelection();

				sap.ui.core.BusyIndicator.hide();
			}.bind(this));

		},
		//********OLD Logic code to be removed************************
		olllllcoinButtonClick: function (oEvent) {
			//var oTable = this.byId("table1");
			var iIndex = oEvent.getSource().getParent().getIndex(); //oTable.getSelectedIndex();
			var sMsg;

			var _oTableModel = oTable.getContextByIndex(iIndex).getModel();
			var _oSelectValue = oTable.getContextByIndex(iIndex).getModel().getData().aItems[1].Nav_header_detail.results[iIndex];
			console.log("selected value", _oSelectValue);
			console.log("conintablearr", this._acoins_All);

			// for(var i=0; i<=this._acoins_All.length; i++){

			// }
			var yr = _oSelectValue["NG_YEAR"];
			var mm = _oSelectValue["NG_MINTMARK"];
			var de = _oSelectValue["NG_DENOMIN"];
			var pr = _oSelectValue["NG_PROOFMINT"];
			var va = _oSelectValue["NG_VARIETY"];

			var _mCoinNo = "";
			var _mValueSum = "";
			this._acoins_All.forEach(function (item) {
				if (item.NG_YEAR == yr && item.NG_MINTMARK == mm && item.NG_DENOMIN == de && item.NG_PROOFMINT == pr && item.NG_VARIETY == va) {
					_mCoinNo = item.NG_COIN_NO;
					_mValueSum = item.NG_VALUE_SUM;

				}
			});
			_oSelectValue["NG_COIN_NO"] = _mCoinNo;
			_oSelectValue["NG_VALUE_SUM"] = _mValueSum;
			oTable.getContextByIndex(0).getModel().refresh(true);
			oTable.clearSelection();
			if (_mCoinNo !== "") {
				sMsg = "Coin #" + _mCoinNo + " Fetched";
			} else {
				sMsg = "No Coin # Found";
			}
			console.log("Updated Invoice Header Model", this.getModel("invoiceHeaderModel"));

			MessageToast.show(sMsg);
		},

		clearSelection: function (evt) {
			this.byId("table1").clearSelection();
		},

		formatAvailableToObjectState: function (bAvailable) {
			return bAvailable ? "Success" : "Error";
		},

		formatAvailableToIcon: function (bAvailable) {
			return bAvailable ? "sap-icon://accept" : "sap-icon://decline";
		},

		handleDetailsPress: function (oEvent) {
			MessageToast.show("Details for product with id " + this.getView().getModel().getProperty("ProductId", oEvent.getSource().getBindingContext()));
		},

		// onChange update valueState of input
		onCoinChange: function (oEvent) {
			var oInput = oEvent.getSource();
			//var sMessage = oInput.getValue() + oInput.getId().substring(72, oInput.getId().length);
			var sMessage = oInput.getSelectedItem().getText();
		},

		//* Binds the view to the object path.
		//* @function
		//* @param {string} sObjectPath path to the object to be bound
		//* @private
		//*/
		_bindView: function (sObjectPath) {
			var oViewModel = this.getModel("invoiceHeaderModel"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oDataModel.metadataLoaded().then(function () {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},
		_onBindingChange: function () {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

		},
		hideBusyIndicator: function () {
			BusyIndicator.hide();
		},

		showBusyIndicator: function (iDuration, iDelay) {
			BusyIndicator.show(iDelay);

			if (iDuration && iDuration > 0) {
				if (this._sTimeoutId) {
					clearTimeout(this._sTimeoutId);
					this._sTimeoutId = null;
				}

				this._sTimeoutId = setTimeout(function () {
					this.hideBusyIndicator();
				}.bind(this), iDuration);
			}
		},
		destroy: function () {

			if (this.oRouteHandler) {

				this.oRouteHandler.destroy();

			}

			sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);

		},
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ccg.Verification.view.Idoc_Items
		 */
		onExit: function () {
			this.destroy();
		}

		//
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ccg.Verification.view.Idoc_Items
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ccg.Verification.view.Idoc_Items
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ccg.Verification.view.Idoc_Items
		 */
		//	onExit: function() {
		//
		//	}

	});

});