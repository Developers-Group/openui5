/* global QUnit, sinon */

(function(QUnit, sinon) {
	"use strict";

	jQuery.sap.require("sap.ui.fl.variants.VariantManagement");
	jQuery.sap.require("sap.ui.layout.Grid");
	jQuery.sap.require("sap.ui.model.json.JSONModel");

	var oModel;

	var fGetGrid = function(oDialog) {
		var oGrid = null, aContent = oDialog.getContent();
		aContent.some(function(oContent) {
			if (oContent instanceof sap.ui.layout.Grid) {
				oGrid = oContent;
			}

			return (oGrid != null);
		});

		return oGrid;
	};

	QUnit.module("sap.ui.fl.variants.VariantManagement", {
		beforeEach: function() {
			this.oVariantManagement = new sap.ui.fl.variants.VariantManagement();

			oModel = new sap.ui.model.json.JSONModel([
				{
					defaultVariant: "Standard",
					initialDefaultVariant: "Standard",
					standardVariant: "Standard",
					modified: false,
					variants: [
						{
							key: "Standard",
							title: "Standard",
							author: "A",
							originalTitle: "Standard",
							toBeDeleted: false,
							readOnly: true
						}, {
							key: "1",
							title: "One",
							author: "A",
							originalTitle: "One",
							toBeDeleted: false,
							readOnly: true
						}, {
							key: "2",
							title: "Two",
							author: "V",
							originalTitle: "Two",
							toBeDeleted: false,
							readOnly: true
						}, {
							key: "3",
							title: "Three",
							author: "U",
							originalTitle: "Three",
							toBeDeleted: false,
							readOnly: true
						}, {
							key: "4",
							title: "Four",
							author: "Z",
							originalTitle: "Four",
							toBeDeleted: false,
							readOnly: true
						}
					]
				}
			]);
		},
		afterEach: function() {
		}
	});

	QUnit.test("Shall be instantiable", function(assert) {
		assert.ok(this.oVariantManagement);
	});

	QUnit.test("Shall be destroyable", function(assert) {
		assert.ok(this.oVariantManagement._oRb);
		assert.ok(this.oVariantManagement.oModel);

		this.oVariantManagement.destroy();

		assert.ok(!this.oVariantManagement._oRb);
		assert.ok(!this.oVariantManagement.oModel);
	});

	QUnit.test("Check _getItems", function(assert) {

		var aItems = this.oVariantManagement._getItems();
		assert.ok(aItems);
		assert.equal(aItems.length, 0);

		this.oVariantManagement.setModel(oModel, "$SapUiFlVariants");
		this.oVariantManagement.setBindingContext(oModel.getContext("/0"), "$SapUiFlVariants");

		aItems = this.oVariantManagement._getItems();
		assert.ok(aItems);
		assert.equal(aItems.length, 5);
		assert.equal(aItems[0].key, this.oVariantManagement.getStandardVariantKey());
		assert.equal(aItems[1].key, "1");
		assert.equal(aItems[1].toBeDeleted, false);
		assert.equal(aItems[1].originalTitle, aItems[1].title);
		assert.equal(aItems[2].key, "2");

	});

	QUnit.test("Create Variants List", function(assert) {

		this.oVariantManagement.setModel(oModel, "$SapUiFlVariants");
		this.oVariantManagement.setBindingContext(oModel.getContext("/0"), "$SapUiFlVariants");

		assert.ok(!this.oVariantManagement.oVariantPopOver);
		this.oVariantManagement._createVariantList();

		assert.ok(this.oVariantManagement.oVariantPopOver);
		sinon.stub(this.oVariantManagement.oVariantPopOver, "openBy");

		assert.equal(this.oVariantManagement.getSelectedVariantKey(), this.oVariantManagement.getStandardVariantKey());

		this.oVariantManagement._openVariantList();

		assert.ok(!this.oVariantManagement.oVariantSaveBtn.getEnabled());
		assert.ok(this.oVariantManagement.oVariantSaveAsBtn.setEnabled());

		this.oVariantManagement._openVariantList();

		assert.ok(!this.oVariantManagement.getModified());
		assert.ok(!this.oVariantManagement.oVariantSaveBtn.getEnabled());
		assert.ok(this.oVariantManagement.oVariantSaveAsBtn.setEnabled());

		this.oVariantManagement.setModified(true);
		assert.ok(this.oVariantManagement.getModified());
		assert.ok(this.oVariantManagement.oVariantSaveBtn.getEnabled());
		assert.ok(this.oVariantManagement.oVariantSaveAsBtn.setEnabled());

	});

	QUnit.test("Create SaveAs Dialog", function(assert) {

		assert.ok(!this.oVariantManagement.oSaveAsDialog);
		this.oVariantManagement._createSaveAsDialog();

		assert.ok(this.oVariantManagement.oSaveAsDialog);
		sinon.stub(this.oVariantManagement.oSaveAsDialog, "open");

		this.oVariantManagement._openSaveAsDialog();

		assert.ok(this.oVariantManagement.oInputName.getVisible());
		assert.ok(!this.oVariantManagement.oLabelKey.getVisible());
		assert.ok(!this.oVariantManagement.oInputManualKey.getVisible());

		var oGrid = fGetGrid(this.oVariantManagement.oSaveAsDialog);
		var oGridContent = oGrid.getContent();
		assert.ok(oGridContent);
		assert.equal(oGridContent.length, 1);

		this.oVariantManagement.oSaveAsDialog.destroy();
		this.oVariantManagement.oSaveAsDialog = undefined;
		this.oVariantManagement.oShare.destroy();
		this.oVariantManagement.oExecuteOnSelect.destroy();

		this.oVariantManagement.setShowExecuteOnSelection(true);
		this.oVariantManagement.setShowShare(true);
		this.oVariantManagement._createSaveAsDialog();

		assert.ok(this.oVariantManagement.oSaveAsDialog);
		sinon.stub(this.oVariantManagement.oSaveAsDialog, "open");

		this.oVariantManagement._openSaveAsDialog();
		oGrid = fGetGrid(this.oVariantManagement.oSaveAsDialog);
		oGridContent = oGrid.getContent();
		assert.ok(oGridContent);
		assert.equal(oGridContent.length, 3);

	});

	QUnit.test("Checking _handleVariantSaveAs", function(assert) {

		this.oVariantManagement.setModel(oModel, "$SapUiFlVariants");
		this.oVariantManagement.setBindingContext(oModel.getContext("/0"), "$SapUiFlVariants");

		var bCalled = false;
		this.oVariantManagement.attachSave(function(oEvent) {
			bCalled = true;
		});

		this.oVariantManagement._createSaveAsDialog();

		assert.ok(this.oVariantManagement.oSaveAsDialog);
		sinon.stub(this.oVariantManagement.oSaveAsDialog, "open");

		this.oVariantManagement._openSaveAsDialog();

		var aItems = this.oVariantManagement._getItems();
		assert.ok(aItems);
		assert.equal(aItems.length, 5);

		this.oVariantManagement._handleVariantSaveAs("1");
		assert.ok(bCalled);
	});

	QUnit.test("Checking _handleVariantSave", function(assert) {

		this.oVariantManagement.setModel(oModel, "$SapUiFlVariants");
		this.oVariantManagement.setBindingContext(oModel.getContext("/0"), "$SapUiFlVariants");

		var bCalled = false;
		this.oVariantManagement.attachSave(function(oEvent) {
			bCalled = true;
		});

		this.oVariantManagement._createSaveAsDialog();

		assert.ok(this.oVariantManagement.oSaveAsDialog);
		sinon.stub(this.oVariantManagement.oSaveAsDialog, "open");

		this.oVariantManagement.setSelectedVariantKey("1");

		this.oVariantManagement._openSaveAsDialog();

		var aItems = this.oVariantManagement._getItems();
		assert.ok(aItems);
		assert.equal(aItems.length, 5);

		this.oVariantManagement._handleVariantSave("1");
		assert.ok(bCalled);
	});

	QUnit.test("Create Management Dialog", function(assert) {

		this.oVariantManagement.setModel(oModel, "$SapUiFlVariants");
		this.oVariantManagement.setBindingContext(oModel.getContext("/0"), "$SapUiFlVariants");

		this.oVariantManagement._createManagementDialog();
		assert.ok(this.oVariantManagement.oManagementDialog);
		sinon.stub(this.oVariantManagement.oManagementDialog, "open");

		this.oVariantManagement._openManagementDialog();
		assert.ok(this.oVariantManagement.oManagementTable);
		var aRows = this.oVariantManagement.oManagementTable.getItems();
		assert.ok(aRows);
		assert.equal(aRows.length, 5);

	});

	QUnit.test("Checking _handleManageDefaultVariantChange", function(assert) {

		var bEnabled = false;
		sinon.stub(this.oVariantManagement, "_anyInErrorState").returns(false);

		this.oVariantManagement.oManagementSave = {
			setEnabled: function(bFlag) {
				bEnabled = true;
			}
		};

		this.oVariantManagement._handleManageDefaultVariantChange("1");
		assert.ok(bEnabled);

		this.oVariantManagement._anyInErrorState.restore();
		sinon.stub(this.oVariantManagement, "_anyInErrorState").returns(true);
		bEnabled = false;
		this.oVariantManagement._handleManageDefaultVariantChange("1");
		assert.ok(!bEnabled);

		this.oVariantManagement.oManagementSave = undefined;
	});

	QUnit.test("Checking _handleManageCancelPressed", function(assert) {

		var oItem = oModel.getData()[0].variants[1];

		this.oVariantManagement.setModel(oModel, "$SapUiFlVariants");
		this.oVariantManagement.setBindingContext(oModel.getContext("/0"), "$SapUiFlVariants");

		var aItems = this.oVariantManagement._getItems();
		assert.ok(aItems);
		assert.equal(aItems.length, 5);

		oItem.toBeDeleted = true;

		this.oVariantManagement._createManagementDialog();
		assert.ok(this.oVariantManagement.oManagementDialog);
		sinon.stub(this.oVariantManagement.oManagementDialog, "open");

		this.oVariantManagement._openManagementDialog();
		var aRows = this.oVariantManagement.oManagementTable.getItems();
		assert.ok(aRows);
		assert.equal(aRows.length, 4);

		this.oVariantManagement._handleManageCancelPressed();

		this.oVariantManagement._openManagementDialog();
		var aRows = this.oVariantManagement.oManagementTable.getItems();
		assert.ok(aRows);
		assert.equal(aRows.length, 5);

	});

// QUnit.test("Checking _handleManageDeletePressed", function(assert) {
//
// var oItem = fCreateItem({}, "k1", "text1");
// this.oVariantManagement.addItem(oItem);
//
// oItem = fCreateItem({}, "k2", "text2");
// this.oVariantManagement.addItem(oItem);
//
// this.oVariantManagement._createManagementDialog();
// assert.ok(this.oVariantManagement.oManagementDialog);
// sinon.stub(this.oVariantManagement.oManagementDialog, "open");
//
// this.oVariantManagement._openManagementDialog();
// var aRows = this.oVariantManagement.oManagementTable.getItems();
// assert.ok(aRows);
// assert.equal(aRows.length, 3);
//
// this.oVariantManagement._handleManageDeletePressed(oItem);
//
// this.oVariantManagement._deleteOccured = true;
//
// this.oVariantManagement._openManagementDialog();
// var aRows = this.oVariantManagement.oManagementTable.getItems();
// assert.ok(aRows);
// assert.equal(aRows.length, 2);
//
// });

	QUnit.test("Checking _handleManageSavePressed; deleted item is NOT selected", function(assert) {

		this.oVariantManagement.setModel(oModel, "$SapUiFlVariants");
		this.oVariantManagement.setBindingContext(oModel.getContext("/0"), "$SapUiFlVariants");

		this.oVariantManagement.attachManage(function(oEvent) {
			var aDelItems = oEvent.getParameters().deleted;
			assert.ok(aDelItems);
			assert.equal(aDelItems.length, 2);
			assert.equal(aDelItems[0], "1");
			assert.equal(aDelItems[1], "4");

			var aRenamedItems = oEvent.getParameters().renamed;
			assert.ok(aRenamedItems);
			assert.equal(aRenamedItems.length, 1);
			assert.equal(aRenamedItems[0].key, "3");
			assert.equal(aRenamedItems[0].name, "New 3");
		});

		this.oVariantManagement._createManagementDialog();
		assert.ok(this.oVariantManagement.oManagementDialog);
		sinon.stub(this.oVariantManagement.oManagementDialog, "open");

		var oItemRen = this.oVariantManagement._getItemByKey("3");
		assert.ok(oItemRen);
		oItemRen.title = "New 3";
		this.oVariantManagement._handleManageItemNameChange(oItemRen);

		var oItemDel = this.oVariantManagement._getItemByKey("1");
		assert.ok(oItemDel);

		oItemDel.title = "New 1";
		this.oVariantManagement._handleManageItemNameChange(oItemDel);

		this.oVariantManagement._handleManageDeletePressed(oItemDel);
		this.oVariantManagement._handleManageDeletePressed(this.oVariantManagement._getItemByKey("4"));

		this.oVariantManagement._handleManageSavePressed();

		assert.ok(!this.oVariantManagement.bFireSelect);

	});

	QUnit.test("Checking _handleManageSavePressed; deleted item is selected", function(assert) {

		this.oVariantManagement.setModel(oModel, "$SapUiFlVariants");
		this.oVariantManagement.setBindingContext(oModel.getContext("/0"), "$SapUiFlVariants");

		this.oVariantManagement.attachManage(function(oEvent) {
			var aDelItems = oEvent.getParameters().deleted;
			assert.ok(aDelItems);
			assert.equal(aDelItems.length, 2);
			assert.equal(aDelItems[0], "1");
			assert.equal(aDelItems[1], "2");

			var aRenamedItems = oEvent.getParameters().renamed;
			assert.ok(aRenamedItems);
			assert.equal(aRenamedItems.length, 1);
			assert.equal(aRenamedItems[0].key, "3");
			assert.equal(aRenamedItems[0].name, "New 3");
		});

		this.oVariantManagement._createManagementDialog();
		assert.ok(this.oVariantManagement.oManagementDialog);
		sinon.stub(this.oVariantManagement.oManagementDialog, "open");

		var oItemRen = this.oVariantManagement._getItemByKey("3");
		assert.ok(oItemRen);
		oItemRen.title = "New 3";
		this.oVariantManagement._handleManageItemNameChange(oItemRen);

		var oItemDel = this.oVariantManagement._getItemByKey("1");
		assert.ok(oItemDel);

		oItemDel.title = "New 1";
		this.oVariantManagement._handleManageItemNameChange(oItemDel);

		this.oVariantManagement._handleManageDeletePressed(oItemDel);
		this.oVariantManagement._handleManageDeletePressed(this.oVariantManagement._getItemByKey("2"));

		this.oVariantManagement.setSelectedVariantKey("1");

		this.oVariantManagement._handleManageSavePressed();

		assert.ok(this.oVariantManagement.bFireSelect);

		assert.equal(this.oVariantManagement.getSelectedVariantKey(), this.oVariantManagement.getStandardVariantKey());

	});

}(QUnit, sinon));
