import React from 'react';
import { ResponseEvent } from '../types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './ResponseDataHandler.css';

interface ResponseDataHandlerProps {
  events: ResponseEvent[];
}

/**
 * Handles response.table and response.chart events
 */
export const ResponseDataHandler: React.FC<ResponseDataHandlerProps> = ({ events }) => {
  const tableEvents = events.filter((e) => e.type === 'response.table');
  const chartEvents = events.filter((e) => e.type === 'response.chart');

  return (
    <div className="response-data-container">
      {tableEvents.map((event, idx) => (
        <TableDisplay key={`table-${idx}`} data={event.data} />
      ))}
      
      {chartEvents.map((event, idx) => (
        <ChartDisplay key={`chart-${idx}`} data={event.data} />
      ))}
    </div>
  );
};

const TableDisplay: React.FC<{ data: any }> = ({ data }) => {
  // Handle different table data formats
  const tableData = data.data || data;
  const headers = tableData.headers || [];
  const rows = tableData.rows || [];

  if (!headers.length && !rows.length) {
    return <div className="data-empty">No table data</div>;
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((header: string, idx: number) => (
                <th key={idx}>{header}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row: any[], rowIdx: number) => (
            <tr key={rowIdx}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx}>{String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper function to truncate long labels for better display
const truncateLabel = (label: string, maxLength: number = 15): string => {
  if (!label || typeof label !== 'string') return String(label);
  return label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
};

// Custom axis tick component for better label rendering
const CustomAxisTick: React.FC<any> = (props) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666"
        transform="rotate(-45)"
        fontSize="11px"
      >
        {truncateLabel(payload.value, 20)}
      </text>
    </g>
  );
};

const ChartDisplay: React.FC<{ data: any }> = ({ data }) => {
  // Parse chart_spec if it's a string
  let chartSpec = data;
  if (data.chart_spec && typeof data.chart_spec === 'string') {
    try {
      chartSpec = JSON.parse(data.chart_spec);
    } catch (e) {
      console.error('Failed to parse chart_spec:', e);
    }
  }
  
  // Extract chart configuration
  const chartData = chartSpec.data || chartSpec;
  const chartType = chartSpec.mark || chartSpec.type || data.spec?.mark?.type || 'bar';
  const title = chartSpec.title || data.title || 'Chart';
  
  // Prepare data for recharts
  let preparedData: any[] = [];
  let xKey = 'name';
  let yKeys: string[] = [];
  
  // Track axis configuration for proper rendering
  let xField = '';
  let yField = '';
  let xType = 'category';
  let yType = 'number';
  
  // Handle different data formats
  if (chartSpec.data?.values) {
    // Vega-lite style with data.values
    preparedData = chartSpec.data.values;
    if (chartSpec.encoding) {
      xField = chartSpec.encoding.x?.field || '';
      yField = chartSpec.encoding.y?.field || '';
      xType = chartSpec.encoding.x?.type || 'category';
      yType = chartSpec.encoding.y?.type || 'number';
      
      // Set keys based on encoding
      if (yType === 'nominal' || yType === 'ordinal') {
        // Horizontal bar chart: y is categorical, x is numeric
        xKey = xField;
        yKeys = [xField];
      } else {
        // Vertical bar chart: x is categorical, y is numeric
        xKey = xField;
        yKeys = [yField];
      }
    }
  } else if (chartData.values) {
    // Vega-lite style
    preparedData = chartData.values;
    if (chartSpec.encoding || chartData.encoding) {
      const encoding = chartSpec.encoding || chartData.encoding;
      xField = encoding.x?.field || '';
      yField = encoding.y?.field || '';
      xType = encoding.x?.type || 'category';
      yType = encoding.y?.type || 'number';
      
      if (yType === 'nominal' || yType === 'ordinal') {
        xKey = xField;
        yKeys = [xField];
      } else {
        xKey = xField;
        yKeys = [yField];
      }
    }
  } else if (chartData.data) {
    // Direct data format
    preparedData = Array.isArray(chartData.data) ? chartData.data : chartData.data.values || [];
    // Try to infer keys from first data point
    if (preparedData.length > 0) {
      const keys = Object.keys(preparedData[0]);
      xKey = keys[0] || 'name';
      yKeys = keys.slice(1);
    }
  } else if (data.spec?.data?.values) {
    // Vega spec format
    preparedData = data.spec.data.values;
    if (data.spec.encoding) {
      xKey = data.spec.encoding.x?.field || 'x';
      yKeys = [data.spec.encoding.y?.field || 'y'];
    }
  } else if (Array.isArray(data)) {
    // Direct array
    preparedData = data;
    if (preparedData.length > 0) {
      const keys = Object.keys(preparedData[0]);
      xKey = keys[0] || 'name';
      yKeys = keys.slice(1);
    }
  }

  // If we couldn't parse the data, show the raw JSON with instructions
  if (preparedData.length === 0) {
    return (
      <div className="data-chart-container">
        <div className="chart-label">📊 {title}</div>
        <pre className="chart-json">{JSON.stringify(data, null, 2)}</pre>
        <div className="chart-note">
          Unable to parse chart data. Expected format with 'data' or 'values' array.
        </div>
        <details style={{ marginTop: '0.5rem' }}>
          <summary style={{ cursor: 'pointer', color: '#667eea' }}>Debug Info</summary>
          <pre className="chart-json">
            {`xKey: ${xKey}\nyKeys: ${JSON.stringify(yKeys)}\nchartType: ${chartType}\npreparedData length: ${preparedData.length}`}
          </pre>
        </details>
      </div>
    );
  }

  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
  
  // Filter out non-numeric data for chart keys if needed
  const numericYKeys = yKeys.filter(key => {
    if (preparedData.length > 0) {
      const value = preparedData[0][key];
      return typeof value === 'number' || !isNaN(parseFloat(value));
    }
    return true;
  });

  // Chart margins to prevent text overflow
  // Generous margins to accommodate axis labels and titles without overlap
  const chartMargin = { top: 20, right: 30, left: 80, bottom: 90 };

  return (
    <div className="data-chart-container">
      <div className="chart-label">📊 {title}</div>
      <ResponsiveContainer width="100%" height={400}>
        {chartType === 'line' ? (
          <LineChart data={preparedData} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xKey} 
              tick={<CustomAxisTick />}
              interval={0}
              height={80}
            />
            <YAxis width={60} />
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {numericYKeys.map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[idx % colors.length]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        ) : chartType === 'pie' ? (
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <Pie
              data={preparedData}
              dataKey={numericYKeys[0] || yKeys[0] || 'value'}
              nameKey={xKey}
              cx="50%"
              cy="45%"
              outerRadius={70}
              label={(entry) => truncateLabel(entry.name || entry[xKey], 12)}
              labelLine={{ strokeWidth: 1 }}
            >
              {preparedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
          </PieChart>
        ) : yType === 'nominal' || yType === 'ordinal' ? (
          // When Y is nominal in Vega-lite, render as vertical bar chart
          // with categories on X-axis and values on Y-axis
          <BarChart data={preparedData} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={yField} 
              tick={<CustomAxisTick />}
              interval={0}
              height={80}
            />
            <YAxis 
              width={80}
              label={chartSpec.encoding?.x?.title ? { 
                value: chartSpec.encoding.x.title, 
                angle: -90, 
                position: 'left',
                offset: 15,
                style: { textAnchor: 'middle', fontSize: '11px' }
              } : undefined}
            />
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar 
              dataKey={xField} 
              fill={colors[0]} 
              name={chartSpec.encoding?.x?.title || xField}
            />
          </BarChart>
        ) : (
          // Traditional vertical bar chart
          <BarChart data={preparedData} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xField} 
              tick={<CustomAxisTick />}
              interval={0}
              height={80}
            />
            <YAxis width={60} />
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {numericYKeys.map((key, idx) => (
              <Bar key={key} dataKey={key} fill={colors[idx % colors.length]} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

