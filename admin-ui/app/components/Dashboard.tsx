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
  const [dailyRevenue, setDailyRevenue] = useState(0);


  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("register", (data) => {
      setNewSignups(data.count);
    });

    socket.on("revenue_update", (data) => {
      setDailyRevenue(data.total);
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

     const fetchSignupCount = async () => {
       try {
         const response = await axios.get(
           "http://localhost:4000/api/v1/admin/daily-signups",
           {
             headers: { "Content-Type": "application/json" },
             withCredentials: true,
           }
         );
         setNewSignups(response.data.count); // Initialize with existing count
       } catch (error) {
         console.error("Failed to fetch today's signup count:", error);
       }
     };
    
    const fetchDailyRevenue = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/v1/admin/daily-revenue",
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setDailyRevenue(response.data.total);
      } catch (error) {
        console.error("Failed to fetch today's revenue:", error);
      }
    };


    fetchPlans();
    fetchSignupCount()
    fetchDailyRevenue()

    return () => {
      socket.off("register");
      socket.off("revenue_update");
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
        <FixedContent newSignups={newSignups} dailyRevenue={dailyRevenue} />
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
