import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface LineChartProgressiveProps {
  data: Array<Record<string, string | number>>;
}

export default function LineChartProgressive({ data }: LineChartProgressiveProps) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          {Object.keys(data[0] || {}).filter(key => key !== 'month').map((campaignName, i) => (
            <Line
              key={campaignName}
              type="monotone"
              dataKey={campaignName}
              strokeWidth={2.5}
              stroke={["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][i % 4]}
              name={`📣 ${campaignName}`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

