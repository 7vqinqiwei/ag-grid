import { AreaSeriesOptions, CartesianChartOptions } from "@ag-grid-community/core";
import { CartesianChart, ChartTheme } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class AreaChartProxy extends CartesianChartProxy<AreaSeriesOptions> {
    constructor(params: ChartProxyParams);
    protected createChart(options?: CartesianChartOptions<AreaSeriesOptions>): CartesianChart;
    update(params: UpdateChartParams): void;
    private updateAreaChart;
    protected getDefaultOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<AreaSeriesOptions>;
    protected getDefaultOptions(): CartesianChartOptions<AreaSeriesOptions>;
    private getSeriesDefaults;
}
