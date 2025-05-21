"use client";

import { useEffect, useState } from "react";
import FixedContent from "./FixedContent";
import Header from "./Header";
import Modal from "./Modal";
import ScrollableContent from "./ScrollableContent";
import SideNav from "./SideNav";
import { AnimatePresence } from "framer-motion";
import axios from "axios";
import LoadingOverlay from "./LoadingOverlay";
import { getSocket } from "../lib/socket";

export default function Dashboard() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSignups, setNewSignups] = useState(0);

  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("register", (data) => {
      console.log("New user registered:", data);
      setNewSignups(data.count); // Update count in real-time
    });

    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:4000/api/v1/admin/get-plans",
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setPlans(response.data);
      } catch (error: any) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <AnimatePresence>{loading && <LoadingOverlay />}</AnimatePresence>
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
        <FixedContent newSignups={newSignups} />
        <ScrollableContent
          plans={plans}
          openModal={openModal}
          setOpenModal={setOpenModal}
          setSelectedMenu={setSelectedMenu}
        />
      </main>
    </>
  );
}
