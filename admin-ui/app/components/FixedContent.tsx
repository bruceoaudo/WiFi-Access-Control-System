export default function FixedContent() {
  return (
    <section className="fixed h-[150px] border-b border-b-gray-100 right-0 left-[60px] p-5 z-80 bg-gray-100 top-[60px]">
      <div id="top-main-fixed">
        <h1 id="dashboard-title" className="text-2xl font-bold mb-4">
          Dashboard Overview
        </h1>
        <div className="grid grid-cols-4 gap-4 stats-container">
          <div className="stat-card bg-white p-4 rounded shadow text-center">
            <span className="block text-sm font-medium text-gray-500">
              Active Users
            </span>
            <span className="block text-xl font-bold text-gray-800">24</span>
          </div>
          <div className="stat-card bg-white p-4 rounded shadow text-center">
            <span className="block text-sm font-medium text-gray-500">
              Today's Revenue
            </span>
            <span className="block text-xl font-bold text-gray-800">
              KES 3,450
            </span>
          </div>
          <div className="stat-card bg-white p-4 rounded shadow text-center">
            <span className="block text-sm font-medium text-gray-500">
              Network Usage
            </span>
            <span className="block text-xl font-bold text-gray-800">62%</span>
          </div>
          <div className="stat-card bg-white p-4 rounded shadow text-center">
            <span className="block text-sm font-medium text-gray-500">
              New Signups
            </span>
            <span className="block text-xl font-bold text-gray-800">8</span>
          </div>
        </div>
      </div>
    </section>
  );
}
