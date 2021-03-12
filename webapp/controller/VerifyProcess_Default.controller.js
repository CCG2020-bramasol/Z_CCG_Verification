sap.ui.define([
	"ccg/Verification/controller/BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox",
	'sap/ui/core/Core',
	'sap/ui/core/library',
	'sap/ui/core/message/ControlMessageProcessor',
	'sap/ui/core/message/Message',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessagePopover',
	'sap/m/MessagePopoverItem',
	"sap/ui/core/Fragment"

], function (BaseController, MessageToast, Filter, FilterOperator, BusyIndicator, MessageBox, Core, coreLibrary, ControlMessageProcessor,
	Message, Controller, JSONModel, MessagePopover, MessagePopoverItem, Fragment) {
	"use strict";

	var MessageType = coreLibrary.MessageType;
	var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";

	return BaseController.extend("ccg.Verification.controller.VerifyProcess_Default", {

		onInit: function () {
			var oMessageProcessor = new ControlMessageProcessor(),
				oMessageManager = Core.getMessageManager();
			this.verifyCoin = 0;
			this.verifyValue = 0.00;
			this.currentIndex = "";

			// this.oModel = new JSONModel();
			// this.oModel.loadData(sap.ui.require.toUrl("ccg/Verification/model/model.json"), null, false);
			// this.oSemanticPage = this.byId("mySemanticPage");
			// this.oEditAction = this.byId("editAction");
			// this.oSemanticPage.setModel(this.oModel);

			oMessageManager.registerMessageProcessor(oMessageProcessor);
			oMessageManager.addMessages(
				new Message({
					message: "Something wrong happened",
					type: MessageType.Error,
					processor: oMessageProcessor
				})
			);

			//Added for setfocus
			this.attachAfterShow(this.onAfterShow);

			this._oView = this.getView();
			this._oView.addEventDelegate({
				// onBeforeHide: function (oEvent) {
				// 	debugger;
				// },

				// onAfterHide: function (oEvent) {
				// 	debugger;
				// },

				// onAfterRendering: function (oEvent) {
				// 	debugger;
				// }
			}, this)

			// var oInput = new sap.m.Input({
			// 		id: "txtCustRefNumber"
			// 	})
			// 	.addEventDelegate({
			// 		onAfterRendering: function () {
			// 			oInput.focus();
			// 		}
			// 	});

		},

		onAfterRendering: function () {
			// $('document').ready(function () {
			// 	// sap.ui.getCore().byId('txtCustRefNumber').focus();

			// 	$("#txtCustRefNumber").focus();
			// });

			//Call All Dropdown Sets
			this.dropDownSets();
		},
		//************************************************************
		//*******Added for Autofocus***********************************
		//*************************************************************
		attachAfterShow: function (onAfterShow) {
			this._afterShowDelegate = {
				onAfterShow
			};
			this.getView().addEventDelegate(this._afterShowDelegate, this);
		},

		onAfterShow: function () {
			jQuery.sap.delayedCall(500, this, function () {
				this.getView().byId("txtCustRefNumber").focus();
			});
		},

		onExit: function () { // detach delegates
			this.getView().removeEventDelegate(this._afterShowDelegate);
			this._afterShowDelegate = null;
		},
		//********************************************************
		//****************Autofocus End********************************************
		//***************************************************************
		// onSuggest: function (oEvent) {
		// 	var sTerm = oEvent.getParameter("suggestValue");
		// 	var aFilters = [];
		// 	if (sTerm) {
		// 		aFilters.push(new Filter("CharVal", FilterOperator.StartsWith, sTerm));
		// 	}

		// 	oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
		// },

		// onSuggestLabel: function (oEvent) {
		// 	var sTerm = oEvent.getParameter("suggestValue");
		// 	var aFilters = [];
		// 	if (sTerm) {
		// 		aFilters.push(new Filter("ZngcReceivingLabelsCode", FilterOperator.StartsWith, sTerm));
		// 	}

		// 	oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
		// },
		// onSuggestCore: function (oEvent) {
		// 	var sTerm = oEvent.getParameter("suggestValue");
		// 	var aFilters = [];
		// 	if (sTerm) {
		// 		aFilters.push(new Filter("ZngcReceivingCoresCode", FilterOperator.StartsWith, sTerm));
		// 	}

		// 	oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
		// },

		dropDownSets: function () {
			this.getDropDownSet("/ZPROOFMINTSet", "aCoin_MintMark");
			this.getDropDownSet("/ZRECEVING_CORESet", "aCoin_Core");
			this.getDropDownSet("/ZRECEVING_LABELSet", "aCoin_Label");
			//this.getDropDownSet("/ZSTRIKECHARSet", "");
		},
		BuildArrayFromJsonModel: function (mArrayName, mModelName) {
			var mTempArray = [];
			mTempArray = sap.ui.getCore().getModel(mModelName).getProperty("/aItems");
			this.getGlobalModel().setProperty("/" + mArrayName, mTempArray);
		},

		getDropDownSet: function (mDropDownSet, mOutputArray) {
			sap.ui.core.BusyIndicator.show(0);
			var whenOdataCall = this.callOdataService().getMasterTable(this, mDropDownSet, "dropDownModel"); // odata function call with input field to get response from backend
			whenOdataCall.done(function (oResult) {
				console.log("Dropdown results", oResult);
				this.BuildArrayFromJsonModel(mOutputArray, "dropDownModel");
				sap.ui.core.BusyIndicator.hide();
			}.bind(this));

		},

		toUpperCase: function (oEvent) {
			console.log(oEvent);
		},

		lookupBtnPress: function (oEvent) {
			this.onShowTextInfo("lookup");
		},

		onChange: function (oEvent) {
			this.GetServerData("5000149")
				//this.GetServerData(this.getView().byId("txtCustRefNumber").getValue());
				//this.getView().byId("txtCustRefNumber").setValue("");
		},

		onShowTextInfo: function (oMsg) {
			MessageBox.information(oMsg, {
				title: "Information",
				id: "messageBoxId1",
				details: "Coin Value can not be greater than net value.",
				contentWidth: "100px",
				styleClass: sResponsivePaddingClasses
			});
		},
		onCopyPress: function (oEvent) {
			var oTable = this.getView().byId("tblCoinItems");
			//Get Coin Button Click Index
			var mTotalItems = this.getModel("SOHeaderModel").getProperty("/aItems/0/LINE_ITEM");
			//var mArry = oTable.getSelectedContexts()[0].sPath.split("/");
			//var mCopiedRow = parseInt(mArry[5]);

			var mSelectRowArry = oTable.getSelectedItems();
			if (mSelectRowArry.length > 0) {
				var mSourceItem = 0;
				var _oCopyValue;
				var mCopiedRow = 0;
				var mSourceFlag = new sap.ui.model.type.Boolean();
				mSourceFlag = false;
				//	console.log("selected row count", mSelectRowArry);

				for (var item = 0; item < mSelectRowArry.length; item++) {
					mSourceItem = oTable.getSelectedItems()[item]["sId"].split("-");
					mSourceItem = parseInt(mSourceItem[8]);

					_oCopyValue = this.getModel("SOHeaderModel").getData().aItems[0].HEADERITEMS.results[mSourceItem];

					for (var key of Object.keys(_oCopyValue)) {
						if (key == "NG_YEAR" || key == "NG_MINTMARK" || key == "NG_ZDENOM" || key == "NG_COINNUMBER" || key == "NG_COINVALUERECEIVED") {
							if (_oCopyValue[key].length !== 0) {
								mCopiedRow = mSourceItem;
								mSourceFlag = true;
								break;
							}
						}
					}
					if (mSourceFlag == true) {
						break;
					}
				}

				_oCopyValue = this.getModel("SOHeaderModel").getData().aItems[0].HEADERITEMS.results[mCopiedRow];

				for (var item = 0; item < mSelectRowArry.length; item++) {
					console.log("selected items", oTable.getSelectedItems());
					mSourceItem = oTable.getSelectedItems()[item]["sId"].split("-");

					mSourceItem = parseInt(mSourceItem[8]);

					//	console.log("model", this.getModel("SOHeaderModel").getData().aItems[0].HEADERITEMS.results);

					if (item !== mCopiedRow) {
						var _oPastValue = this.getModel("SOHeaderModel").getData().aItems[0].HEADERITEMS.results[mSourceItem];
						// Copy object 
						for (var key of Object.keys(_oCopyValue)) {
							if (key !== "NG_SERIALNUMBER") { // && key !="EQUNR" && key !="KDAUF"  && key !="KDPOS"  && key !="__metadata"  && key !="<prototype>") {
								_oPastValue[key] = _oCopyValue[key];
								//	console.log("copy" + key + " => " + _oCopyValue[key] + "</br>")
								//	console.log("past" + key + " => " + _oPastValue[key] + "</br>")
							}

						}
					}
				}
				oTable.removeSelections(true);
				this.getModel("SOHeaderModel").refresh(true);
			}
		},

		onValueChange: function (oEvent) {
			var oTable = this.getView().byId("tblCoinItems");
			var mArry = oEvent.getSource().getId().split("-");
			var iIndex = mArry[mArry.length - 1];
			var sMsg;
			this.verifyValue = 0;
			var mZINSURACE_LIMIT = this.getModel("SOHeaderModel").getProperty("/aItems/0/ZINSURACE_LIMIT");
			var mTotalItems = this.getModel("SOHeaderModel").getProperty("/aItems/0/LINE_ITEM");
			for (var row = 0; row < mTotalItems; row++) {
				var _oSelectValue = this.getModel("SOHeaderModel").getData().aItems[0].HEADERITEMS.results[row];
				var mVerified = _oSelectValue["NG_COINVALUERECEIVED"];
				if (mVerified == "") {
					mVerified = 0;
				}
				this.verifyValue = parseFloat(parseInt(this.verifyValue) + parseInt(mVerified)).toFixed(2);

			}
			if (parseInt(this.verifyValue) > parseInt(mZINSURACE_LIMIT)) {
				this.onShowTextInfo("Verified value is greater than Record Value");
			}
			this.getModel("SOHeaderModel").setProperty("/aItems/0/VERIFIED", this.verifyValue);

			this.getModel("SOHeaderModel").refresh(true);

		},

		GetServerData: function (mSalDocNo) {
			sap.ui.core.BusyIndicator.show(0);
			var whenOdataCall = this.callOdataService().getInvoiceHeaderItems(this, mSalDocNo, mSalDocNo); // odata function call with input field to get response from backend
			//	var whenOdataCall = this.callOdataService().getInvoiceHeaderItems(this, mSalDocNo, mInvoiceNo); // odata function call with input field to get response from backend
			whenOdataCall.done(function (oResult) {
				if (oResult.getData().aItems.length !== 0) {
					//this.getGlobalModel().setProperty("/mainviewModel", this.getModel("invoiceHeaderModel"));
					//console.log("Invoice Header Model", this.getModel("invoiceHeaderModel").getProperty("/aItems/"));

					this.getModel("SOHeaderModel").setProperty("/aItems/0/COIN_VERIFIED", "0");
					this.getModel("SOHeaderModel").setProperty("/aItems/0/VERIFIED", "0.00");

					this._aCoin_MintMark = this.getGlobalModel().getProperty("/aCoin_MintMark");
					this._aCoin_Core = this.getGlobalModel().getProperty("/aCoin_Core");
					this._aCoin_Label = this.getGlobalModel().getProperty("/aCoin_Label");
					// this.getModel("invoiceHeaderModel").setProperty("/aItems/1/Nav_header_detail/year", this._aCoin_Year);
					this.getModel("SOHeaderModel").setProperty("/aItems/0/HEADERITEMS/mintmark", this._aCoin_MintMark);
					this.getModel("SOHeaderModel").setProperty("/aItems/0/HEADERITEMS/core", this._aCoin_Core);
					this.getModel("SOHeaderModel").setProperty("/aItems/0/HEADERITEMS/label", this._aCoin_Label);
					console.log("Invoice Header Model", this.getModel("SOHeaderModel"));

					var sPath = "SOHeaderModel>/aItems/0";
					this.getView().bindElement({
						path: sPath,
					});

				} else {

					MessageToast.show("No notification found!");
					// call the parent's onNavBack
					//	BaseController.prototype.onNavBack.apply(this, arguments);
				}
				sap.ui.core.BusyIndicator.hide();
			}.bind(this));
		},

		onCoinSearch: function () {
			var yr = this.getView().byId("txtYear").getValue().toUpperCase();
			var mm = this.getView().byId("txtMintMark").getValue().toUpperCase();
			var de = this.getView().byId("txtDenomination").getValue().toUpperCase();
			var pr = this.getView().byId("txtProofMint").getValue().toUpperCase();
			var cn = ""; //Not required

			var _mCoinNo = "";
			var _mValueSum = "";
			sap.ui.core.BusyIndicator.show(0);
			var whenOdataupdateCall = this.callOdataService().getCoinDetails(this, yr, mm, de, pr, cn);
			whenOdataupdateCall.done(function (oResult) {
				console.log("Coin request response", oResult);
				this.getView().setModel(sap.ui.getCore().getModel("CoinModel"), "CoinResultModel");

				console.log("responsemodel", this.getModel("CoinResultModel"));

				// if (oResult.getData().aItems.length > 0) {
				// 	cn = oResult.getData().aItems[0]["zzcoin"];
				// 	yr = oResult.getData().aItems[0]["zzyear"];
				// 	mm = oResult.getData().aItems[0]["zzmintmark"];
				// 	de = oResult.getData().aItems[0]["zzdenomination"];
				// 	pr = oResult.getData().aItems[0]["zzproofmint"];

				// 	_oSelectValue["NG_COINNUMBER"] = cn;
				// 	_oSelectValue["NG_YEAR"] = yr;
				// 	_oSelectValue["NG_MINTMARK"] = mm;
				// 	_oSelectValue["NG_ZDENOM"] = de;
				// 	_oSelectValue["NG_PROOFMINT"] = pr;

				// 	//	MessageToast.show("Coin #" + cn + " Fetched");

				// 	this.getModel("SOHeaderModel").refresh(true);
				// }

				this.showCoinResultDialog();

				this.getView().byId("txtYear").setValue("");
				this.getView().byId("txtMintMark").setValue("");
				this.getView().byId("txtDenomination").setValue("");
				this.getView().byId("txtProofMint").setValue("");

				sap.ui.core.BusyIndicator.hide();

			}.bind(this));
		},

		getCoinInfo: function (oEvent) {
			var oTable = this.getView().byId("tblCoinItems");
			//Get Coin Button Click Index
			var mArry = oEvent.getSource().getId().split("-");
			var iIndex = mArry[mArry.length - 1];

			if (this.currentIndex !== iIndex) {
				this.currentIndex = iIndex;
				//Increase verification count
				this.verifyCoin = this.verifyCoin + 1;
				this.getModel("SOHeaderModel").setProperty("/aItems/0/COIN_VERIFIED", this.verifyCoin);
			}

			//var _oTableModel = oTable.getContextByIndex(iIndex).getModel();
			//var _oSelectValue = oTable.getContextByIndex(iIndex).getModel().getData().aItems[0].HEADERITEMS.results[iIndex];

			//console.log("selected value", _oSelectValue);
			//console.log("conintablearr", this._acoins_All);
			//ZMMV_C_CDS_COIN_VIEW?$filter=zzyear eq '1986' and zzsecondsort eq '0006000' 
			var mValueRec = this.getModel("SOHeaderModel").getProperty("/aItems/0/ZINSURACE_LIMIT");
			var mCoins = this.getModel("SOHeaderModel").getProperty("/aItems/0/LINE_ITEM");
			//var mVerified = parseFloat(mValueRec / mCoins).toFixed(2);
			//this.getModel("SOHeaderModel").setProperty("/aItems/0/VERIFIED", mVerified);

			//var oFloatFormat = NumberFormat.getFloatInstance();
			//oFloatFormat.parse(mVerified); // returns 1234.567

			var _oSelectValue = this.getModel("SOHeaderModel").getData().aItems[0].HEADERITEMS.results[iIndex];
			var yr = _oSelectValue["NG_YEAR"].toUpperCase();
			var mm = _oSelectValue["NG_MINTMARK"].toUpperCase();
			var de = _oSelectValue["NG_ZDENOM"].toUpperCase();
			var pr = _oSelectValue["NG_PROOFMINT"];
			var cn = _oSelectValue["NG_COINNUMBER"]; //Not required

			var _mCoinNo = "";
			var _mValueSum = "";
			sap.ui.core.BusyIndicator.show(0);
			var whenOdataupdateCall = this.callOdataService().getCoinDetails(this, yr, mm, de, pr, cn);
			whenOdataupdateCall.done(function (oResult) {
				console.log("Coin request response", oResult);
				//this.BuildArrayFromJsonModel("aCoin_Result", "CoinModel");

				// this._aCoinResult = this.getGlobalModel().getProperty("/aCoin_Result");
				// console.log("Coin request response", this._aCoinResult);

				// this.getModel("SOHeaderModel").setProperty("/aItems/0/HEADERITEMS/coinResult", this._aCoinResult);
				// console.log("Coin request response", this.getModel("SOHeaderModel"));

				this.getView().setModel(sap.ui.getCore().getModel("CoinModel"), "CoinResultModel");

				console.log("responsemodel", this.getModel("CoinResultModel"));

				if (oResult.getData().aItems.length == 1) {
					cn = oResult.getData().aItems[0]["zzcoin"];
					yr = oResult.getData().aItems[0]["zzyear"];
					mm = oResult.getData().aItems[0]["zzmintmark"];
					de = oResult.getData().aItems[0]["zzdenomination"];
					pr = oResult.getData().aItems[0]["zzproofmint"];

					_oSelectValue["NG_COINNUMBER"] = cn;
					_oSelectValue["NG_YEAR"] = yr;
					_oSelectValue["NG_MINTMARK"] = mm;
					_oSelectValue["NG_ZDENOM"] = de;
					_oSelectValue["NG_PROOFMINT"] = pr;

					MessageToast.show("Coin #" + cn + " Fetched");

					//oTable.getContextByIndex(iIndex).getModel().refresh(true);
					//oTable.clearSelection();
					this.getModel("SOHeaderModel").refresh(true);
				}
				if (oResult.getData().aItems.length > 1) {

					this.showCoinResultDialog();
				}
				if (oResult.getData().aItems.length == 0) {
					MessageToast.show("No Coin# Found!");
				}

				sap.ui.core.BusyIndicator.hide();

			}.bind(this));

		},
		
		onCoinClick: function(mIndex) {
						console.log(mIndex, "-", this.currentIndex);
						var _oSelectedCoinValue = this.getModel("CoinResultModel").getData().aItems[mIndex];

					var cn = _oSelectedCoinValue["zzcoin"];
					var yr = _oSelectedCoinValue["zzyear"];
					var mm = _oSelectedCoinValue["zzmintmark"];
					var de =_oSelectedCoinValue["zzdenomination"];
					var pr = _oSelectedCoinValue["zzproofmint"];

				  var _oSelectValue = this.getModel("SOHeaderModel").getData().aItems[0].HEADERITEMS.results[this.currentIndex];

					_oSelectValue["NG_COINNUMBER"] = cn;
					_oSelectValue["NG_YEAR"] = yr;
					_oSelectValue["NG_MINTMARK"] = mm;
					_oSelectValue["NG_ZDENOM"] = de;
					_oSelectValue["NG_PROOFMINT"] = pr;

					MessageToast.show("Coin #" + cn + " Fetched");

					//oTable.getContextByIndex(iIndex).getModel().refresh(true);
					//oTable.clearSelection();
					this.getModel("SOHeaderModel").refresh(true);
						
		},

		showCoinResultDialog: function () {
			var that = this;
			sap.ui.core.BusyIndicator.show(0);
			// create dialog lazily
			if (!this.byId("coinLookupDialog")) {
				var oFragmentController = {
					onCloseDialog: function () {
						that.byId("coinLookupDialog").close();
					},
					onSearchDialog: function () {
						that.onCoinSearch();
						that.byId("coinLookupDialog").close();
					},
					onLinkPressDialog: function (oEvent) {
						var mArry = oEvent.getSource().getId().split("-");
						var iIndex = mArry[mArry.length - 1];
						that.onCoinClick(iIndex);
						
						that.byId("coinLookupDialog").close();
					}

				};
				// load asynchronous XML fragment
				Fragment.load({
					id: that.getView().getId(),
					name: "ccg.Verification.view.fragment.CoinLookup",
					controller: oFragmentController
				}).then(function (oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
					that.getView().addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("coinLookupDialog").open();
			}
			sap.ui.core.BusyIndicator.hide();

		},

		//***************************************************************************************************
		onMessagesButtonPress: function (oEvent) {
			var oMessagesButton = oEvent.getSource();

			if (!this._messagePopover) {
				this._messagePopover = new MessagePopover({
					items: {
						path: "message>/",
						template: new MessagePopoverItem({
							description: "{message>description}",
							type: "{message>type}",
							title: "{message>message}"
						})
					}
				});
				oMessagesButton.addDependent(this._messagePopover);
			}
			this._messagePopover.toggle(oMessagesButton);
		},

		onPedigree: function () {
			this.showFooter(true);
			this.oEditAction.setVisible(false);
		},

		showFooter: function (bShow) {
				this.oSemanticPage.setShowFooter(bShow);
			}
			// /**
			// 	 * Called when a controller is instantiated and its View controls (if available) are already created.
			// 	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			// 	 * @memberOf ccg.Verification.view.Idoc_Items
			// 	 */
			// 	onInit: function () {
			// 		// var oViewModel,
			// 		// 	iOriginalBusyDelay,
			// 		// 	oTable = this.byId("table1");

		// 		// iOriginalBusyDelay = oTable.getBusyIndicatorDelay();

		// 		// this._oSelectValue = "";
		// 		// this._oTableModel = "";
		// 		// this._selectedIndex = 0;

		// 		//console.log("Default Odata Model-Second Scrn", this.getOwnerComponent().getModel());

		// 	//	this.getRouter().getRoute("verifyprocessitems").attachPatternMatched(this._onObjectMatched, this);

		// 		// this._aCoin_Year = this.getGlobalModel().getProperty("/aCoin_Year");
		// 		// this._aCoin_MintMark = this.getGlobalModel().getProperty("/aCoin_MintMark");
		// 		// this._aCoin_Denimin = this.getGlobalModel().getProperty("/aCoin_Denimin");
		// 		// this._aCoin_Proofmint = this.getGlobalModel().getProperty("/aCoin_Proofmint");
		// 		// this._aCoin_Variety = this.getGlobalModel().getProperty("/aCoin_Variety");

		// 	},
		// 	_onObjectMatched: function (oEvent) {
		// 		this._sInvoice = oEvent.getParameter("arguments").objectId;
		// 		this._sSales = oEvent.getParameter("arguments").salesid;
		// 		console.log("objectid: ", this._sInvoice);
		// 		console.log("sales id:", this._sSales);
		// 		this.GetServerData(this._sInvoice, this._sSales);
		// 	},
		// 	onAfterRendering: function () {},

		// 	GetServerData: function (mInvoiceNo, mSalDocNo) {
		// 		sap.ui.core.BusyIndicator.show(0);
		// 		var whenOdataCall = this.callOdataService().getInvoiceItems(this, mSalDocNo, mInvoiceNo); // odata function call with input field to get response from backend
		// 	//	var whenOdataCall = this.callOdataService().getInvoiceHeaderItems(this, mSalDocNo, mInvoiceNo); // odata function call with input field to get response from backend
		// 		whenOdataCall.done(function (oResult) {
		// 			if (oResult.getData().aItems.length !== 0) {
		// 				//this.getGlobalModel().setProperty("/mainviewModel", this.getModel("invoiceHeaderModel"));
		// 				//console.log("Invoice Header Model", this.getModel("invoiceHeaderModel").getProperty("/aItems/"));
		// 				console.log("Invoice Header Model", this.getModel("invoiceHeaderModel"));
		// 				// this.getModel("invoiceHeaderModel").setProperty("/aItems/1/Nav_header_detail/year", this._aCoin_Year);
		// 				// this.getModel("invoiceHeaderModel").setProperty("/aItems/1/Nav_header_detail/mintmark", this._aCoin_MintMark);
		// 				// this.getModel("invoiceHeaderModel").setProperty("/aItems/1/Nav_header_detail/denim", this._aCoin_Denimin);
		// 				// this.getModel("invoiceHeaderModel").setProperty("/aItems/1/Nav_header_detail/proof", this._aCoin_Proofmint);
		// 				// this.getModel("invoiceHeaderModel").setProperty("/aItems/1/Nav_header_detail/variety", this._aCoin_Variety);

		// 				// var tempArray = this.getModel("invoiceHeaderModel").getProperty("/aItems");

		// 				// //console.log("temp array", tempArray);
		// 				// // var tempArray1 = sap.ui.getCore().getModel("yearModel").getProperty("/aItems");
		// 				// // console.log("temp array", tempArray1);

		// 				// //var iPath = "invoiceHeaderModel>/aItems/1/Nav_header_detail/results";
		// 				// //var sPath = "invoiceHeaderModel>/aItems/0";

		// 				// var sPath = "/Invoice_HeaderSet('" + this._sInvoice + "')";
		// 				// this.getView().bindElement({
		// 				// 	path: sPath,
		// 				// 	// events: {
		// 				// 	// 	change: this._onBindingChange.bind(this)
		// 				// 	// }
		// 				// });

		// 				// this.oSemanticPage = this.byId("mySemanticPage");
		// 				// this.oSemanticPage.bindElement({
		// 				// 	path: sPath
		// 				// });

		// 				var sPath = "invoiceHeaderModel>/aItems/0";
		// 				this.getView().bindElement({
		// 					path: sPath,
		// 				});

		// 				//this._bindView(sPath);
		// 				// console.log("sem model", this.oSemanticPage.getModel());
		// 				// console.log("item model", this.getView().getModel());
		// 				//var oTable = this.byId("table1")
		// 				//oTable.setBusy(false);

		// 			} else {

		// 				MessageToast.show("No notification found!");
		// 				// call the parent's onNavBack
		// 			//	BaseController.prototype.onNavBack.apply(this, arguments);

		// 			}

		// 			sap.ui.core.BusyIndicator.hide();
		// 		}.bind(this));
		// 	},

		// 	//**************GRid table****************************
		// 	// //*******************************************************

		// 	creatMultiItemNotification: function (oEvent) {
		// 		var oTable = this.byId("table1");
		// 		var mSelectedRow = oTable.getSelectedIndices();
		// 		var mCount = oTable.getSelectedIndex() + 1;
		// 		var sText = "Do you want create notification for selected Item(s)?";
		// 		var that = this;
		// 		var sMsg;
		// 		if (mSelectedRow.length < 1) {
		// 			sMsg = "No Item Selected";
		// 			MessageToast.show(sMsg);
		// 		} else {
		// 			MessageBox.confirm(sText, {
		// 				title: "Confirmation?",
		// 				initialFocus: sap.m.MessageBox.Action.OK,
		// 				onClose: function (sButton) {
		// 					if (sButton === MessageBox.Action.OK) {
		// 						sap.ui.core.BusyIndicator.show(0);
		// 						this._itemArray = [];
		// 						var itemPath = "";
		// 						//console.log("Invoice Header Model", that.getModel("invoiceHeaderModel"));
		// 						var object;
		// 						for (var inx = 0; inx < mSelectedRow.length; inx++) {
		// 							itemPath = "/aItems/1/Nav_header_detail/results/" + mSelectedRow[inx];
		// 							//this._itemArray[inx] = that.getView().getModel("invoiceHeaderModel").getProperty(itemPath);
		// 							object = that.getView().getModel("invoiceHeaderModel").getProperty(itemPath);
		// 							//this._itemArray[inx] = this.updateArray(object);
		// 							$.each(object, function (key, value) {
		// 								if (key.substring(0, 5) == "CHAR_" && value == "") {
		// 									if (key !== "CHAR_PEDIGREE" && key !== "CHAR_LABEL" && key !== "CHAR_CORE_COLOUR" && key !== "CHAR_HOLDER_TYPE") {
		// 										object[key] = "N";
		// 									}
		// 								}
		// 								if (key.substring(0, 5) == "CHAR_" && value == "true") {
		// 									object[key] = "Y";
		// 								}

		// 							});
		// 							this._itemArray[inx] = object;

		// 						}

		// 						//console.log("Selected Items for Notification", this._itemArray);
		// 						var VerficationObj = {};
		// 						VerficationObj.Invoice_num = that._sInvoice;
		// 						VerficationObj.Sales_doc = that._sSales;
		// 						VerficationObj.Nav_header_detail = this._itemArray;

		// 						var whenOdataCall = that.callOdataService().postInvoiceHeader(that, VerficationObj);
		// 						// odata function call with post to get response from backend
		// 						whenOdataCall.done(function (oResult) {
		// 							//console.log("Create Response", oResult);
		// 							if (oResult["Notifiction_Num"] !== "") {
		// 								MessageToast.show("Notification Created Successfully");
		// 							} else {
		// 								MessageToast.show("Notification Create Failed!");
		// 							}
		// 							sap.ui.core.BusyIndicator.hide();
		// 						}.bind(that));

		// 					};
		// 				}
		// 			});
		// 		}
		// 	},

		// 	updateArray: function (aObject) {
		// 		$.each(aObject, function (key, value) {
		// 			if (key.substring(0, 5) == "CHAR_" && value == "") {
		// 				if (key !== "CHAR_PEDIGREE" && key !== "CHAR_LABEL" && key !== "CHAR_CORE_COLOUR" && key !== "CHAR_HOLDER_TYPE") {
		// 					aObject[key] = "N";
		// 				}
		// 			}
		// 			if (key.substring(0, 5) == "CHAR_" && value == "true") {
		// 				aObject[key] = "Y";
		// 			}

		// 		});
		// 		return sObject;
		// 	},

		// 	getCoinInfo: function (oEvent) {
		// 		var oTable = this.byId("table1");
		// 		//Get Coin Button Click Index
		// 		var iIndex = oEvent.getSource().getParent().getIndex(); //oTable.getSelectedIndex();
		// 		var sMsg;
		// 		var _oTableModel = oTable.getContextByIndex(iIndex).getModel();
		// 		var _oSelectValue = oTable.getContextByIndex(iIndex).getModel().getData().aItems[1].Nav_header_detail.results[iIndex];
		// 		//console.log("selected value", _oSelectValue);
		// 		//console.log("conintablearr", this._acoins_All);
		// 		var yr = _oSelectValue["NG_YEAR"];
		// 		var mm = _oSelectValue["NG_MINTMARK"];
		// 		var de = _oSelectValue["NG_DENOMIN"];
		// 		var pr = _oSelectValue["NG_PROOFMINT"];
		// 		var va = ""; //Not required

		// 		var _mCoinNo = "";
		// 		var _mValueSum = "";
		// 		sap.ui.core.BusyIndicator.show(0);
		// 		var whenOdataupdateCall = this.callOdataService().getCoinDetails(this, yr, mm, de, pr, va);
		// 		whenOdataupdateCall.done(function (oResult) {
		// 			console.log("Coin request response", oResult);
		// 			if (oResult.getData().aItems.length > 0) {
		// 				var _mCoinNo = oResult.getData().aItems[0]["NG_COIN_NO"];
		// 				var _mValueSum = oResult.getData().aItems[0]["NG_VALUE_SUM"];
		// 				_oSelectValue["NG_COIN_NO"] = _mCoinNo;
		// 				_oSelectValue["NG_VALUE_SUM"] = _mValueSum;
		// 				sMsg = "Coin #" + _mCoinNo + " Fetched";
		// 			} else {
		// 				sMsg = "No Coin# Found!";
		// 			}
		// 			MessageToast.show(sMsg);
		// 			oTable.getContextByIndex(iIndex).getModel().refresh(true);
		// 			oTable.clearSelection();

		// 			sap.ui.core.BusyIndicator.hide();
		// 		}.bind(this));

		// 	},
		// 	//***************************************************************************************************

		// 	//***************************************************************************************************

		// 	//********OLD Logic code to be removed***************************************************************
		// 	//***************************************************************************************************

		// 	onSwitchChange: function (oEvent) {
		// 		var oTable = this.byId("table1");
		// 		oTable.setEnableSelectAll(oEvent.getParameter("state"));
		// 	},

		// 	getSelectedIndices: function (evt) {
		// 		var aIndices = this.byId("table1").getSelectedIndices();
		// 		var sMsg;
		// 		if (aIndices.length < 1) {
		// 			sMsg = "no item selected";
		// 		} else {
		// 			sMsg = aIndices;
		// 		}

		// 		MessageToast.show(sMsg);

		// 	},
		// 	olllllcoinButtonClick: function (oEvent) {
		// 		//var oTable = this.byId("table1");
		// 		var iIndex = oEvent.getSource().getParent().getIndex(); //oTable.getSelectedIndex();
		// 		var sMsg;

		// 		var _oTableModel = oTable.getContextByIndex(iIndex).getModel();
		// 		var _oSelectValue = oTable.getContextByIndex(iIndex).getModel().getData().aItems[1].Nav_header_detail.results[iIndex];
		// 		// console.log("selected value", _oSelectValue);
		// 		// console.log("conintablearr", this._acoins_All);

		// 		// for(var i=0; i<=this._acoins_All.length; i++){

		// 		// }
		// 		var yr = _oSelectValue["NG_YEAR"];
		// 		var mm = _oSelectValue["NG_MINTMARK"];
		// 		var de = _oSelectValue["NG_DENOMIN"];
		// 		var pr = _oSelectValue["NG_PROOFMINT"];
		// 		var va = _oSelectValue["NG_VARIETY"];

		// 		var _mCoinNo = "";
		// 		var _mValueSum = "";
		// 		this._acoins_All.forEach(function (item) {
		// 			if (item.NG_YEAR == yr && item.NG_MINTMARK == mm && item.NG_DENOMIN == de && item.NG_PROOFMINT == pr && item.NG_VARIETY == va) {
		// 				_mCoinNo = item.NG_COIN_NO;
		// 				_mValueSum = item.NG_VALUE_SUM;

		// 			}
		// 		});
		// 		_oSelectValue["NG_COIN_NO"] = _mCoinNo;
		// 		_oSelectValue["NG_VALUE_SUM"] = _mValueSum;
		// 		oTable.getContextByIndex(0).getModel().refresh(true);
		// 		oTable.clearSelection();
		// 		if (_mCoinNo !== "") {
		// 			sMsg = "Coin #" + _mCoinNo + " Fetched";
		// 		} else {
		// 			sMsg = "No Coin # Found";
		// 		}
		// 		//console.log("Updated Invoice Header Model", this.getModel("invoiceHeaderModel"));

		// 		MessageToast.show(sMsg);
		// 	},

		// 	creatSingleNotification: function (oEvent) {
		// 		var oTable = this.byId("table1");
		// 		var mSelectedRow = oTable.getSelectedIndex();
		// 		var mCount = oTable.getSelectedIndex() + 1;
		// 		var sText = "Do you want create notification for selected Item(s)?";
		// 		var that = this;
		// 		var sMsg;
		// 		if (mSelectedRow < 0) {
		// 			sMsg = "No Item Selected";
		// 			MessageToast.show(sMsg);
		// 		} else {
		// 			MessageBox.confirm(sText, {
		// 				title: "Confirmation?",
		// 				initialFocus: sap.m.MessageBox.Action.OK,
		// 				onClose: function (sButton) {
		// 					if (sButton === MessageBox.Action.OK) {
		// 						sap.ui.core.BusyIndicator.show(0);
		// 						var itemPath = "/aItems/1/Nav_header_detail/results/" + mSelectedRow;
		// 						itemPath = "/aItems/1/Nav_header_detail/results"
		// 						var itemArray = that.getView().getModel("invoiceHeaderModel").getProperty(itemPath);
		// 						//console.log("Final Model to send", itemArray);
		// 						var VerficationObj = {};
		// 						VerficationObj.Invoice_num = that._sInvoice;
		// 						VerficationObj.Sales_doc = that._sSales;
		// 						VerficationObj.Nav_header_detail = itemArray;

		// 						var whenOdataCall = that.callOdataService().postInvoiceHeader(that, VerficationObj);
		// 						// odata function call with post to get response from backend
		// 						whenOdataCall.done(function (oResult) {
		// 							//console.log("Create Response", oResult);
		// 							that.getGlobalModel().setProperty("/notifynumber", oResult["Notifiction_Num"]);
		// 							var mNotification = oResult["Notifiction_Num"];
		// 							var notificationObj = {};
		// 							notificationObj.Notifiction_Update = mNotification;
		// 							notificationObj.Invoice_num = that._sInvoice;
		// 							notificationObj.Sales_doc = that._sSales;
		// 							//Update Notification backto backend
		// 							var whenOdataupdateCall = that.callOdataService().updateNotification(that, notificationObj);
		// 							whenOdataupdateCall.done(function (oResult) {
		// 								//console.log("Notifi Update Response", oResult);
		// 								if (oResult.getData().aItems.length > 0) {
		// 									MessageToast.show("Notification Created Successfully");
		// 								} else {
		// 									MessageToast.show("Notification Create Failed!");
		// 								}
		// 								sap.ui.core.BusyIndicator.hide();
		// 							}.bind(that));

		// 						}.bind(that));

		// 					};
		// 				}
		// 			});
		// 		}
		// 	},

		// 	clearSelection: function (evt) {
		// 		this.byId("table1").clearSelection();
		// 	},

		// 	formatAvailableToObjectState: function (bAvailable) {
		// 		return bAvailable ? "Success" : "Error";
		// 	},

		// 	formatAvailableToIcon: function (bAvailable) {
		// 		return bAvailable ? "sap-icon://accept" : "sap-icon://decline";
		// 	},

		// 	handleDetailsPress: function (oEvent) {
		// 		MessageToast.show("Details for product with id " + this.getView().getModel().getProperty("ProductId", oEvent.getSource().getBindingContext()));
		// 	},

		// 	// onChange update valueState of input
		// 	onCoinChange: function (oEvent) {
		// 		var oInput = oEvent.getSource();
		// 		//var sMessage = oInput.getValue() + oInput.getId().substring(72, oInput.getId().length);
		// 		var sMessage = oInput.getSelectedItem().getText();
		// 	},

		// 	//* Binds the view to the object path.
		// 	//* @function
		// 	//* @param {string} sObjectPath path to the object to be bound
		// 	//* @private
		// 	//*/
		// 	_bindView: function (sObjectPath) {
		// 		var oViewModel = this.getModel("invoiceHeaderModel"),
		// 			oDataModel = this.getModel();

		// 		this.getView().bindElement({
		// 			path: sObjectPath,
		// 			events: {
		// 				change: this._onBindingChange.bind(this),
		// 				dataRequested: function () {
		// 					oDataModel.metadataLoaded().then(function () {
		// 						// Busy indicator on view should only be set if metadata is loaded,
		// 						// otherwise there may be two busy indications next to each other on the
		// 						// screen. This happens because route matched handler already calls '_bindView'
		// 						// while metadata is loaded.
		// 						oViewModel.setProperty("/busy", true);
		// 					});
		// 				},
		// 				dataReceived: function () {
		// 					oViewModel.setProperty("/busy", false);
		// 				}
		// 			}
		// 		});
		// 	},
		// 	_onBindingChange: function () {
		// 		var oView = this.getView(),
		// 			oViewModel = this.getModel("objectView"),
		// 			oElementBinding = oView.getElementBinding();

		// 		// No data for the binding
		// 		if (!oElementBinding.getBoundContext()) {
		// 			this.getRouter().getTargets().display("objectNotFound");
		// 			return;
		// 		}

		// 	},
		// 	hideBusyIndicator: function () {
		// 		BusyIndicator.hide();
		// 	},

		// 	showBusyIndicator: function (iDuration, iDelay) {
		// 		BusyIndicator.show(iDelay);

		// 		if (iDuration && iDuration > 0) {
		// 			if (this._sTimeoutId) {
		// 				clearTimeout(this._sTimeoutId);
		// 				this._sTimeoutId = null;
		// 			}

		// 			this._sTimeoutId = setTimeout(function () {
		// 				this.hideBusyIndicator();
		// 			}.bind(this), iDuration);
		// 		}
		// 	},
		// 	destroy: function () {
		// 		if (this.oRouteHandler) {
		// 			this.oRouteHandler.destroy();
		// 		}
		// 		sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
		// 	},
		// 	/**
		// 	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		// 	 * @memberOf ccg.Verification.view.Idoc_Items
		// 	 */
		// 	onExit: function () {
		// 		//	this.destroy();
		// 	}

		// 	//
		// 	/**
		// 	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		// 	 * (NOT before the first rendering! onInit() is used for that one!).
		// 	 * @memberOf ccg.Verification.view.Idoc_Items
		// 	 */
		// 	//	onBeforeRendering: function() {
		// 	//
		// 	//	},

		// 	/**
		// 	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		// 	 * This hook is the same one that SAPUI5 controls get after being rendered.
		// 	 * @memberOf ccg.Verification.view.Idoc_Items
		// 	 */
		// 	//	onAfterRendering: function() {
		// 	//
		// 	//	},

		// 	/**
		// 	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		// 	 * @memberOf ccg.Verification.view.Idoc_Items
		// 	 */
		// 	//	onExit: function() {
		// 	//
		// 	//	}

	});

});