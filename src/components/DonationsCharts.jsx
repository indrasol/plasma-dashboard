import BarChartDonations from "./BarChartDonations";
import LineChartProgressive from "./LineChartProgressive"; // Assuming you have this

// Mock or fetched aggregated data example
const barChartData = [
  { month: "Jan", total_volume: 4000 },
  { month: "Feb", total_volume: 3000 },
  { month: "Mar", total_volume: 2000 },
];

const lineChartData = [
  { date: "2025-01-01", quantity: 120 },
  { date: "2025-02-01", quantity: 210 },
  { date: "2025-03-01", quantity: 180 },
];

export default function DonationsCharts({ center }) {
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
