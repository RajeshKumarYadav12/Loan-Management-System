"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  const [items, setItems] = useState<any[]>([]);

  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Payment states
  const [utr, setUtr] = useState("");

  const [amount, setAmount] = useState("");

  const [paymentDate, setPaymentDate] = useState("");

  const router = useRouter();

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      const storedUser = localStorage.getItem("user");

      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        router.push("/login");

        return;
      }

      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);

      let url = "";

      // Role Based APIs
      switch (parsedUser.role) {
        case "sales":
          url = "http://localhost:5000/api/dashboard/sales/leads";
          break;

        case "sanction":
          url = "http://localhost:5000/api/loans/applied";
          break;

        case "disbursement":
          url = "http://localhost:5000/api/loans/sanctioned";
          break;

        case "collection":
          url = "http://localhost:5000/api/loans/disbursed";
          break;

        case "admin":
          url = "http://localhost:5000/api/loans";
          break;

        case "borrower":
          router.push("/borrower");
          return;

        default:
          setError("Invalid role");
          return;
      }

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems(res.data);
    } catch (err: any) {
      console.log(err);

      setError(
        err?.response?.data?.message || "Failed to fetch dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle Actions
  const handleAction = async (action: string, loanId: string) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/api/loans/${loanId}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert(`Loan ${action}ed successfully`);

      setSelectedItem(null);

      fetchDashboardData();
    } catch (err: any) {
      alert(err?.response?.data?.message || `Failed to ${action} loan`);
    }
  };

  // Handle Payment
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/api/payments/${selectedItem._id}`,
        {
          utr,
          amount: Number(amount),
          date: paymentDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Payment recorded successfully");

      setUtr("");
      setAmount("");
      setPaymentDate("");

      setSelectedItem(null);

      fetchDashboardData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Payment failed");
    }
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect properly
    window.location.href = "/login";
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-[-150px] right-[-150px] w-[400px] h-[400px] bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl">
            {user.name?.charAt(0)}
          </div>

          <div>
            <h1 className="text-2xl font-bold">{user.role.toUpperCase()}</h1>

            <p className="text-gray-400 text-sm">Dashboard Panel</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition cursor-pointer relative z-50"
        >
          Sign Out
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold">Active Queue</h2>

            <span className="text-sm text-gray-400">{items.length} Items</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                <tr>
                  <th className="text-left p-4">Borrower</th>

                  <th className="text-left p-4">Amount</th>

                  <th className="text-left p-4">Tenure</th>

                  <th className="text-left p-4">Status</th>

                  <th className="text-right p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-10 text-gray-500">
                      No records found
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="p-4">
                        <div className="font-medium">
                          {item.borrower?.name || item.name || "Unknown"}
                        </div>

                        <div className="text-xs text-gray-500">
                          {item.email || item.borrower?.email || item._id}
                        </div>
                      </td>

                      <td className="p-4">
                        {item.amount
                          ? `₹${item.amount.toLocaleString()}`
                          : "Lead"}
                      </td>

                      <td className="p-4">
                        {item.tenure ? `${item.tenure} Days` : "-"}
                      </td>

                      <td className="p-4">
                        <span className="px-3 py-1 rounded-lg text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {item.status || "LEAD"}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="text-blue-400 hover:text-blue-300 cursor-pointer"
                        >
                          Review →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {selectedItem ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl sticky top-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Details</h2>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Borrower</p>

                  <p className="font-medium">
                    {selectedItem.borrower?.name || selectedItem.name}
                  </p>
                </div>

                {selectedItem.amount && (
                  <>
                    <div>
                      <p className="text-gray-400 text-sm">Loan Amount</p>

                      <p>₹{selectedItem.amount.toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Tenure</p>

                      <p>{selectedItem.tenure} Days</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Total Repayment</p>

                      <p className="text-green-400 font-bold">
                        ₹{selectedItem.totalRepayment?.toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* SANCTION */}
              {(user.role === "sanction" || user.role === "admin") &&
                selectedItem.status === "APPLIED" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction("sanction", selectedItem._id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleAction("reject", selectedItem._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl"
                    >
                      Reject
                    </button>
                  </div>
                )}

              {/* DISBURSE */}
              {(user.role === "disbursement" || user.role === "admin") &&
                selectedItem.status === "SANCTIONED" && (
                  <button
                    onClick={() => handleAction("disburse", selectedItem._id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl"
                  >
                    Mark Disbursed
                  </button>
                )}

              {/* COLLECTION */}
              {(user.role === "collection" || user.role === "admin") &&
                selectedItem.status === "DISBURSED" && (
                  <form onSubmit={handlePayment} className="space-y-4">
                    <input
                      type="text"
                      placeholder="UTR Number"
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
                      required
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                    />

                    <input
                      type="number"
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                    />

                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      required
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                    />

                    <button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl"
                    >
                      Record Payment
                    </button>
                  </form>
                )}

              {selectedItem.status === "CLOSED" && (
                <div className="text-gray-500 hover:text-white cursor-pointer">
                  Loan Closed
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center text-gray-500">
              Select an item to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
