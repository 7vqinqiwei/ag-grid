import Vue from "vue";

export default Vue.extend({
    template: `
        <div class="custom-tooltip" v-if="isHeader">
            <p>Group Name: {{params.value}}</p>
            <hr v-if="isGroupedHeader"></hr>
            <div v-if="isGroupedHeader">
                <p v-for="(header, idx) in params.colDef.children">
                    Child {{(idx + 1)}} - {{header.headerName}}
                </p>
            </div>
        </div>
        <div class="custom-tooltip" v-else>
            <p><span>Athlete's Name:</span></p>
            <p><span>{{athlete}}</span></p>
        </div>
    `,
    data: function() {
        return {
            athlete: null
        };
    },
    beforeMount() {
        var params = this.params,
            isHeader = params.rowIndex === undefined,
            isGroupedHeader = !!params.colDef.children,
            valueToDisplay = params.value.value ? params.value.value : '- Missing -';

        this.setState({
            athlete: valueToDisplay,
            isHeader: isHeader,
            isGroupedHeader: isGroupedHeader
        });
    },
    methods: {
        setState(obj) {
            const that = this;

            Object.keys(obj).forEach(function(key) { that[key] = obj[key]; });
        }
    }
});
