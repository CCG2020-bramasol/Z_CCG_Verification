sap.ui.define([], function() {
	"use strict";

	return {
		onInit: function() {
			this.destSu = "";
		},
		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function(sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},
		removeColumn: function(destSu) {
			if (destSu) {
				this.getView().byId("column3").setVisible(true);
				this.destSu = "X";
			}
			if (this.destSu !== "X") {
				this.getView().byId("column3").setVisible(false);
				
			}
			return destSu;
		},
		changeColor: function(DestDifa) {
			if (this.destDifa === "X" && DestDifa !== "0.000" && DestDifa !== "0") {
				this.destDifa = "";
				return "Error";
			}
			// else if (this.destDifa === "X" && DestDifa !== "0") {
			// 	this.destDifa = "";
			// 	return "Error";
			// }
			else {
				this.destDifa = "";
				return "None";
			}
		},
		su: function(sValue) {
			// var oResourceBundle = this.getView().getModel("i18n").getResourceBundle(),
			// if(this.diffQuantityIndi = "X"){

			// };
			var sResult = "";
			if (sValue === "0") {
				sResult = "No SU Found";
			}
			return sResult;
		},
		status: function(a, b) {
			var stsVal = "";
			if (b === "X") {
				stsVal = a + "(Highest Level of Handling Unit)";
			} else if (b === "") {
				stsVal = a;
			}
			return stsVal;
		},
		grIndicator: function(a) {
			var grDLU = "";
			if (a === "X") {
				grDLU = "Unloaded";
			} else if (a === "") {
				grDLU = "To be Unloaded";
			}
			return grDLU;
		},
		giIndicator: function(a) {
			var grDLU = "";
			if (a === "X") {
				grDLU = "Loaded";
			} else if (a === "") {
				grDLU = "To be Loaded";
			}
			return grDLU;
		},
		grDelShip: function(a) {
			var shipStat = "";
			if (a === "") {
				shipStat = "-";
			}
			return shipStat;
		},
		huIndicator: function(huInd) {
			var huIndi = "";
			if (huInd === "X") {
				huIndi = "Available";
			} else if (huInd === "") {
				huIndi = "Not Available";
			}
			return huIndi;
		},
		shipPoint: function(a) {
			var shPoint = "";
			if (a === "") {
				shPoint = "Not Available";
			} else if (a) {
				return a;
			}
			return shPoint;
		},
		unpack: function(a) {
			var up = "";
			if(a === "") {
				up = "-";
			} else if (a) {
				return a;
			}
			return up;
		},
		delType: function(delindicator) {
			var dIndicator = "";
			if (delindicator === "01") {
				dIndicator = "Outbound";
			} else if (delindicator === "03") {
				dIndicator = "Inbound";
			}
			return dIndicator;
		},
		shipInfo : function(Ind) {
			var sIndi = "";
			if (Ind === "") {
				sIndi = "-";
			} 
			return sIndi;
		}
	};

});