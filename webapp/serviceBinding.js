function initModel() {
	var sUrl = "/CCG_S4_Dev_200/sap/opu/odata/sap/ZGW_EQIPMENT_VERIFY_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}