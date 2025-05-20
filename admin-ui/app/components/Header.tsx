import { UserCircleIcon } from "@heroicons/react/16/solid";

export default function Header() {
  return (
    <section className="h-[60px] bg-[#1e3a8a] text-white w-full fixed top-0 right-0 left-0 z-100 border-b border-b-gray-100 px-[10px]">
      <nav className="flex justify-between h-full items-center">
        <div>WiFi Access Control Admin</div>
        <div className="flex items-center gap-x-[8px] justify-center">
          <span>
            <UserCircleIcon className="size-8 text-white" />
          </span>
          <span>
            audo401
          </span>
        </div>
      </nav>
    </section>
  );
}
