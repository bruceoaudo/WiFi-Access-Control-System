"use client";

import { XMarkIcon } from "@heroicons/react/16/solid";
import { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import Network from "./Network";
import Reports from "./Reports";
import Settings from "./Settings";
import Transactions from "./Transactions";
import UserManagement from "./UserManagement";
import NewPlanForm from "./NewPlanForm";
import EditPlanForm from "./EditPlanForm";

export type ModalProps = {
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  selectedMenu: string | null;
};

export default function Modal({
  openModal,
  setOpenModal,
  selectedMenu,
}: ModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[1000]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Dark semi-transparent background */}
      <motion.div
        className="absolute inset-0 bg-black opacity-50"
        onClick={() => setOpenModal(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Modal content */}
      <motion.section
        className="relative z-[1001] bg-white w-[calc(100%-150px)] rounded-none p-8 shadow-lg mx-auto mt-[0px] h-full overflow-y-auto"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "tween", duration: 0.3 }}
      >
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
          onClick={() => setOpenModal(false)}
        >
          <XMarkIcon className="size-8 text-black cursor-pointer" />
        </button>

        {selectedMenu === "User Management" && <UserManagement />}
        {selectedMenu === "Network Monitoring" && <Network />}
        {selectedMenu === "Settings" && <Settings />}
        {selectedMenu === "Transactions" && <Transactions />}
        {selectedMenu === "Add New Plan" && <NewPlanForm />}
        {selectedMenu === "Edit Plan" && <EditPlanForm />}

        {![
          "User Management",
          "Network Monitoring",
          "Settings",
          "Transactions",
          "Add New Plan",
          "Edit Plan",
        ].includes(selectedMenu ?? "") && (
          <p>Select a feature to view its content.</p>
        )}
      </motion.section>
    </motion.div>
  );
}
