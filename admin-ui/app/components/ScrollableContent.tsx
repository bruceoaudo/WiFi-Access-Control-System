import AddNewPlanCard from "./AddNewPlanCard";
import PlanList from "./PlanList";
import { Plan } from "./PlanCard";
import { Dispatch, SetStateAction } from "react";


type ScrollableContentProps = {
  plans:Plan[]
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setSelectedMenu: Dispatch<SetStateAction<string | null>>;
};

export default function ScrollableContent({
  plans,
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
