import BarChartDonations from "./BarChartDonations";
import LineChartProgressive from "./LineChartProgressive";

// Mock or fetched aggregated data example
const barChartData = [
  { month: "Jan", total_volume: 4000 },
  { month: "Feb", total_volume: 3000 },
  { month: "Mar", total_volume: 2000 },
];

const lineChartData = [
  { month: "2025-01-01", quantity: 120 },
  { month: "2025-02-01", quantity: 210 },
  { month: "2025-03-01", quantity: 180 },
];

interface DonationsChartsProps {
  center: string;
}

export default function DonationsCharts({ center }: DonationsChartsProps) {
  // You can replace the above mock data with data fetched by center

  return (
    <div className="donations-charts-container">
      <h2>Donation Volume Over Months - Center: {center}</h2>
      <BarChartDonations data={barChartData} />

      <h2>Donation Trends Over Time</h2>
      <LineChartProgressive data={lineChartData} />
    </div>
  );
}

