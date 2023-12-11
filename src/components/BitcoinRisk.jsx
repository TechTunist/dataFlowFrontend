import React, { useRef, useEffect, useState } from 'react';
import { createChart } from 'lightweight-charts';

const BitcoinRisk = () => {
    const chartContainerRef = useRef();
    const [chartData, setChartData] = useState([]);

    // function to calculate the risk metric
    const calculateRiskMetric = (data) => {
        // Calculate 374-day moving average
        const movingAverage = data.map((item, index) => {
            const start = Math.max(index - 373, 0);
            const subset = data.slice(start, index + 1);
            const avg = subset.reduce((sum, curr) => sum + curr.value, 0) / subset.length;
            return { ...item, MA: avg };
        });

        // Calculate risk metric
        movingAverage.forEach((item, index) => {
            const preavg = (Math.log(item.value) - Math.log(item.MA)) * index**0.395;
            item.Preavg = preavg;
        });

        // Normalize the Preavg to 0-1 range
        const preavgValues = movingAverage.map(item => item.Preavg);
        const preavgMin = Math.min(...preavgValues);
        const preavgMax = Math.max(...preavgValues);
        const normalizedRisk = movingAverage.map(item => ({
            ...item,
            Risk: (item.Preavg - preavgMin) / (preavgMax - preavgMin)
        }));

        return normalizedRisk;
    };

    // Fetch and process data
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/btc/price/')
            .then(response => response.json())
            .then(data => {
                const formattedData = data.map(item => ({
                    time: item.date,
                    value: parseFloat(item.close)
                }));             
                const withRiskMetric = calculateRiskMetric(formattedData);
                setChartData(withRiskMetric);
            })
            .catch(error => console.error('Error fetching data: ', error));
    }, []);

    // Render chart
    useEffect(() => {
        if (chartData.length === 0) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            layout: {
                background: { type: 'solid', color: 'black' },
                textColor: 'white',
            },
            grid: {
                vertLines: { color: 'rgba(70, 70, 70, 0.5)' },
                horzLines: { color: 'rgba(70, 70, 70, 0.5)' },
            },
            rightPriceScale: {
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
                borderVisible: false,
            },
            leftPriceScale: {
                borderVisible: false,
                mode: 1, // Logarithmic scale
            },
            timeScale: {
                minBarSpacing: 0.001,
                fixLeftEdge: true,
                fixRightEdge: true,
                mouseWheel: false,
                lockVisibleTimeRangeOnResize: true,
            },
            handleScroll: false,
            handleScale: false,
        });
        
        // Series for Risk Metric
        const riskSeries = chart.addLineSeries({
            color: 'red',
            lastValueVisible: false,
            priceScaleId: 'right',
        });
        riskSeries.setData(chartData.map(data => ({ time: data.time, value: data.Risk })));
        
        // Series for Bitcoin Price on Logarithmic Scale
        const priceSeries = chart.addLineSeries({
            color: 'gray',
            priceScaleId: 'left',
        });
        priceSeries.setData(chartData.map(data => ({ time: data.time, value: data.value })));

        
        // Disable all interactions
        chart.applyOptions({
            handleScroll: false,
            handleScale: false,
        });

        // // Configure the specific price scale for the risk series
        // chart.priceScale('risk-metric-scale').applyOptions({
        //     autoScale: false,
        //     scaleMargins: {
        //         top: 0.1,
        //         bottom: 0,
        //     },
        //     borderVisible: false,
        //     entireTextOnly: true,
        //     mode: 2, // Log scale
        //     invertScale: false,
        //     alignLabels: true,
        //     drawTicks: true,
        //     visible: true,
        //     highPrice: 1,
        //     lowPrice: 0,
        // });
        
        chart.priceScale('left').applyOptions({
            mode: 1, // Logarithmic scale
            borderVisible: false,
        });
        
        // Function to update chart size
        const resizeChart = () => {
            if (chart && chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', resizeChart);
        resizeChart();

        chart.timeScale().fitContent();

        return () => {
            chart.remove();
            window.removeEventListener('resize', resizeChart);
        };
    }, [chartData]);

    return <div ref={chartContainerRef} style={{ height: '100%', width: '100%' }} />;
};

export default BitcoinRisk;
