
function getColumnDefs() {
    return [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'sport' },
        { field: 'year' },
        { field: 'date' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' }
    ];
}

var gridOptions = {
    defaultColDef: {
        initialWidth: 100,
        sortable: true,
        resizable: true,
        filter: true
    },
    columnDefs: getColumnDefs()
};

function setHeaderNames() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function(colDef, index) {
        colDef.headerName = 'C' + index;
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function removeHeaderNames() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function(colDef, index) {
        colDef.headerName = undefined;
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function setValueFormatters() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function(colDef, index) {
        colDef.valueFormatter = function(params) {
            return '[ ' + params.value + ' ]';
        };
    });
    gridOptions.api.setColumnDefs(columnDefs);
    gridOptions.api.refreshCells({ force: true });
}

function removeValueFormatters() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function(colDef, index) {
        colDef.valueFormatter = undefined;
    });
    gridOptions.api.setColumnDefs(columnDefs);
    gridOptions.api.refreshCells({ force: true });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://www.ag-grid.com/example-assets/olympic-winners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
