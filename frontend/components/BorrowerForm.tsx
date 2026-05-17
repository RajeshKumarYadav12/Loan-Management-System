"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function BorrowerForm() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    pan: "",
    dob: "",
    salary: 25000,
    employmentMode: "Salaried",
    amount: 50000,
    tenure: 30,
    salarySlip: null as File | null,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Safe Number Conversion
  const principal = Number(form.amount || 0);
  const tenureDays = Number(form.tenure || 0);

  // Simple Interest Formula
  const interest = (principal * 12 * tenureDays) / (365 * 100);

  const totalRepayment = principal + interest;

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement;

    const { name, value, files, type } = target;

    setForm((prev) => ({
      ...prev,
      [name]: files?.length
        ? files[0]
        : type === "range" || type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const data = new FormData();

      data.append("name", form.name);
      data.append("pan", form.pan);
      data.append("dob", form.dob);
      data.append("salary", form.salary.toString());
      data.append("employmentMode", form.employmentMode);
      data.append("amount", form.amount.toString());
      data.append("tenure", form.tenure.toString());

      if (form.salarySlip) {
        data.append("salarySlip", form.salarySlip);
      }

      await axios.post("http://localhost:5000/api/loans/apply", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Loan Application Submitted Successfully!");

      router.push("/borrower");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Application failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-blue-600/20 blur-3xl rounded-full"></div>

      <div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] bg-cyan-500/10 blur-3xl rounded-full"></div>

      <div className="w-full max-w-3xl bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Loan Application</h1>

            <p className="text-gray-400 text-sm mt-1">
              Complete all steps carefully
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 transition"
          >
            Logout
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Progress */}
        <div className="flex items-center gap-3 mb-10">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                step >= item ? "bg-blue-600" : "bg-white/10"
              }`}
            >
              {item}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Personal Details</h2>

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:border-blue-500"
                required
              />

              <input
                type="text"
                name="pan"
                placeholder="PAN Number"
                value={form.pan}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/10 uppercase focus:outline-none focus:border-blue-500"
                required
              />

              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:border-blue-500"
                required
              />

              <input
                type="number"
                name="salary"
                placeholder="Monthly Salary"
                value={form.salary}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:border-blue-500"
                required
              />

              <select
                name="employmentMode"
                value={form.employmentMode}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:border-blue-500"
              >
                <option value="Salaried">Salaried</option>

                <option value="Self-Employed">Self-Employed</option>

                <option value="Unemployed">Unemployed</option>
              </select>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-semibold">Upload Salary Slip</h2>

              <input
                type="file"
                name="salarySlip"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/10 file:bg-blue-600 file:border-0 file:text-white file:px-4 file:py-2 file:rounded-lg"
                required
              />

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-xl transition"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold">Loan Configuration</h2>

              {/* Amount */}
              <div>
                <div className="flex justify-between mb-2">
                  <span>Loan Amount</span>

                  <span className="font-bold">
                    ₹{principal.toLocaleString()}
                  </span>
                </div>

                <input
                  type="range"
                  name="amount"
                  min={50000}
                  max={500000}
                  step={1000}
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Tenure */}
              <div>
                <div className="flex justify-between mb-2">
                  <span>Tenure</span>

                  <span className="font-bold">{tenureDays} Days</span>
                </div>

                <input
                  type="range"
                  name="tenure"
                  min={30}
                  max={365}
                  value={form.tenure}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Calculation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl">
                  <p className="text-sm text-blue-300">Interest (12% p.a.)</p>

                  <h3 className="text-2xl font-bold mt-2">
                    ₹{Number(interest).toFixed(2)}
                  </h3>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl">
                  <p className="text-sm text-green-300">Total Repayment</p>

                  <h3 className="text-2xl font-bold mt-2">
                    ₹{Number(totalRepayment).toFixed(2)}
                  </h3>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-xl transition"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Apply Loan"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
