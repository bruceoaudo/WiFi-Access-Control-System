import { Dispatch, SetStateAction } from "react";
import PlanCard, { Plan } from "./PlanCard";

type PlanListProps = {
  plans: Plan[];
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setSelectedMenu: Dispatch<SetStateAction<string | null>>;
};

export default function PlanList({
  plans,
  openModal,
  setOpenModal,
  setSelectedMenu
}: PlanListProps) {
  return (
    <>
      {plans.map((plan, index) => (
        <PlanCard
          key={plan.plan_id}
          plan={plan}
          openModal={openModal}
          setOpenModal={setOpenModal}
          setSelectedMenu={setSelectedMenu}
        />
      ))}
    </>
  );
}
