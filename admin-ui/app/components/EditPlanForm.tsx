"use client";

import { useState } from "react";

export default function EditPlanForm() {
  const [formData, setFormData] = useState({
    name: "Basic Plan",
    cost: "499.99",
    duration: "Monthly",
    features: "Up to 5 projects,Email support,Basic templates",
    is_popular: false,
    is_active: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;

    const updatedValue =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated Plan", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">Plan Name</label>
        <input
          type="text"
          name="name"
          className="w-full border rounded-md px-3 py-2 h-[60px] focus:outline-none focus:border-blue-600 focus:border-2"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block font-medium">Cost ($)</label>
        <input
          type="number"
          name="cost"
          className="w-full border rounded-md px-3 py-2 h-[60px] focus:outline-none focus:border-blue-600 focus:border-2"
          value={formData.cost}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block font-medium">Duration</label>
        <select
          name="duration"
          className="w-full border rounded-md px-3 py-2 h-[60px] focus:outline-none focus:border-blue-600 focus:border-2"
          value={formData.duration}
          onChange={handleChange}
        >
          <option value="Monthly">Monthly</option>
          <option value="Annually">Annually</option>
        </select>
      </div>

      <div>
        <label className="block font-medium">Features (comma-separated)</label>
        <input
          type="text"
          name="features"
          className="w-full border rounded-md px-3 py-2 h-[60px] focus:outline-none focus:border-blue-600 focus:border-2"
          value={formData.features}
          onChange={handleChange}
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_popular"
            checked={formData.is_popular}
            onChange={handleChange}
            className="scale-150 accent-blue-500"
          />
          Popular
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="scale-150 accent-blue-500"
          />
          Active
        </label>
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md h-[60px] cursor-pointer"
      >
        Save Changes
      </button>
    </form>
  );
}
