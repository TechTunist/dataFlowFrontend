// BitcoinChart.jsx
import React, { useRef, useEffect, useState } from 'react';
import { createChart } from 'lightweight-charts';

const BitcoinChart = () => {
    const chartContainerRef = useRef();
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // Replace with your API call function
        fetch('http://127.0.0.1:8000/api/btc/price/')
            .then(response => response.json())
            .then(data => {
                const formattedData = data.map(item => ({
                    time: item.date,
                    value: parseFloat(item.close)
                }));             
                
                setChartData(formattedData);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
    }, []);

    useEffect(() => {
        if (chartData.length === 0) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight
            // ... other chart options
        });

        const lineSeries = chart.addLineSeries();
        lineSeries.setData(chartData);

        return () => {
            chart.remove();
        };
    }, [chartData]);

    return <div ref={chartContainerRef} style={{ height: '100%', width: '100%' }} />;
};

export default BitcoinChart;
