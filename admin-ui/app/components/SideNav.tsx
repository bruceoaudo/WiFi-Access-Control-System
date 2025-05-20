import {
  BanknotesIcon,
  Cog6ToothIcon,
  PresentationChartLineIcon,
  Squares2X2Icon,
  TableCellsIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { Dispatch, SetStateAction } from "react";

const icons = [
  { label: "Dashboard", icon: Squares2X2Icon },
  { label: "User Management", icon: UserGroupIcon },
  { label: "Network Monitoring", icon: PresentationChartLineIcon },
  { label: "Transactions", icon: BanknotesIcon },
  { label: "Settings", icon: Cog6ToothIcon },
  { label: "Reports", icon: TableCellsIcon },
];

type SideNavProps = {
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setSelectedMenu: Dispatch<SetStateAction<string | null>>;
};


export default function SideNav({
  openModal,
  setOpenModal,
  setSelectedMenu,
}: SideNavProps) {
  return (
    <nav className="w-[60px] fixed left-0 top-[60px] bottom-0 border-r border-r-gray-100 flex flex-col items-center py-[30px] gap-y-[25px] z-90 text-white bg-[#1e3a8a]">
      {icons.map(({ label, icon: Icon }, index) => {
        const isDashboard = label === "Dashboard";

        return (
          <div
            key={index}
            title={label}
            className={`rounded-md p-1 ${
              isDashboard
                ? "bg-white text-blue-700"
                : "cursor-pointer transition-transform duration-300 hover:-translate-y-2"
            }`}
            {...(!isDashboard && {
              onClick: () => {
                setSelectedMenu(label);
                setOpenModal((prev) => !prev);
              },
            })}
          >
            <Icon
              className={`size-8 ${
                isDashboard ? "text-blue-700" : "text-white"
              }`}
            />
          </div>
        );
      })}
    </nav>
  );
}
