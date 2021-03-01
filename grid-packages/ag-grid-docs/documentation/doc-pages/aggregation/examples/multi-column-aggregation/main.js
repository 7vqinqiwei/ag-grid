var gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true, suppressColumnsToolPanel: true },
        { field: 'sport', rowGroup: true, hide: true, suppressColumnsToolPanel: true },
        { field: 'year', pivot: true, hide: true, suppressColumnsToolPanel: true },
        { field: 'gold', aggFunc: 'sum', valueFormatter: numberFormatter },
        { field: 'silver', aggFunc: 'sum', valueFormatter: numberFormatter },
        {
            headerName: 'Ratio',
            colId: 'goldSilverRatio',
            aggFunc: ratioAggFunc,
            valueGetter: ratioValueGetter,
            valueFormatter: ratioFormatter
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        sortable: true,
        filter: true
    },
    autoGroupColumnDef: {
        minWidth: 220
    },
    suppressAggFuncInHeader: true
};

function numberFormatter(params) {
    if (!params.value || params.value === 0) return 0;
    return '' + Math.round(params.value * 100) / 100;
}

function ratioValueGetter(params) {
    if (!params.node.group) {
        // no need to handle group levels - calculated in the 'ratioAggFunc'
        return createValueObject(params.data.gold, params.data.silver);
    }
}

function ratioAggFunc(params) {
    var goldSum = 0;
    var silverSum = 0;
    params.values.forEach(function(value) {
        if (value && value.gold) {
            goldSum += value.gold;
        }
        if (value && value.silver) {
            silverSum += value.silver;
        }
    });
    return createValueObject(goldSum, silverSum);
}

function createValueObject(gold, silver) {
    return {
        gold: gold,
        silver: silver,
        toString: function() {
            return (gold && silver) ? gold / silver : 0;
        }
    };
}

function ratioFormatter(params) {
    if (!params.value || params.value === 0) return '';
    return '' + Math.round(params.value * 100) / 100;
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
