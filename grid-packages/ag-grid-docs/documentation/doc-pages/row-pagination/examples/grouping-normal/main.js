var columnDefs = [
    { field: "athlete" },
    { field: "age" },
    { field: "country", rowGroup: true },
    { field: "year", rowGroup: true },
    { field: "date" },
    { field: "sport", rowGroup: true },
    { field: "gold" },
    { field: "silver" },
    { field: "bronze" },
    { field: "total" }
];

var gridOptions = {
    columnDefs: columnDefs,
    pagination: true,
    paginationPageSize: 10,
    defaultColDef: {
        editable: true,
        sortable: true,
        resizable: true,
        filter: true,
        flex: 1,
        minWidth: 190
    }
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
