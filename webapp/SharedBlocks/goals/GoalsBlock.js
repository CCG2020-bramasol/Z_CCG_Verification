sap.ui.define(["sap/ui/core/library", 'sap/uxap/BlockBase'], function (coreLibrary, BlockBase) {
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	var GoalsBlock = BlockBase.extend("ccg.Bramasol.Verify.Process040220.SharedBlocks.goals.GoalsBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "ccg.Bramasol.Verify.Process040220.SharedBlocks.goals.GoalsBlock",
					type: ViewType.XML
				},
				Expanded: {
					viewName: "ccg.Bramasol.Verify.Process040220.SharedBlocks.goals.GoalsBlock",
					type: ViewType.XML
				}
			}
		}
	});
	return GoalsBlock;
});
