import { PlusIcon } from "@heroicons/react/24/solid";
import { ModalProps } from "./Modal";
import { Dispatch, SetStateAction } from "react";

type AddNewPlanCardProps = {
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setSelectedMenu: Dispatch<SetStateAction<string | null>>;
};

export default function AddNewPlanCard({
  openModal,
  setOpenModal,
  setSelectedMenu,
}: AddNewPlanCardProps) {
  return (
    <div
      onClick={() => {
        setSelectedMenu("Add New Plan");
        setOpenModal((prev) => !prev);
      }}
      className="flex flex-col items-center justify-center cursor-pointer bg-gray-100 min-h-[250px] rounded-[5px] transition-transform duration-300 hover:-translate-y-2 shadow-sm hover:shadow-md"
    >
      <div>
        <PlusIcon className="size-8 text-blue-500" />
      </div>
      <div className="mt-[10px]">Add New Plan</div>
    </div>
  );
}
