
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const AnalyticsChart = ({ data = [] }) => {
  if (!data.length) {
    return (
      <div className="empty-chart">
        <p>No click data available yet.</p>
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    date:
      item.date ||
      item.day ||
      item.clicked_at,

    clicks:
      Number(
        item.clicks ??
        item.count ??
        0
      )
  }));

  return (
    <div className="chart-container">
      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <AreaChart data={formattedData}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString(
                undefined,
                {
                  month: "short",
                  day: "numeric"
                }
              )
            }
          />

          <YAxis allowDecimals={false} />

          <Tooltip
            labelFormatter={(value) =>
              new Date(
                value
              ).toLocaleDateString()
            }
          />

          <Area
            type="monotone"
            dataKey="clicks"
            fillOpacity={0.25}
            strokeWidth={2}
          />

        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;