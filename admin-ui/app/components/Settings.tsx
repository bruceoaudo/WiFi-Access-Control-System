import { useEffect, useState } from "react";
import axios from "axios";

type AdminProfile = {
  name: string;
  email: string;
  phonenumber: string;
};

export default function Settings() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/v1/admin/profile",
          { withCredentials: true }
        );
        setProfile(response.data);
      } catch (err) {
        console.error("Failed to load admin profile:", err);
      }
    };

    fetchProfile();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); // clear previous messages

    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/admin/change-password",
        {
          currentPassword: password,
          newPassword,
        },
        { withCredentials: true }
      );

      setIsError(false);
      setMessage(response.data.message || "Password updated successfully.");
      setPassword("");
      setNewPassword("");
    } catch (err: any) {
      console.error(err);
      setIsError(true);
      if (err.response?.data?.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage("Something went wrong.");
      }
    }
  };

  if (!profile) return <p>Loading settings...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-8">Admin Settings</h2>

      {/* Profile Section */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Profile</h3>

        <div className="mb-2">
          <label className="block text-sm font-medium">Name:</label>
          <input
            type="text"
            value={profile.name}
            className="mt-1 w-full p-2 border border-gray-300 rounded"
            disabled
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium">Email:</label>
          <input
            type="email"
            value={profile.email}
            className="mt-1 w-full p-2 border border-gray-300 rounded"
            disabled
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium">Phone Number:</label>
          <input
            type="text"
            value={profile.phonenumber}
            className="mt-1 w-full p-2 border border-gray-300 rounded"
            disabled
          />
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white shadow rounded p-4">
        <h3 className="text-lg font-semibold mb-2">Change Password</h3>
        <form onSubmit={handlePasswordChange}>
          <div className="mb-2">
            <label className="block text-sm font-medium">Current Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Password
          </button>
        </form>

        {/* Feedback Message */}
        {message && (
          <p className={`mt-3 text-sm ${isError ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}