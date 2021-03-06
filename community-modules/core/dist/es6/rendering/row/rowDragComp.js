/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.1.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component } from "../../widgets/component";
import { PostConstruct, PreDestroy } from "../../context/context";
import { RowNode } from "../../entities/rowNode";
import { DragSourceType } from "../../dragAndDrop/dragAndDropService";
import { Events } from "../../eventKeys";
import { BeanStub } from "../../context/beanStub";
import { createIconNoSpan } from "../../utils/icon";
import { doOnce, isFunction } from "../../utils/function";
var RowDragComp = /** @class */ (function (_super) {
    __extends(RowDragComp, _super);
    function RowDragComp(rowNode, column, cellValueFn, beans, customGui) {
        var _this = _super.call(this) || this;
        _this.rowNode = rowNode;
        _this.column = column;
        _this.cellValueFn = cellValueFn;
        _this.beans = beans;
        _this.customGui = customGui;
        _this.isCustomGui = false;
        _this.dragSource = null;
        return _this;
    }
    RowDragComp.prototype.postConstruct = function () {
        if (!this.customGui) {
            this.setTemplate(/* html */ "<div class=\"ag-drag-handle ag-row-drag\" aria-hidden=\"true\"></div>");
            var eGui = this.getGui();
            eGui.appendChild(createIconNoSpan('rowDrag', this.beans.gridOptionsWrapper, null));
            this.addDragSource();
        }
        else {
            this.isCustomGui = true;
            this.setDragElement(this.customGui);
        }
        this.checkCompatibility();
        var strategy = this.beans.gridOptionsWrapper.isRowDragManaged() ?
            new ManagedVisibilityStrategy(this, this.beans, this.rowNode, this.column) :
            new NonManagedVisibilityStrategy(this, this.beans, this.rowNode, this.column);
        this.createManagedBean(strategy, this.beans.context);
    };
    RowDragComp.prototype.setDragElement = function (dragElement) {
        this.setTemplateFromElement(dragElement);
        this.addDragSource();
    };
    RowDragComp.prototype.getSelectedCount = function () {
        var multiRowEnabled = this.beans.gridOptionsWrapper.isEnableMultiRowDragging();
        if (!multiRowEnabled) {
            return 1;
        }
        var selection = this.beans.selectionController.getSelectedNodes();
        return selection.indexOf(this.rowNode) !== -1 ? selection.length : 1;
    };
    // returns true if all compatibility items work out
    RowDragComp.prototype.checkCompatibility = function () {
        var managed = this.beans.gridOptionsWrapper.isRowDragManaged();
        var treeData = this.beans.gridOptionsWrapper.isTreeData();
        if (treeData && managed) {
            doOnce(function () {
                return console.warn('AG Grid: If using row drag with tree data, you cannot have rowDragManaged=true');
            }, 'RowDragComp.managedAndTreeData');
        }
    };
    RowDragComp.prototype.addDragSource = function () {
        var _this = this;
        // if this is changing the drag element, delete the previous dragSource
        if (this.dragSource) {
            this.removeDragSource();
        }
        var dragItem = {
            rowNode: this.rowNode,
            columns: [this.column],
            defaultTextValue: this.cellValueFn(),
        };
        var rowDragText = this.column.getColDef().rowDragText;
        this.dragSource = {
            type: DragSourceType.RowDrag,
            eElement: this.getGui(),
            dragItemName: function () {
                var dragItemCount = _this.getSelectedCount();
                if (rowDragText) {
                    return rowDragText(dragItem, dragItemCount);
                }
                return dragItemCount === 1 ? _this.cellValueFn() : dragItemCount + " rows";
            },
            getDragItem: function () { return dragItem; },
            dragStartPixels: 0,
            dragSourceDomDataKey: this.beans.gridOptionsWrapper.getDomDataKey()
        };
        this.beans.dragAndDropService.addDragSource(this.dragSource, true);
    };
    RowDragComp.prototype.removeDragSource = function () {
        if (this.dragSource) {
            this.beans.dragAndDropService.removeDragSource(this.dragSource);
        }
        this.dragSource = null;
    };
    __decorate([
        PostConstruct
    ], RowDragComp.prototype, "postConstruct", null);
    __decorate([
        PreDestroy
    ], RowDragComp.prototype, "removeDragSource", null);
    return RowDragComp;
}(Component));
export { RowDragComp };
var VisibilityStrategy = /** @class */ (function (_super) {
    __extends(VisibilityStrategy, _super);
    function VisibilityStrategy(parent, rowNode, column) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.column = column;
        _this.rowNode = rowNode;
        return _this;
    }
    VisibilityStrategy.prototype.setDisplayedOrVisible = function (neverDisplayed) {
        if (neverDisplayed) {
            this.parent.setDisplayed(false);
        }
        else {
            var shown = this.column.isRowDrag(this.rowNode) || this.parent.isCustomGui;
            var isShownSometimes = isFunction(this.column.getColDef().rowDrag);
            // if shown sometimes, them some rows can have drag handle while other don't,
            // so we use setVisible to keep the handles horizontally aligned (as setVisible
            // keeps the empty space, whereas setDisplayed looses the space)
            if (isShownSometimes) {
                this.parent.setDisplayed(true);
                this.parent.setVisible(shown);
            }
            else {
                this.parent.setDisplayed(shown);
            }
        }
    };
    return VisibilityStrategy;
}(BeanStub));
// when non managed, the visibility depends on suppressRowDrag property only
var NonManagedVisibilityStrategy = /** @class */ (function (_super) {
    __extends(NonManagedVisibilityStrategy, _super);
    function NonManagedVisibilityStrategy(parent, beans, rowNode, column) {
        var _this = _super.call(this, parent, rowNode, column) || this;
        _this.beans = beans;
        return _this;
    }
    NonManagedVisibilityStrategy.prototype.postConstruct = function () {
        this.addManagedListener(this.beans.gridOptionsWrapper, 'suppressRowDrag', this.onSuppressRowDrag.bind(this));
        // in case data changes, then we need to update visibility of drag item
        this.addManagedListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, this.workOutVisibility.bind(this));
        this.workOutVisibility();
    };
    NonManagedVisibilityStrategy.prototype.onSuppressRowDrag = function () {
        this.workOutVisibility();
    };
    NonManagedVisibilityStrategy.prototype.workOutVisibility = function () {
        // only show the drag if both sort and filter are not present
        var neverDisplayed = this.beans.gridOptionsWrapper.isSuppressRowDrag();
        this.setDisplayedOrVisible(neverDisplayed);
    };
    __decorate([
        PostConstruct
    ], NonManagedVisibilityStrategy.prototype, "postConstruct", null);
    return NonManagedVisibilityStrategy;
}(VisibilityStrategy));
// when managed, the visibility depends on sort, filter and row group, as well as suppressRowDrag property
var ManagedVisibilityStrategy = /** @class */ (function (_super) {
    __extends(ManagedVisibilityStrategy, _super);
    function ManagedVisibilityStrategy(parent, beans, rowNode, column) {
        var _this = _super.call(this, parent, rowNode, column) || this;
        _this.beans = beans;
        return _this;
    }
    ManagedVisibilityStrategy.prototype.postConstruct = function () {
        // we do not show the component if sort, filter or grouping is active
        this.addManagedListener(this.beans.eventService, Events.EVENT_SORT_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.eventService, Events.EVENT_FILTER_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.workOutVisibility.bind(this));
        // in case data changes, then we need to update visibility of drag item
        this.addManagedListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.gridOptionsWrapper, 'suppressRowDrag', this.onSuppressRowDrag.bind(this));
        this.workOutVisibility();
    };
    ManagedVisibilityStrategy.prototype.onSuppressRowDrag = function () {
        this.workOutVisibility();
    };
    ManagedVisibilityStrategy.prototype.workOutVisibility = function () {
        // only show the drag if both sort and filter are not present
        var rowDragFeature = this.beans.gridPanel.getRowDragFeature();
        var shouldPreventRowMove = rowDragFeature && rowDragFeature.shouldPreventRowMove();
        var suppressRowDrag = this.beans.gridOptionsWrapper.isSuppressRowDrag();
        var hasExternalDropZones = this.beans.dragAndDropService.hasExternalDropZones();
        var neverDisplayed = (shouldPreventRowMove && !hasExternalDropZones) || suppressRowDrag;
        this.setDisplayedOrVisible(neverDisplayed);
    };
    __decorate([
        PostConstruct
    ], ManagedVisibilityStrategy.prototype, "postConstruct", null);
    return ManagedVisibilityStrategy;
}(VisibilityStrategy));
