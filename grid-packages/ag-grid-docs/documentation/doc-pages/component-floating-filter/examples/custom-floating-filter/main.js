var columnDefs = [
    { field: 'athlete', filter: false },
    {
        field: 'gold',
        filter: 'agNumberColumnFilter',
        suppressMenu: true,
        floatingFilterComponent: 'customNumberFloatingFilter',
        floatingFilterComponentParams: {
            suppressFilterButton: true,
            color: 'red'
        }
    },
    {
        field: 'silver',
        filter: 'agNumberColumnFilter',
        suppressMenu: true,
        floatingFilterComponent: 'customNumberFloatingFilter',
        floatingFilterComponentParams: {
            suppressFilterButton: true,
            color: 'blue'
        }
    },
    {
        field: 'bronze',
        filter: 'agNumberColumnFilter',
        suppressMenu: true,
        floatingFilterComponent: 'customNumberFloatingFilter',
        floatingFilterComponentParams: {
            suppressFilterButton: true,
            color: 'green'
        }
    },
    {
        field: 'total',
        filter: 'agNumberColumnFilter',
        suppressMenu: true,
        floatingFilterComponent: 'customNumberFloatingFilter',
        floatingFilterComponentParams: {
            suppressFilterButton: true,
            color: 'orange'
        }
    }
];

var gridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        floatingFilter: true,
        resizable: true,
    },
    components: {
        customNumberFloatingFilter: getNumberFloatingFilterComponent()
    },
    columnDefs: columnDefs,
    rowData: null
};

function getNumberFloatingFilterComponent() {
    function NumberFloatingFilter() {
    }

    NumberFloatingFilter.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = '&gt; <input style="width: 30px" type="number" min="0" />';
        this.currentValue = null;
        this.eFilterInput = this.eGui.querySelector('input');
        this.eFilterInput.style.color = params.color;
        var that = this;

        function onInputBoxChanged() {
            if (that.eFilterInput.value === '') {
                // Remove the filter
                params.parentFilterInstance(function(instance) {
                    instance.onFloatingFilterChanged(null, null);
                });
                return;
            }

            that.currentValue = Number(that.eFilterInput.value);
            params.parentFilterInstance(function(instance) {
                instance.onFloatingFilterChanged('greaterThan', that.currentValue);
            });
        }

        this.eFilterInput.addEventListener('input', onInputBoxChanged);
    };

    NumberFloatingFilter.prototype.onParentModelChanged = function(parentModel) {
        // When the filter is empty we will receive a null message her
        if (!parentModel) {
            this.eFilterInput.value = '';
            this.currentValue = null;
        } else {
            this.eFilterInput.value = parentModel.filter + '';
            this.currentValue = parentModel.filter;
        }
    };

    NumberFloatingFilter.prototype.getGui = function() {
        return this.eGui;
    };

    return NumberFloatingFilter;
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
