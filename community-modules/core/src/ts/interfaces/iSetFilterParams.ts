import {ICellRendererComp, ICellRendererFunc} from "../rendering/cellRenderers/iCellRenderer";
import {ColDef, ValueFormatterParams} from "../entities/colDef";
import {IProvidedFilterParams} from "../filter/provided/providedFilter";
import {RowNode} from "../entities/rowNode";

export interface SetFilterValuesFuncParams {
    success: (values: string[]) => void;
    colDef: ColDef;
}
export type SetFilterValuesFunc = (params: SetFilterValuesFuncParams) => void;
export type SetFilterValues = SetFilterValuesFunc | any[];

export interface ISetFilterParams extends IProvidedFilterParams {
    suppressRemoveEntries ?: boolean;
    values ?: SetFilterValues;
    cellHeight: number;
    suppressSorting: boolean;
    cellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string;
    suppressMiniFilter: boolean;
    suppressSelectAll: boolean;
    suppressSyncValuesAfterDataChange: boolean;
    comparator?: (a: any, b: any) => number;
    miniFilterSearchByRefDataKey?: boolean;
    textFormatter?: (from: string) => string;
    valueFormatter?: (params: ValueFormatterParams) => string;

    /** @deprecated */
    selectAllOnMiniFilter: boolean;

    /** @deprecated */
    syncValuesLikeExcel?: boolean;
}