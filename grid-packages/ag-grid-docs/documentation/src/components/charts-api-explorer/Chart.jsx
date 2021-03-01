import React from 'react';
import { AgChart } from 'ag-charts-community';
import { data, series } from './templates.jsx';
import { deepClone } from './utils.jsx';
import styles from './Chart.module.scss';

export class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.chart = React.createRef();
        this.useDynamicUpdates = true;
    }

    chartInstance = undefined;
    animationFrameId = 0;

    componentDidMount() {
        this.createChart();
    }

    componentDidUpdate(prevProps) {
        const oldSeriesType = prevProps.options.series[0].type;
        const newSeriesType = this.props.options.series[0].type;
        const hasChangedType = newSeriesType !== oldSeriesType;

        if (this.chartInstance && this.useDynamicUpdates && !hasChangedType) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = requestAnimationFrame(() => {
                AgChart.update(this.chartInstance, this.createOptionsJson());
            });
        } else {
            this.chartInstance && this.chartInstance.destroy();
            this.createChart();
        }
    }

    createChart() {
        this.chartInstance = AgChart.create(this.createOptionsJson());
    }

    createOptionsJson() {
        return {
            container: this.chart.current,
            data,
            series,
            ...deepClone(this.props.options),
        };
    }

    render() {
        return <div id="chart-container" className={styles['chart']} ref={this.chart}></div>;
    }
}
