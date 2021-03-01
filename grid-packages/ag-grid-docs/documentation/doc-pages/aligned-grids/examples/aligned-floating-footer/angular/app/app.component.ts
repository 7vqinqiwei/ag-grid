import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AllCommunityModules } from '@ag-grid-community/all-modules';

import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css";

@Component({
    selector: 'my-app',
    styles: [`.bold-row {
        font-weight: bold;
    } `],
    template: `
        <div style="height: 100%; display: flex; flex-direction: column">
            <ag-grid-angular
                    style="flex: 1 1 auto;"
                    #topGrid
                    class="ag-theme-alpine"
                    [modules]="modules"
                    [rowData]="rowData"
                    [gridOptions]="topOptions"
                    (firstDataRendered)='onFirstDataRendered($event)'
                    [columnDefs]="columnDefs">
            </ag-grid-angular>

            <ag-grid-angular
                    style="flex: none; height: 60px;"
                    #bottomGrid
                    class="ag-theme-alpine"
                    [modules]="modules"
                    [rowData]="bottomData"
                    [gridOptions]="bottomOptions"
                    headerHeight="0"
                    [rowStyle]="{ fontWeight: 'bold' }"
                    [columnDefs]="columnDefs">
            </ag-grid-angular>
        </div>
    `
})
export class AppComponent {
    columnDefs;
    rowData;
    topOptions = {
        alignedGrids: [],
        defaultColDef: {
            editable: true,
            sortable: true,
            resizable: true,
            filter: true,
            flex: 1,
            minWidth: 100
        }
        ,
        suppressHorizontalScroll: true
    };
    bottomOptions = {
        alignedGrids: [],
        defaultColDef: {
            editable: true,
            sortable: true,
            resizable: true,
            filter: true,
            flex: 1,
            minWidth: 100
        }
    };
    modules = AllCommunityModules;

    @ViewChild('topGrid') topGrid;
    @ViewChild('bottomGrid') bottomGrid;

    bottomData = [
        {
            athlete: 'Total',
            age: '15 - 61',
            country: 'Ireland',
            year: '2020',
            date: '26/11/1970',
            sport: 'Synchronised Riding',
            gold: 55,
            silver: 65,
            bronze: 12
        }
    ];

    constructor(private http: HttpClient) {
        this.columnDefs = [
            { field: 'athlete', width: 200 },
            { field: 'age', width: 100 },
            { field: 'country', width: 150 },
            { field: 'year', width: 120 },
            { field: 'sport', width: 200 },
            // in the total col, we have a value getter, which usually means we don't need to provide a field
            // however the master/slave depends on the column id (which is derived from the field if provided) in
            // order ot match up the columns
            {
                headerName: 'Total',
                field: 'total',
                valueGetter: 'data.gold + data.silver + data.bronze',
                width: 200
            },
            { field: 'gold', width: 100 },
            { field: 'silver', width: 100 },
            { field: 'bronze', width: 100 }
        ];

        this.topOptions.alignedGrids.push(this.bottomOptions);
        this.bottomOptions.alignedGrids.push(this.topOptions);
    }

    ngOnInit() {
        this.http.get('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .subscribe(data => {
                this.rowData = data;
            });
    }

    onFirstDataRendered(params) {
        params.columnApi.autoSizeAllColumns();
    }
}
