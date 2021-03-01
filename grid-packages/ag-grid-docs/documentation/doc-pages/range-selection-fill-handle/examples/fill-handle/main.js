var gridOptions = {
    columnDefs: [
        { field: "athlete", minWidth: 150 },
        { field: "age", maxWidth: 90 },
        { field: "country", minWidth: 150 },
        { field: "year", maxWidth: 90 },
        { field: "date", minWidth: 150 },
        { field: "sport", minWidth: 150 },
        { field: "gold" },
        { field: "silver" },
        { field: "bronze" },
        { field: "total" }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        editable: true
    },
    enableRangeSelection: true,
    enableFillHandle: true,
};

function fillHandleAxis(direction) {
    // call Array slice because IE querySelectorAll returns an
    // Array like object that doesn't support forEach
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.ag-fill-direction'));
    var button = document.querySelector('.ag-fill-direction.' + direction);

    buttons.forEach(function(btn) {
        btn.classList.remove('selected');
    });

    button.classList.add('selected');

    gridOptions.api.setFillHandleDirection(direction);
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
