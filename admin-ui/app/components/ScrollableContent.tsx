import AddNewPlanCard from "./AddNewPlanCard";
import PlanList from "./PlanList";
import { Plan } from "./PlanCard";
import { Dispatch, SetStateAction } from "react";

const plans: Plan[] = [
  // Example plans
  {
    name: "Premium Plan",
    cost: 1499.99,
    duration: "Monthly",
    features: [
      "Unlimited projects",
      "Priority support",
      "Access to premium templates",
      "Team collaboration tools",
    ],
    is_popular: true,
    is_active: true,
  },
  {
    name: "Basic Plan",
    cost: 499.99,
    duration: "Monthly",
    features: ["Up to 5 projects", "Email support", "Basic templates"],
    is_popular: false,
    is_active: true,
  },
  {
    name: "Enterprise Plan",
    cost: 4999.99,
    duration: "Annually",
    features: [
      "Dedicated account manager",
      "Custom integrations",
      "Unlimited storage",
      "Onboarding & training sessions",
    ],
    is_popular: false,
    is_active: false,
  },
];

type ScrollableContentProps = {
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setSelectedMenu: Dispatch<SetStateAction<string | null>>;
};

export default function ScrollableContent({
  openModal,
  setOpenModal,
  setSelectedMenu
}: ScrollableContentProps) {
  return (
    <section className="mt-[230px] p-[20px] min-h-[calc(100vh-210px)]">
      <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
        <PlanList
          plans={plans}
          openModal={openModal}
          setOpenModal={setOpenModal}
          setSelectedMenu={setSelectedMenu}
        />
        <AddNewPlanCard
          openModal={openModal}
          setOpenModal={setOpenModal}
          setSelectedMenu={setSelectedMenu}
        />
      </div>
    </section>
  );
}
