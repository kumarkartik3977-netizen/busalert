"use client";

interface BusCardProps {
  busNumber: string;
  eta: number;
  status: "ON_ROUTE" | "DELAYED" | "OFFLINE";
  nextStop: string;
  onSelect: () => void;
}

export default function BusCard({ busNumber, eta, status, nextStop, onSelect }: BusCardProps) {

  const statusClass = {
    ON_ROUTE: "bg-green-100 text-green-800",
    DELAYED: "bg-orange-100 text-orange-800",
    OFFLINE: "bg-gray-100 text-gray-700",
  }[status];

  return (
    <div 
      className="group bg-white rounded-2xl shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">Bus #{busNumber}</p>
          <p className={`text-xl font-bold ${statusClass}`}>{status === "ON_ROUTE" ? "🟢 ON ROUTE" : status === "DELAYED" ? "🟡 DELAYED" : "⚫ OFFLINE"}</p>
        </div>
        <span />
      </div>
      
      <div className="mt-3">
        <p className="text-lg font-medium">{nextStop}</p>
        <p className="text-sm text-gray-500">ETA: {eta} min</p>
      </div>
    </div>
  );
}