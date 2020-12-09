import {
    AgAreaSeriesOptions,
    AgCartesianChartOptions,
    AreaSeriesOptions,
    CartesianChartOptions,
    ChartType,
    DropShadowOptions,
    HighlightOptions
} from "@ag-grid-community/core";
import { AgChart, AreaSeries, CartesianChart, ChartTheme } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class AreaChartProxy extends CartesianChartProxy<AreaSeriesOptions> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(options?: CartesianChartOptions<AreaSeriesOptions>): CartesianChart {
        const { grouping, parentElement } = this.chartProxyParams;
        const seriesDefaults = this.getSeriesDefaults();
        const marker = { ...seriesDefaults.marker };
        if (marker.type) { // deprecated
            marker.shape = marker.type;
            delete marker.type;
        }

        options = options || this.chartOptions;
        const agChartOptions = options as AgCartesianChartOptions;

        const xAxisType = options.xAxis.type ? options.xAxis.type : 'category';

        if (grouping) {
            agChartOptions.type = 'groupedCategory';
        }
        agChartOptions.autoSize = true;
        agChartOptions.axes = [{
            type: grouping ? 'groupedCategory' : xAxisType,
            position: 'bottom',
            paddingInner: 1,
            paddingOuter: 0,
            ...this.getXAxisDefaults(xAxisType, options)
        }, {
            type: 'number',
            position: 'left',
            ...options.yAxis
        }];
        agChartOptions.series = [{
            ...seriesDefaults,
            type: 'area',
            fills: seriesDefaults.fill.colors,
            fillOpacity: seriesDefaults.fill.opacity,
            strokes: seriesDefaults.stroke.colors,
            strokeOpacity: seriesDefaults.stroke.opacity,
            strokeWidth: seriesDefaults.stroke.width,
            tooltip: {
                enabled: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled,
                renderer: seriesDefaults.tooltip && seriesDefaults.tooltip.renderer
            },
            marker
        }];

        return AgChart.create(agChartOptions, parentElement);
    }

    public update(params: UpdateChartParams): void {
        this.chartProxyParams.grouping = params.grouping;

        const axisType = this.isTimeAxis(params) ? 'time' : 'category';
        this.updateAxes(axisType);

        if (this.chartType === ChartType.Area) {
            // area charts have multiple series
            this.updateAreaChart(params);
        } else {
            // stacked and normalized has a single series
            let areaSeries = this.chart.series[0] as AreaSeries;

            if (!areaSeries) {
                const seriesDefaults = this.getSeriesDefaults();
                const marker = { ...seriesDefaults.marker };
                if (marker.type) { // deprecated
                    marker.shape = marker.type;
                    delete marker.type;
                }
                areaSeries = AgChart.createComponent({
                    ...seriesDefaults,
                    fills: seriesDefaults.fill.colors,
                    fillOpacity: seriesDefaults.fill.opacity,
                    strokes: seriesDefaults.stroke.colors,
                    strokeOpacity: seriesDefaults.stroke.opacity,
                    strokeWidth: seriesDefaults.stroke.width,
                    marker
                }, 'area.series');

                if (areaSeries) {
                    this.chart.addSeries(areaSeries);
                } else {
                    return;
                }
            }

            const { fills, strokes } = this.getPalette();

            areaSeries.data = this.transformData(params.data, params.category.id);
            areaSeries.xKey = params.category.id;
            areaSeries.xName = params.category.name;
            areaSeries.yKeys = params.fields.map(f => f.colId);
            areaSeries.yNames = params.fields.map(f => f.displayName!);
            areaSeries.fills = fills;
            areaSeries.strokes = strokes;
        }

        this.updateLabelRotation(params.category.id, false, axisType);
    }

    private updateAreaChart(params: UpdateChartParams): void {
        const { chart } = this;

        if (params.fields.length === 0) {
            chart.removeAllSeries();
            return;
        }

        const fieldIds = params.fields.map(f => f.colId);

        const existingSeriesById = (chart.series as AreaSeries[])
            .reduceRight((map, series, i) => {
                const id = series.yKeys[0];
                if (fieldIds.indexOf(id) === i) {
                    map.set(id, series);
                } else {
                    chart.removeSeries(series);
                }
                return map;
            }, new Map<string, AreaSeries>());

        const data = this.transformData(params.data, params.category.id);
        let previousSeries: AreaSeries | undefined;

        let { fills, strokes } = this.getPalette();

        params.fields.forEach((f, index) => {
            let yKey = f.colId;

            // TODO: cross filtering WIP
            let atLeastOneSelectedPoint = false;
            if (this.crossFiltering) {
                data.forEach(d => {
                    d[f.colId + '-total'] = d[f.colId] + d[f.colId + '-filtered-out'];
                    if (d[f.colId + '-filtered-out'] > 0) {
                        atLeastOneSelectedPoint = true;
                    }
                });

                const lastSelectedChartId = params.getCrossFilteringContext().lastSelectedChartId;
                if (lastSelectedChartId === params.chartId) {
                    yKey = f.colId + '-total';
                }
            }

            let areaSeries = existingSeriesById.get(f.colId);
            const fill = fills[index % fills.length];
            const stroke = strokes[index % strokes.length];

            if (areaSeries) {
                areaSeries.data = data;
                areaSeries.xKey = params.category.id;
                areaSeries.xName = params.category.name;
                areaSeries.yKeys = [yKey];
                areaSeries.yNames = [f.displayName!];
                areaSeries.fills = [fill];
                areaSeries.strokes = [stroke];

            } else {
                const seriesDefaults = this.getSeriesDefaults();
                const marker = { ...seriesDefaults.marker };
                if (marker.type) { // deprecated
                    marker.shape = marker.type;
                    delete marker.type;
                }

                const options: any /*InternalAreaSeriesOptions */ = {
                    ...seriesDefaults,
                    data,
                    xKey: params.category.id,
                    xName: params.category.name,
                    yKeys: [yKey],
                    yNames: [f.displayName],
                    fills: [fill],
                    strokes: [stroke],
                    fillOpacity: seriesDefaults.fill.opacity,
                    strokeOpacity: seriesDefaults.stroke.opacity,
                    strokeWidth: seriesDefaults.stroke.width,
                    marker
                };

                areaSeries = AgChart.createComponent(options, 'area.series');
                chart.addSeriesAfter(areaSeries!, previousSeries);
            }

            // TODO crossing filtering WIP
            if (this.crossFiltering) {

                // special custom marker handling to show and hide points
                areaSeries!.marker.enabled = true;
                areaSeries!.marker.formatter = (p: any) => {
                    return {
                        fill: p.highlighted ? 'yellow' : p.fill,
                        size: p.highlighted ? 12 : p.datum[f.colId] > 0 ? 8 : 0,
                    };
                }

                chart.tooltip.delay = 500;

                // make line opaque when some points are deselected
                const ctx = params.getCrossFilteringContext();
                const lastSelectionOnThisChart = ctx.lastSelectedChartId === params.chartId;
                const deselectedPoints = lastSelectionOnThisChart && atLeastOneSelectedPoint;
                areaSeries!.fillOpacity = deselectedPoints ? 0.3 : 1;

                // add node click cross filtering callback to series
                areaSeries!.addEventListener('nodeClick', this.crossFilterCallback);
            }

            previousSeries = areaSeries;
        });
    }

    protected getDefaultOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<AreaSeriesOptions> {
        const options = super.getDefaultOptionsFromTheme(theme);

        const seriesDefaults = theme.getConfig<AgAreaSeriesOptions>('area.series.area');
        options.seriesDefaults = {
            shadow: seriesDefaults.shadow as DropShadowOptions,
            tooltip: {
                enabled: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled,
                renderer: seriesDefaults.tooltip && seriesDefaults.tooltip.renderer
            },
            fill: {
                colors: theme.palette.fills,
                opacity: seriesDefaults.fillOpacity
            },
            stroke: {
                colors: theme.palette.strokes,
                opacity: seriesDefaults.strokeOpacity,
                width: seriesDefaults.strokeWidth
            },
            marker: {
                enabled: seriesDefaults.marker!.enabled,
                shape: seriesDefaults.marker!.shape,
                size: seriesDefaults.marker!.size,
                strokeWidth: seriesDefaults.marker!.strokeWidth,
                formatter: seriesDefaults.marker!.formatter
            },
            lineDash: seriesDefaults.lineDash ? seriesDefaults.lineDash : [0],
            lineDashOffset: seriesDefaults.lineDashOffset,
            highlightStyle: seriesDefaults.highlightStyle as HighlightOptions,
            listeners: seriesDefaults.listeners
        } as AreaSeriesOptions;

        return options;
    }

    protected getDefaultOptions(): CartesianChartOptions<AreaSeriesOptions> {
        const options = this.getDefaultCartesianChartOptions() as CartesianChartOptions<AreaSeriesOptions>;

        options.xAxis.label.rotation = 335;

        options.seriesDefaults = {
            ...options.seriesDefaults,
            fill: {
                ...options.seriesDefaults.fill,
                opacity: this.chartType === ChartType.Area ? 0.7 : 1,
            },
            stroke: {
                ...options.seriesDefaults.stroke,
                width: 3,
            },
            marker: {
                shape: 'circle',
                enabled: true,
                size: 6,
                strokeWidth: 1,
            },
            tooltip: {
                enabled: true,
            },
            shadow: this.getDefaultDropShadowOptions(),
        };

        return options;
    }

    private getSeriesDefaults(): any /*InternalAreaSeriesOptions*/ {
        return {
            ...this.chartOptions.seriesDefaults,
            type: 'area',
            normalizedTo: this.chartType === ChartType.NormalizedArea ? 100 : undefined,
        };
    }
}