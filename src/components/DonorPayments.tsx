import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const PAYMENT_PER_DONATION = 70;

interface DonationByCenter {
  location_id: string;
  total_donations: number;
}

interface PaymentResult {
  location_id: string;
  total_payment: number;
}

export default function DonorPayments() {
  const [payments, setPayments] = useState<PaymentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_total_donations_by_center');

      if (error) {
        console.error("Error fetching payments:", error);
        setPayments([]);
      } else {
        const typedData = (data as DonationByCenter[]) || [];
        // Calculate payments
        const result = typedData.map(({ location_id, total_donations }) => ({
          location_id,
          total_payment: total_donations * PAYMENT_PER_DONATION,
        }));
        setPayments(result);
      }
      setLoading(false);
    }
    fetchPayments();
  }, []);

  if (loading) return <div>Loading donor payments...</div>;

  return (
    <div>
      <h3>Donor Payments By Center</h3>
      <ul>
        {payments.map(({ location_id, total_payment }) => (
          <li key={location_id}>
            {location_id}: ${total_payment.toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

