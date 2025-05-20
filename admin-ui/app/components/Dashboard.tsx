"use client";

import { useState } from "react";
import FixedContent from "./FixedContent";
import Header from "./Header";
import Modal from "./Modal";
import ScrollableContent from "./ScrollableContent";
import SideNav from "./SideNav";
import { AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);

  return (
    <>
      <AnimatePresence>
        {openModal && (
          <Modal
            openModal={openModal}
            setOpenModal={setOpenModal}
            selectedMenu={selectedMenu}
          />
        )}
      </AnimatePresence>
      <Header />
      <SideNav
        openModal={openModal}
        setOpenModal={setOpenModal}
        setSelectedMenu={setSelectedMenu}
      />
      <main className="ml-[60px] mt-[60px]">
        <FixedContent />
        <ScrollableContent
          openModal={openModal}
          setOpenModal={setOpenModal}
          setSelectedMenu={setSelectedMenu}
        />
      </main>
    </>
  );
}
