var columnDefs = [
    { field: 'code', maxWidth: 90 },
    { field: 'name', minWidth: 200 },
    {
        field: 'bid',
        cellClass: 'cell-number',
        valueFormatter: numberFormatter,
        cellRenderer: 'agAnimateShowChangeCellRenderer'
    },
    {
        field: 'mid',
        cellClass: 'cell-number',
        valueFormatter: numberFormatter,
        cellRenderer: 'agAnimateShowChangeCellRenderer'
    },
    {
        field: 'ask',
        cellClass: 'cell-number',
        valueFormatter: numberFormatter,
        cellRenderer: 'agAnimateShowChangeCellRenderer'
    },
    {
        field: 'volume',
        cellClass: 'cell-number',
        cellRenderer: 'agAnimateSlideCellRenderer'
    }
];

function numberFormatter(params) {
    if (typeof params.value === 'number') {
        return params.value.toFixed(2);
    }

    return params.value;
}

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true
    },
    enableRangeSelection: true,
    immutableData: true,
    // implement this so that we can do selection
    getRowNodeId: function(data) { return data.code; },

    onGridReady: function(params) {
        var mockServer = createMockServer(),
            initialLoad$ = mockServer.initialLoad(),
            updates$ = mockServer.allDataUpdates();

        initialLoad$.subscribe(function(rowData) {
            // the initial full set of data
            // note that we don't need to un-subscribe here as it's a one off data load
            params.api.setRowData(rowData);

            // now listen for updates
            // we're using immutableData this time, so although we're setting the entire
            // data set here, the grid will only re-render changed rows, improving performance
            updates$.subscribe(function(newRowData) { return params.api.setRowData(newRowData); });
        });
    }
};

document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});

function createMockServer() {
    function MockServer() {
        "use strict";
        this.rowData = [];
    }

    // provides the initial (or current state) of the data
    MockServer.prototype.initialLoad = function() {
        return Rx.Observable.fromPromise(new Promise((resolve, reject) => {
            // do http request to get our sample data - not using any framework to keep the example self contained.
            // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
            let httpRequest = new XMLHttpRequest();
            httpRequest.open('GET', 'https://www.ag-grid.com/example-assets/stocks.json');
            httpRequest.send();
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                    let dataSet = JSON.parse(httpRequest.responseText);

                    // for this demo's purpose, lets cut the data set down to something small
                    let reducedDataSet = dataSet.slice(0, 200);

                    // the sample data has just name and code, we need to add in dummy figures
                    this.rowData = this.backfillData(reducedDataSet);
                    resolve(_.cloneDeep(this.rowData));
                }
            };
        }));
    };

    // provides randomised data updates to some of the rows
    // only returns the changed data rows
    MockServer.prototype.byRowupdates = function() {
        var that = Object(this);

        return Rx.Observable.create(function(observer) {
            var interval = window.setInterval(function() {
                var changes = [];

                // make some mock changes to the data
                that.makeSomePriceChanges(changes);
                that.makeSomeVolumeChanges(changes);
                observer.next(changes);
            }, 1000);

            return function() { window.clearInterval(interval); };
        });
    };

    // provides randomised data updates to some of the rows
    // only all the row data (with some rows changed)
    MockServer.prototype.allDataUpdates = function() {
        var that = Object(this);

        return Rx.Observable.create(function(observer) {
            var interval = setInterval(function() {
                var changes = [];

                // make some mock changes to the data
                that.makeSomePriceChanges(changes);
                that.makeSomeVolumeChanges(changes);

                // this time we don't care about the delta changes only
                // this time we return the full data set which has changed rows within it
                observer.next(_.cloneDeep(that.rowData));
            }, 1000);

            return function() { window.clearInterval(interval); };
        });
    };


    /*
     * The rest of the code exists to create or modify mock data
     * it is not important to understand the rest of the example (i.e. the rxjs part of it)
     */
    MockServer.prototype.backfillData = function(rowData) {
        var that = Object(this);
        // the sample data has just name and code, we need to add in dummy figures
        rowData.forEach(function(dataItem) {
            // have volume a random between 100 and 10,000
            dataItem.volume = Math.floor((Math.random() * 10000) + 100);

            // have mid random from 20 to 300
            dataItem.mid = (Math.random() * 300) + 20;

            that.setBidAndAsk(dataItem);
        });
        return rowData;
    };

    MockServer.prototype.makeSomeVolumeChanges = function(changes) {
        for (var i = 0; i < 10; i++) {
            // pick a data item at random
            var index = Math.floor(this.rowData.length * Math.random()),
                currentRowData = this.rowData[index],
                // change by a value between -5 and 5
                move = (Math.floor(10 * Math.random())) - 5,
                newValue = currentRowData.volume + move;

            currentRowData.volume = newValue;
            changes.push(currentRowData);
        }
    };

    MockServer.prototype.makeSomePriceChanges = function(changes) {
        // randomly update data for some rows
        for (var i = 0; i < 10; i++) {
            var index = Math.floor(this.rowData.length * Math.random()),
                currentRowData = this.rowData[index],
                // change by a value between -1 and 2 with one decimal place
                move = (Math.floor(30 * Math.random())) / 10 - 1,
                newValue = currentRowData.mid + move;

            currentRowData.mid = newValue;
            this.setBidAndAsk(currentRowData);
            changes.push(currentRowData);
        }
    };

    MockServer.prototype.setBidAndAsk = function(dataItem) {
        dataItem.bid = dataItem.mid * 0.98;
        dataItem.ask = dataItem.mid * 1.02;
    };

    return new MockServer();
}
