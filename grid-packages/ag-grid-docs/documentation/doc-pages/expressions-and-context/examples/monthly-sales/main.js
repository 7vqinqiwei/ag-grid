var monthValueGetter = '(ctx.month < colDef.month) ? data[colDef.field + "_bud"] : data[colDef.field + "_act"]';
var monthCellClassRules = {
    'cell-act': 'ctx.month < colDef.month',
    'cell-bud': 'ctx.month >= colDef.month',
    'cell-negative': 'x < 0'
};
var yearToDateValueGetter = 'var total = 0; ctx.months.forEach( function(monthName, monthIndex) { if (monthIndex<=ctx.month) { total += data[monthName + "_act"]; } }); return total; ';
var accountingCellRenderer = function(params) {
    if (params.value == null) {
        return '';
    } else if (params.value >= 0) {
        return params.value.toLocaleString();
    } else {
        return '(' + Math.abs(params.value).toLocaleString() + ')';
    }
};

var columnDefs = [
    {
        field: 'country', rowGroup: true, hide: true
    },
    {
        headerName: 'Monthly Data',
        children: [
            {
                headerName: 'Jan', field: 'jan', month: 0, cellRenderer: accountingCellRenderer,
                cellClass: 'cell-figure', valueGetter: monthValueGetter,
                cellClassRules: monthCellClassRules, aggFunc: 'sum'
            },

            {
                headerName: 'Feb', field: 'feb', month: 1, cellRenderer: accountingCellRenderer,
                cellClass: 'cell-figure', valueGetter: monthValueGetter,
                cellClassRules: monthCellClassRules, aggFunc: 'sum'
            },

            {
                headerName: 'Mar', field: 'mar', month: 2, cellRenderer: accountingCellRenderer,
                cellClass: 'cell-figure', valueGetter: monthValueGetter,
                cellClassRules: monthCellClassRules, aggFunc: 'sum'
            },

            {
                headerName: 'Apr', field: 'apr', month: 3, cellRenderer: accountingCellRenderer,
                cellClass: 'cell-figure', valueGetter: monthValueGetter,
                cellClassRules: monthCellClassRules, aggFunc: 'sum'
            },

            {
                headerName: 'May', field: 'may', month: 4, cellRenderer: accountingCellRenderer,
                cellClass: 'cell-figure', valueGetter: monthValueGetter,
                cellClassRules: monthCellClassRules, aggFunc: 'sum'
            },

            {
                headerName: 'Jun', field: 'jun', month: 5, cellRenderer: accountingCellRenderer,
                cellClass: 'cell-figure', valueGetter: monthValueGetter,
                cellClassRules: monthCellClassRules, aggFunc: 'sum'
            },

            {
                headerName: 'YTD', cellClass: 'cell-figure', cellRenderer: accountingCellRenderer,
                valueGetter: yearToDateValueGetter, cellStyle: { 'font-weight': 'bold' }, aggFunc: 'sum'
            }
        ]
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 120,
        sortable: true,
        resizable: true
    },
    autoGroupColumnDef: {
        headerName: "Location",
        field: "city",
        minWidth: 260,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
            checkbox: true
        }
    },
    animateRows: true,
    rowSelection: 'multiple',
    groupSelectsChildren: true,
    enableRangeSelection: true,
    context: {
        month: 0,
        months: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    },
    onModelUpdated: modelUpdated,
};

var monthNames = ['Budget Only', 'Year to Jan', 'Year to Feb', 'Year to Mar', 'Year to Apr', 'Year to May',
    'Year to Jun', 'Year to Jul', 'Year to Aug', 'Year to Sep', 'Year to Oct', 'Year to Nov', 'Full Year'];

onChangeMonth = function(i) {
    var newMonth = gridOptions.context.month += i;

    if (newMonth < -1) {
        newMonth = -1;
    }
    if (newMonth > 5) {
        newMonth = 5;
    }

    gridOptions.context.month = newMonth;
    document.querySelector('#monthName').innerHTML = monthNames[newMonth + 1];
    gridOptions.api.refreshClientSideRowModel('aggregate');
    gridOptions.api.refreshCells();
};

function onQuickFilterChanged(value) {
    gridOptions.api.setQuickFilter(value);
}

function modelUpdated() {
    if (gridOptions.rowData) {
        var model = gridOptions.api.getModel();
        var totalRows = gridOptions.rowData.length;
        var processedRows = model.getVirtualRowCount();
        document.querySelector('#rowCount').innerHTML = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://www.ag-grid.com/example-assets/monthly-sales.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
