var gridOptions = {
    columnDefs: [
        { field: "athlete" },
        { field: "age", maxWidth: 120 },
        { field: "country" },
        { field: "year", maxWidth: 120 },
        { field: "sport" },
        { field: "gold" },
        { field: "silver" },
        { field: "bronze" },
        { field: "total" }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
        resizable: true,
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://www.ag-grid.com/example-assets/olympic-winners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
