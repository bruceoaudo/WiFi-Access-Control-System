"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import LoadingOverlay from "./LoadingOverlay";
import { FaTable, FaChartBar } from "react-icons/fa";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Transaction = {
  payment_id: number;
  username: string;
  phone_number: string;
  plan_name: string;
  cost: number;
  status: string;
  created_at: string;
};

type GraphData = {
  dates: string[];
  costs: number[];
  timeframe: string;
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({
    dates: [],
    costs: [],
    timeframe: "daily",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<
    "daily" | "weekly" | "monthly" | "custom"
  >("daily");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [view, setView] = useState<"table" | "graph">("table");
  const [chartType, setChartType] = useState<"bar" | "line">("line");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 10; // Records per page

  // Compute cumulative sums for line charts
  const cumulativeCosts = useMemo(() => {
    if (chartType !== "line") return graphData.costs;

    return graphData.costs.reduce((acc, cost, index) => {
      const previousTotal = index > 0 ? acc[index - 1] : 0;
      return [...acc, previousTotal + cost];
    }, [] as number[]);
  }, [graphData.costs, chartType]);

  // Set default chart type based on timeframe
  useEffect(() => {
    setChartType(timeframe === "daily" ? "line" : "bar");
  }, [timeframe]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = `http://localhost:4000/api/v1/admin/get-transactions?timeframe=${timeframe}&page=${currentPage}&limit=${limit}`;

        if (timeframe === "custom" && startDate && endDate) {
          url += `&startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await axios.get(url, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });

        setTransactions(response.data.data);
        setGraphData(response.data.graphData);
        setTotalPages(Math.ceil(response.data.total / limit));
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [timeframe, startDate, endDate, currentPage]);

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

  // Reset to page 1 on timeframe/startDate/endDate change
  useEffect(() => {
    setCurrentPage(1);
  }, [timeframe, startDate, endDate]);

  // Prepare chart data
  const chartData = {
    labels: graphData.dates,
    datasets: [
      {
        label:
          chartType === "line"
            ? "Cumulative Revenue (KES)"
            : "Total Revenue (KES)",
        data: chartType === "line" ? cumulativeCosts : graphData.costs,
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        tension: 0.1, // Makes line charts smoother
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text:
          chartType === "line"
            ? `Cumulative Revenue by ${
                graphData.timeframe === "daily"
                  ? "Hour"
                  : graphData.timeframe === "weekly"
                  ? "Day"
                  : "Week"
              }`
            : `Revenue by ${
                graphData.timeframe === "daily"
                  ? "Hour"
                  : graphData.timeframe === "weekly"
                  ? "Day"
                  : "Week"
              }`,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || "";
            const value = context.raw;
            const cumulativeText =
              chartType === "line"
                ? ` (Cumulative: KSh ${value.toFixed(2)})`
                : ` (KSh ${value.toFixed(2)})`;
            return `${label}${cumulativeText}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Amount (KES)",
        },
      },
      x: {
        title: {
          display: true,
          text:
            graphData.timeframe === "daily"
              ? "Time"
              : graphData.timeframe === "weekly"
              ? "Day"
              : "Week",
        },
      },
    },
  };

  return (
    <div className="relative flex">
      {loading && <LoadingOverlay />}

      {/* Left Pane */}
      <div className="w-16 bg-gray-50 border-r h-screen flex flex-col items-center py-4 gap-4">
        <button
          className={`p-2 rounded hover:bg-gray-200 ${
            view === "graph" ? "bg-blue-200" : ""
          }`}
          onClick={() => setView("graph")}
        >
          <FaChartBar size={22} />
        </button>
        <button
          className={`p-2 rounded hover:bg-gray-200 ${
            view === "table" ? "bg-blue-200" : ""
          }`}
          onClick={() => setView("table")}
        >
          <FaTable size={22} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 max-w-6xl mx-auto">
        {/* Header Filters */}
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

        {/* View Content */}
        {view === "graph" ? (
          <div className="border p-4 rounded bg-white shadow-md">
            {graphData.dates.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No data available for the selected timeframe
              </p>
            ) : (
              <>
                <div className="flex justify-end mb-2">
                  <select
                    value={chartType}
                    onChange={(e) =>
                      setChartType(e.target.value as "bar" | "line")
                    }
                    className="border px-2 py-1 rounded text-sm"
                  >
                    <option value="line">Line Chart</option>
                    <option value="bar">Bar Chart</option>
                  </select>
                </div>
                <div className="h-[350px]">
                  {chartType === "line" ? (
                    <Line data={chartData} options={chartOptions} />
                  ) : (
                    <Bar data={chartData} options={chartOptions} />
                  )}
                </div>
                <div className="mt-4 text-sm text-gray-500 text-center">
                  Showing {graphData.costs.length} data points
                </div>
              </>
            )}
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : transactions.length === 0 ? (
          <p>No {timeframe} transactions found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 rounded shadow-md">
                <thead className="bg-blue-50 text-blue-800 text-sm uppercase">
                  <tr>
                    <th className="px-4 py-2 border">ID</th>
                    <th className="px-4 py-2 border">User</th>
                    <th className="px-4 py-2 border">Phone</th>
                    <th className="px-4 py-2 border">Plan</th>
                    <th className="px-4 py-2 border">Cost (KES)</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr
                      key={tx.payment_id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-2 border text-center">
                        {tx.payment_id}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {tx.username}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {tx.phone_number}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {tx.plan_name}
                      </td>
                      <td className="px-4 py-2 border text-center font-semibold">
                        KSh {tx.cost.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 border text-center capitalize">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tx.status === "success"
                              ? "bg-green-100 text-green-700"
                              : tx.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 border text-center text-sm">
                        {new Date(
                          new Date(tx.created_at).getTime() + 3 * 60 * 60 * 1000
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-4 py-2 rounded bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm font-medium">
                Page <strong>{currentPage}</strong> of{" "}
                <strong>{totalPages}</strong>
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 rounded bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
