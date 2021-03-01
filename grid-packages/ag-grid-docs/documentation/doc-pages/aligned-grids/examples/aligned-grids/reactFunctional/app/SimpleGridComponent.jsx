import React, {useState} from 'react';

import {AgGridReact} from '@ag-grid-community/react';
import {AllCommunityModules} from '@ag-grid-community/all-modules';

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

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

export default () => {
    const [topGrid, setTopGrid] = useState(null);

    const [columnDefs, setColumnDefs] = useState([
        {field: 'athlete'},
        {field: 'age'},
        {field: 'country'},
        {field: 'year'},
        {field: 'date'},
        {field: 'sport'},
        {
            headerName: 'Medals',
            children: [
                {
                    columnGroupShow: 'closed', field: "total",
                    valueGetter: "data.gold + data.silver + data.bronze", width: 200
                },
                {columnGroupShow: 'open', field: "gold", width: 100},
                {columnGroupShow: 'open', field: "silver", width: 100},
                {columnGroupShow: 'open', field: "bronze", width: 100}
            ]
        }
    ]);

    const [rowData, setRowData] = useState([]);

    function onGridReady(params) {
        setTopGrid(params);
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://www.ag-grid.com/example-assets/olympic-winners.json');
        httpRequest.send();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                var httpResult = JSON.parse(httpRequest.responseText);
                setRowData(httpResult)
            }
        };
    }

    function onFirstDataRendered(params) {
        params.api.sizeColumnsToFit();
    }

    function onCbAthlete(event) {
        // we only need to update one grid, as the other is a slave
        topGrid.columnApi.setColumnVisible('athlete', event.target.checked);
    }

    function onCbAge(event) {
        // we only need to update one grid, as the other is a slave
        topGrid.columnApi.setColumnVisible('age', event.target.checked);
    }

    function onCbCountry(event) {
        // we only need to update one grid, as the other is a slave
        topGrid.columnApi.setColumnVisible('country', event.target.checked);
    }

    return (
        <div className="container">
            <div className="header">
                <label>
                    <input
                        type="checkbox"
                        defaultChecked={true}
                        onChange={(event) => onCbAthlete(event)}/>Athlete
                </label>
                <label>
                    <input
                        type="checkbox"
                        defaultChecked={true}
                        onChange={event => onCbAge(event)}/>Age
                </label>
                <label>
                    <input
                        type="checkbox"
                        defaultChecked={true}
                        onChange={event => onCbCountry(event)}/>Country
                </label>
            </div>

            <div className="grid ag-theme-alpine">
                <AgGridReact
                    rowData={rowData}
                    gridOptions={topOptions}
                    columnDefs={columnDefs}
                    onGridReady={params => onGridReady(params)}
                    onFirstDataRendered={params => onFirstDataRendered(params)}
                    modules={AllCommunityModules}/>
            </div>

            <div className="grid ag-theme-alpine">
                <AgGridReact
                    rowData={rowData}
                    gridOptions={bottomOptions}
                    columnDefs={columnDefs}
                    modules={AllCommunityModules}/>
            </div>
        </div>
    );
};
