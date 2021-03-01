import { Autowired, Bean, Context, Optional, PostConstruct } from "../context/context";
import { ColumnApi } from "../columnController/columnApi";
import { ColumnController } from "../columnController/columnController";
import { HeaderNavigationService } from "../headerRendering/header/headerNavigationService";
import { GridApi } from "../gridApi";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ExpressionService } from "../valueService/expressionService";
import { RowRenderer } from "./rowRenderer";
import { TemplateService } from "../templateService";
import { ValueService } from "../valueService/valueService";
import { EventService } from "../eventService";
import { ColumnAnimationService } from "./columnAnimationService";
import { IRangeController, ISelectionHandleFactory } from "../interfaces/iRangeController";
import { FocusController } from "../focusController";
import { IContextMenuFactory } from "../interfaces/iContextMenuFactory";
import { PopupService } from "../widgets/popupService";
import { ValueFormatterService } from "./valueFormatterService";
import { StylingService } from "../styling/stylingService";
import { ColumnHoverService } from "./columnHoverService";
import { GridPanel } from "../gridPanel/gridPanel";
import { PaginationProxy } from "../pagination/paginationProxy";
import { AnimationFrameService } from "../misc/animationFrameService";
import { UserComponentFactory } from "../components/framework/userComponentFactory";
import { DragAndDropService } from "../dragAndDrop/dragAndDropService";
import { SortController } from "../sortController";
import { FilterManager } from "../filter/filterManager";
import { MaxDivHeightScaler } from "./maxDivHeightScaler";
import { IFrameworkOverrides } from "../interfaces/iFrameworkOverrides";
import { DetailRowCompCache } from "./row/detailRowCompCache";
import { CellPositionUtils } from "../entities/cellPosition";
import { RowPositionUtils } from "../entities/rowPosition";
import { SelectionController } from "../selectionController";
import { RowCssClassCalculator } from "./row/rowCssClassCalculator";
import { IRowModel } from "../interfaces/iRowModel";
import { IClientSideRowModel } from "../interfaces/iClientSideRowModel";
import { IServerSideRowModel } from "../interfaces/iServerSideRowModel";
import { ResizeObserverService } from "../misc/resizeObserverService";

/** Using the IoC has a slight performance consideration, which is no problem most of the
 * time, unless we are trashing objects - which is the case when scrolling and rowComp
 * and cellComp. So for performance reasons, RowComp and CellComp do not get autowired
 * with the IoC. Instead they get passed this object which is all the beans the RowComp
 * and CellComp need. Not autowiring all the cells gives performance improvement. */
@Bean('beans')
export class Beans {

    @Autowired('resizeObserverService') public resizeObserverService: ResizeObserverService;
    @Autowired('paginationProxy') public paginationProxy: PaginationProxy;
    @Autowired('context') public context: Context;
    @Autowired('columnApi') public columnApi: ColumnApi;
    @Autowired('gridApi') public gridApi: GridApi;
    @Autowired('gridOptionsWrapper') public gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('expressionService') public expressionService: ExpressionService;
    @Autowired('rowRenderer') public rowRenderer: RowRenderer;
    @Autowired('$compile') public $compile: any;
    @Autowired('templateService') public templateService: TemplateService;
    @Autowired('valueService') public valueService: ValueService;
    @Autowired('eventService') public eventService: EventService;
    @Autowired('columnController') public columnController: ColumnController;
    @Autowired('headerNavigationService') public headerNavigationService: HeaderNavigationService;
    @Autowired('columnAnimationService') public columnAnimationService: ColumnAnimationService;
    @Optional('rangeController') public rangeController: IRangeController;
    @Autowired('focusController') public focusController: FocusController;
    @Optional('contextMenuFactory') public contextMenuFactory: IContextMenuFactory;
    @Autowired('popupService') public popupService: PopupService;
    @Autowired('valueFormatterService') public valueFormatterService: ValueFormatterService;
    @Autowired('stylingService') public stylingService: StylingService;
    @Autowired('columnHoverService') public columnHoverService: ColumnHoverService;
    @Autowired('userComponentFactory') public userComponentFactory: UserComponentFactory;
    @Autowired('animationFrameService') public taskQueue: AnimationFrameService;
    @Autowired('dragAndDropService') public dragAndDropService: DragAndDropService;
    @Autowired('sortController') public sortController: SortController;
    @Autowired('filterManager') public filterManager: FilterManager;
    @Autowired('maxDivHeightScaler') public maxDivHeightScaler: MaxDivHeightScaler;
    @Autowired('frameworkOverrides') public frameworkOverrides: IFrameworkOverrides;
    @Autowired('detailRowCompCache') public detailRowCompCache: DetailRowCompCache;
    @Autowired('cellPositionUtils') public cellPositionUtils: CellPositionUtils;
    @Autowired('rowPositionUtils') public rowPositionUtils: RowPositionUtils;
    @Autowired('selectionController') public selectionController: SelectionController;
    @Optional('selectionHandleFactory') public selectionHandleFactory: ISelectionHandleFactory;
    @Autowired('rowCssClassCalculator') public rowCssClassCalculator: RowCssClassCalculator;
    @Autowired('rowModel') public rowModel: IRowModel;

    public doingMasterDetail: boolean;
    public gridPanel: GridPanel;

    public clientSideRowModel: IClientSideRowModel;
    public serverSideRowModel: IServerSideRowModel;

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
    }

    @PostConstruct
    private postConstruct(): void {
        this.doingMasterDetail = this.gridOptionsWrapper.isMasterDetail();

        if (this.gridOptionsWrapper.isRowModelDefault()) {
            this.clientSideRowModel = this.rowModel as IClientSideRowModel;
        }
        if (this.gridOptionsWrapper.isRowModelServerSide()) {
            this.serverSideRowModel = this.rowModel as IServerSideRowModel;
        }
    }
}
