sap.ui.define(["sap/ui/core/library", 'sap/uxap/BlockBase'], function (coreLibrary, BlockBase){
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	var Verify_Header = BlockBase.extend("ccg.Bramasol.Verify.Process040220.SharedBlocks.goals.Verify_Header", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "ccg.Bramasol.Verify.Process040220.SharedBlocks.goals.Verify_Header",
					type: ViewType.XML
				},
				Expanded: {
					viewName: "ccg.Bramasol.Verify.Process040220.SharedBlocks.goals.Verify_Header",
					type: ViewType.XML
				}
			}
		}
	});
	return Verify_Header;

});