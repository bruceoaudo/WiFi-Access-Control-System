import { useEffect, useState } from "react";
import axios from "axios";

type Transaction = {
  payment_id: number;
  username: string;
  phone_number: string;
  plan_name: string;
  cost: string;
  status: string;
  created_at: string;
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:4000/api/v1/admin/get-all-transactions",
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setTransactions(response.data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">MPESA Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Plan</th>
              <th className="p-2 border">Cost (KES)</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.payment_id} className="text-center">
                <td className="p-2 border">{tx.payment_id}</td>
                <td className="p-2 border">{tx.username}</td>
                <td className="p-2 border">{tx.phone_number}</td>
                <td className="p-2 border">{tx.plan_name}</td>
                <td className="p-2 border">
                  KSh {parseFloat(tx.cost).toFixed(2)}
                </td>
                <td className="p-2 border capitalize">{tx.status}</td>
                <td className="p-2 border">
                  {new Date(tx.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}