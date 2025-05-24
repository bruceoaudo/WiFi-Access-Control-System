"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import LoadingOverlay from "./LoadingOverlay"; // Adjust path as needed

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

type GraphDataPoint = {
  date: string;
  count: number;
};

type GraphProps = {
  timeframe: "daily" | "weekly" | "monthly" | "custom";
  startDate: string;
  endDate: string;
};

export default function Graph({ timeframe, startDate, endDate }: GraphProps) {
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGraphData = async () => {
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

        setGraphData(response.data.graphData);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch graph data.");
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [timeframe, startDate, endDate]);

  const labels = graphData.map((dataPoint) =>
    new Date(dataPoint.date).toLocaleDateString()
  );
  const dataCounts = graphData.map((dataPoint) => dataPoint.count);

  const data = {
    labels,
    datasets: [
      {
        label: "Successful Transactions",
        data: dataCounts,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="relative border p-8 rounded bg-gray-50 text-center text-gray-600 min-h-[300px]">
      {loading && <LoadingOverlay />}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && graphData.length === 0 && (
        <div>No data available for the selected timeframe.</div>
      )}
      {!loading && !error && graphData.length > 0 && <Line data={data} />}
    </div>
  );
}