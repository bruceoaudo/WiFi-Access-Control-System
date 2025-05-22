import { useEffect, useState } from "react";
import axios from "axios";

type Transaction = {
  payment_id: number;
  username: string;
  phone_number: string;
  plan_name: string;
  cost: number;
  status: string;
  created_at: string;
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<
    "daily" | "weekly" | "monthly" | "custom"
  >("daily");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = `http://localhost:4000/api/v1/admin/get-transactions?timeframe=${timeframe}`;

        if (timeframe === "custom" && startDate && endDate) {
          url += `&startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await axios.get(url, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });

        setTransactions(response.data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [timeframe, startDate, endDate]);

  const downloadCSV = () => {
    const headers = ["ID", "User", "Phone", "Plan", "Cost", "Status", "Date"];
    const rows = transactions.map((tx) => [
      tx.payment_id,
      tx.username,
      tx.phone_number,
      tx.plan_name,
      `KSh ${tx.cost.toFixed(2)}`,
      tx.status,
      new Date(
        new Date(tx.created_at).getTime() + 3 * 60 * 60 * 1000
      ).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((row) => row.map((val) => `"${val}"`).join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${timeframe}_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Mpesa
          Transactions
        </h2>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="border px-3 py-1 rounded"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>

          {timeframe === "custom" && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border px-2 py-1 rounded"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border px-2 py-1 rounded"
              />
            </>
          )}

          <button
            onClick={downloadCSV}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            Download CSV
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading transactions...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : transactions.length === 0 ? (
        <p>No {timeframe} transactions found.</p>
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
                <td className="p-2 border">KSh {tx.cost.toFixed(2)}</td>
                <td className="p-2 border capitalize">{tx.status}</td>
                <td className="p-2 border">
                  {new Date(
                    new Date(tx.created_at).getTime() + 3 * 60 * 60 * 1000
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
