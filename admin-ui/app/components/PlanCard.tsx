import React, { Dispatch, SetStateAction } from "react";

export type Plan = {
  name: string;
  cost: number;
  duration: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
};

type PlanCardProps = {
  plan: Plan;
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setSelectedMenu: Dispatch<SetStateAction<string | null>>;
};

export default function PlanCard({
  plan,
  openModal,
  setOpenModal,
  setSelectedMenu
}: PlanCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 min-h-[300px] flex flex-col justify-between transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold text-gray-900">
            {plan.name || "Unnamed Plan"}
          </span>
          {plan.is_popular && (
            <span className="bg-yellow-400 text-xs font-bold text-white px-2 py-1 rounded">
              POPULAR
            </span>
          )}
        </div>
        <div className="text-blue-600 font-bold text-xl">
          KES {plan.cost.toFixed(2)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {plan.duration || "No duration specified"}
        </div>
        <ul className="mt-4 list-disc list-inside text-sm text-gray-700 space-y-1">
          {(plan.features || []).length > 0 ? (
            plan.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))
          ) : (
            <li>No features specified</li>
          )}
        </ul>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => {
            setSelectedMenu("Edit Plan");
            setOpenModal((prev) => !prev);
          }}
          className="px-4 py-2 cursor-pointer bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          Edit Plan
        </button>
        <button
          className={`px-4 py-2 text-sm rounded cursor-pointer ${
            plan.is_active
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {plan.is_active ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
}
