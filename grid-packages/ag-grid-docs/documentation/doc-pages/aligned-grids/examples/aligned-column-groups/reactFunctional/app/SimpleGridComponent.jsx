import React, { Component } from 'react';
import { AgGridReact } from '@ag-grid-community/react';

import { AllCommunityModules } from '@ag-grid-community/all-modules';

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

export default class extends Component {
    constructor(props) {
        super(props);

        this.athleteVisible = true;
        this.ageVisible = true;
        this.countryVisible = true;
        this.rowData = null;

        this.state = this.createState();
    }

    createState = () => {
        const topOptions = {
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
        const bottomOptions = {
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

        topOptions.alignedGrids.push(bottomOptions);
        bottomOptions.alignedGrids.push(topOptions);

        return {
            topOptions,
            bottomOptions,
            columnDefs: [
                {
                    headerName: 'Group 1',
                    headerClass: 'blue',
                    groupId: 'Group1',
                    children: [
                        { field: 'athlete', pinned: true, width: 100 },
                        { field: 'age', pinned: true, columnGroupShow: 'open', width: 100 },
                        { field: 'country', width: 100 },
                        { field: 'year', columnGroupShow: 'open', width: 100 },
                        { field: 'date', width: 100 },
                        { field: 'sport', columnGroupShow: 'open', width: 100 },
                        { field: 'date', width: 100 },
                        { field: 'sport', columnGroupShow: 'open', width: 100 }
                    ]
                },
                {
                    headerName: 'Group 2',
                    headerClass: 'green',
                    groupId: 'Group2',
                    children: [
                        { field: 'athlete', pinned: true, width: 100 },
                        { field: 'age', pinned: true, columnGroupShow: 'open', width: 100 },
                        { field: 'country', width: 100 },
                        { field: 'year', columnGroupShow: 'open', width: 100 },
                        { field: 'date', width: 100 },
                        { field: 'sport', columnGroupShow: 'open', width: 100 },
                        { field: 'date', width: 100 },
                        { field: 'sport', columnGroupShow: 'open', width: 100 }
                    ]
                }
            ],
            rowData: this.rowData
        };
    };

    onGridReady = (params) => {
        this.topGrid = params;
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://www.ag-grid.com/example-assets/olympic-winners.json');
        httpRequest.send();
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                this.rowData = JSON.parse(httpRequest.responseText);
                this.setState(this.createState());
                window.setTimeout(() => {
                    // mix up some columns
                    this.topGrid.columnApi.moveColumnByIndex(11, 4);
                    this.topGrid.columnApi.moveColumnByIndex(11, 4);
                }, 100);
            }
        };
    };

    onFirstDataRendered = (params) => {
        this.topGrid.api.sizeColumnsToFit();
    };

    render() {
        return (
            <div className="container">
                <div className="grid ag-theme-alpine">
                    <AgGridReact
                        rowData={this.state.rowData}
                        gridOptions={this.state.topOptions}
                        columnDefs={this.state.columnDefs}
                        defaultColDef={{ resizable: true }}
                        onGridReady={this.onGridReady.bind(this)}
                        modules={AllCommunityModules}
                        onFirstDataRendered={this.onFirstDataRendered.bind(this)} />
                </div>

                <div className="divider"></div>

                <div className="grid ag-theme-alpine">
                    <AgGridReact
                        rowData={this.state.rowData}
                        gridOptions={this.state.bottomOptions}
                        columnDefs={this.state.columnDefs}
                        modules={AllCommunityModules} />
                </div>
            </div>
        );
    }
}
