"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  AlertTriangle,
  UserCheck,
  Phone,
  CreditCard,
  FileText,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { IEmployee, AttendanceStatus } from "@/types/domain";

export default function EmployeesPage() {
  const {
    employees,
    attendance,
    salaryRecords,
    leaveRequests,
    addEmployee,
    markAttendance,
    recordSalaryPayment,
    submitLeaveRequest,
    updateLeaveRequestStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"EMPLOYEES" | "ATTENDANCE" | "PAYROLL" | "LEAVE">("EMPLOYEES");

  // Selected Month for Attendance & Payroll
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-10");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || "");

  // Add Employee Form State
  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState(false);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpDesignation, setNewEmpDesignation] = useState("Pharmacist");
  const [newEmpPhone, setNewEmpPhone] = useState("");
  const [newEmpNid, setNewEmpNid] = useState("");
  const [newEmpAddress, setNewEmpAddress] = useState("");
  const [newEmpSalary, setNewEmpSalary] = useState(20000);
  const [newEmpPhoto, setNewEmpPhoto] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80");

  // New Leave Request State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveEmpId, setLeaveEmpId] = useState(employees[0]?.id || "");
  const [leaveType, setLeaveType] = useState<"SICK" | "CASUAL" | "ANNUAL">("CASUAL");
  const [leaveStartDate, setLeaveStartDate] = useState("2026-10-15");
  const [leaveEndDate, setLeaveEndDate] = useState("2026-10-16");
  const [leaveReason, setLeaveReason] = useState("");

  // Bonus & Advance Inputs for Payroll
  const [payrollBonusMap, setPayrollBonusMap] = useState<Record<string, number>>({});
  const [payrollAdvanceMap, setPayrollAdvanceMap] = useState<Record<string, number>>({});

  // Active Employee object
  const activeEmployee = employees.find((e) => e.id === selectedEmployeeId) || employees[0];

  // Attendance metrics for selected month
  const monthlyAttendanceSummary = useMemo(() => {
    return employees.map((emp) => {
      const empMonthAtt = attendance.filter(
        (a) => a.employeeId === emp.id && a.date.startsWith(selectedMonth)
      );

      const presentCount = empMonthAtt.filter((a) => a.status === "PRESENT").length;
      const absentCount = empMonthAtt.filter((a) => a.status === "ABSENT").length;
      const leaveCount = empMonthAtt.filter((a) => a.status === "LEAVE").length;
      const halfDayCount = empMonthAtt.filter((a) => a.status === "HALF_DAY").length;
      const totalRecorded = empMonthAtt.length;
      const attendanceRate = totalRecorded > 0 ? Math.round(((presentCount + leaveCount) / totalRecorded) * 100) : 100;

      // Auto salary deduction: (baseSalary / 30) * absentDays
      const dailyRate = emp.baseSalary / 30;
      const absenceDeduction = Math.round(dailyRate * absentCount * 100) / 100;

      const bonus = payrollBonusMap[emp.id] || 0;
      const advance = payrollAdvanceMap[emp.id] || 0;
      const netSalary = Math.round((emp.baseSalary + bonus - advance - absenceDeduction) * 100) / 100;

      const isPaid = salaryRecords.some(
        (s) => s.employeeId === emp.id && s.month === selectedMonth && s.status === "PAID"
      );

      return {
        employee: emp,
        presentCount,
        absentCount,
        leaveCount,
        halfDayCount,
        totalRecorded,
        attendanceRate,
        absenceDeduction,
        bonus,
        advance,
        netSalary,
        isPaid,
      };
    });
  }, [employees, attendance, selectedMonth, payrollBonusMap, payrollAdvanceMap, salaryRecords]);

  // Calendar days generation for selected month (e.g. October 2026: 31 days)
  const calendarDays = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedMonth}-${String(day).padStart(2, "0")}`;
      const attRecord = attendance.find(
        (a) => a.employeeId === selectedEmployeeId && a.date === dateStr
      );
      days.push({
        dayNumber: day,
        dateStr,
        status: attRecord ? attRecord.status : null,
        notes: attRecord?.notes,
      });
    }
    return days;
  }, [selectedMonth, selectedEmployeeId, attendance]);

  // Today's date string
  const todayStr = new Date().toISOString().slice(0, 10);

  // Handle Quick Attendance Toggle for Today
  const handleQuickMarkToday = (employeeId: string, status: AttendanceStatus) => {
    markAttendance({
      employeeId,
      date: todayStr,
      status,
      notes: `Marked by Pharmacy Owner on ${new Date().toLocaleTimeString()}`,
    });
  };

  // Add Employee submit
  const handleAddEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName) return;

    addEmployee({
      name: newEmpName,
      designation: newEmpDesignation,
      phone: newEmpPhone,
      nid: newEmpNid,
      address: newEmpAddress,
      joiningDate: new Date().toISOString().slice(0, 10),
      baseSalary: newEmpSalary,
      photo: newEmpPhoto,
      status: "ACTIVE",
    });

    setIsAddEmpModalOpen(false);
    setNewEmpName("");
    setNewEmpPhone("");
    setNewEmpNid("");
  };

  // Submit Leave Request
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === leaveEmpId);
    if (!emp) return;

    const start = new Date(leaveStartDate);
    const end = new Date(leaveEndDate);
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

    submitLeaveRequest({
      employeeId: emp.id,
      employeeName: emp.name,
      leaveType,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      totalDays,
      reason: leaveReason || "Personal Leave",
    });

    setIsLeaveModalOpen(false);
    setLeaveReason("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#044a40] via-[#065F52] to-[#0a7a6a] p-5 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Staff & Human Resources
            </span>
            <span className="text-xs text-emerald-100 font-mono">Pharmacist & Staff Roster</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Employee & Payroll Management
          </h1>
          <p className="text-xs text-emerald-100/80">
            Staff directory, calendar attendance, automated absence salary deduction, and leave approval pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-emerald-300" />
            <span>Apply Leave</span>
          </button>

          <button
            onClick={() => setIsAddEmpModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Employee</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("EMPLOYEES")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "EMPLOYEES"
              ? "bg-[#065F52] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Directory ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ATTENDANCE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "ATTENDANCE"
              ? "bg-[#065F52] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Attendance Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab("PAYROLL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "PAYROLL"
              ? "bg-[#065F52] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Monthly Salary Sheet</span>
        </button>

        <button
          onClick={() => setActiveTab("LEAVE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "LEAVE"
              ? "bg-[#065F52] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Leave Requests ({leaveRequests.filter((l) => l.status === "PENDING").length} Pending)</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: EMPLOYEE PROFILES DIRECTORY                                  */}
      {/* =================================================================== */}
      {activeTab === "EMPLOYEES" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500 transition-all group"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.photo}
                      alt={emp.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-100 shadow-sm shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        {emp.status}
                      </span>
                      <h3 className="font-black text-sm text-slate-900 mt-1 truncate">{emp.name}</h3>
                      <p className="text-xs text-slate-500 font-semibold truncate">{emp.designation}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Mobile:</span>
                      <strong className="text-slate-800 font-mono">{emp.phone}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">NID:</span>
                      <span className="font-mono text-slate-700">{emp.nid}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Joined:</span>
                      <span>{emp.joiningDate}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                      <span className="font-bold text-slate-700">Base Salary:</span>
                      <strong className="font-mono text-emerald-800 font-black">
                        ৳{emp.baseSalary.toLocaleString()}/mo
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Quick Today Attendance Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Mark Today:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQuickMarkToday(emp.id, "PRESENT")}
                      className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold"
                      title="Present"
                    >
                      P
                    </button>
                    <button
                      onClick={() => handleQuickMarkToday(emp.id, "ABSENT")}
                      className="px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold"
                      title="Absent"
                    >
                      A
                    </button>
                    <button
                      onClick={() => handleQuickMarkToday(emp.id, "LEAVE")}
                      className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold"
                      title="Leave"
                    >
                      L
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: ATTENDANCE TRACKER & MONTHLY CALENDAR VIEW                   */}
      {/* =================================================================== */}
      {activeTab === "ATTENDANCE" && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600">Select Employee:</span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.designation})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600">Month:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Calendar View & Legend */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span>
                    Monthly Attendance Calendar: {activeEmployee.name} ({selectedMonth})
                  </span>
                </h3>
                <span className="text-xs text-slate-500">
                  Click any calendar day to toggle status (Present / Absent / Leave).
                </span>
              </div>

              {/* Status Legend */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Present</span>
                </span>
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Absent</span>
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Leave</span>
                </span>
              </div>
            </div>

            {/* Calendar Grid (Days 1 to 31) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {calendarDays.map((cd) => {
                const isToday = cd.dateStr === todayStr;

                return (
                  <div
                    key={cd.dateStr}
                    onClick={() => {
                      // Cycle status: Present -> Absent -> Leave -> Present
                      const nextStatus: AttendanceStatus =
                        cd.status === "PRESENT"
                          ? "ABSENT"
                          : cd.status === "ABSENT"
                          ? "LEAVE"
                          : "PRESENT";
                      markAttendance({
                        employeeId: selectedEmployeeId,
                        date: cd.dateStr,
                        status: nextStatus,
                      });
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-between min-h-[85px] hover:scale-102 ${
                      cd.status === "PRESENT"
                        ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                        : cd.status === "ABSENT"
                        ? "bg-rose-50/70 border-rose-300 text-rose-950"
                        : cd.status === "LEAVE"
                        ? "bg-amber-50/70 border-amber-300 text-amber-950"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    } ${isToday ? "ring-2 ring-emerald-600" : ""}`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-700">Day {cd.dayNumber}</span>
                      {isToday && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-600 text-white uppercase">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="my-1">
                      {cd.status === "PRESENT" && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900 font-bold text-[10px]">
                          ✓ Present
                        </span>
                      )}
                      {cd.status === "ABSENT" && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-200/80 text-rose-900 font-bold text-[10px]">
                          ✕ Absent
                        </span>
                      )}
                      {cd.status === "LEAVE" && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-bold text-[10px]">
                          🏖 Leave
                        </span>
                      )}
                      {!cd.status && <span className="text-[10px] text-slate-300">Unrecorded</span>}
                    </div>

                    <span className="text-[9px] text-slate-400 font-mono truncate">{cd.dateStr}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: MONTHLY SALARY SHEET WITH AUTO ABSENCE DEDUCTION            */}
      {/* =================================================================== */}
      {activeTab === "PAYROLL" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span>Monthly Payroll & Automated Salary Sheet ({selectedMonth})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Absence deduction formula: <code>(Base Salary / 30) × Absent Days</code> automatically calculated from attendance roster.
                </p>
              </div>

              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="pb-3">Employee</th>
                    <th className="pb-3">Base Salary</th>
                    <th className="pb-3 text-center">Absent Days</th>
                    <th className="pb-3 text-right">Absence Deduction</th>
                    <th className="pb-3 text-right">Bonus (৳)</th>
                    <th className="pb-3 text-right">Advance Taken</th>
                    <th className="pb-3 text-right">Net Payable Salary</th>
                    <th className="pb-3 text-center">Payment Status</th>
                    <th className="pb-3 text-right">Disburse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {monthlyAttendanceSummary.map((sum) => (
                    <tr key={sum.employee.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5">
                        <span className="font-bold text-slate-900 block">{sum.employee.name}</span>
                        <span className="text-[10px] text-slate-400">{sum.employee.designation}</span>
                      </td>

                      <td className="py-3.5 font-mono font-bold text-slate-900">
                        ৳{sum.employee.baseSalary.toLocaleString()}
                      </td>

                      <td className="py-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            sum.absentCount > 0
                              ? "bg-rose-100 text-rose-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {sum.absentCount} Days Absent
                        </span>
                      </td>

                      <td className="py-3.5 text-right font-mono font-bold text-rose-600">
                        -৳{sum.absenceDeduction.toFixed(2)}
                      </td>

                      <td className="py-3.5 text-right">
                        <input
                          type="number"
                          placeholder="0"
                          value={payrollBonusMap[sum.employee.id] || ""}
                          onChange={(e) =>
                            setPayrollBonusMap({
                              ...payrollBonusMap,
                              [sum.employee.id]: Number(e.target.value),
                            })
                          }
                          className="w-20 px-2 py-1 rounded-lg border border-slate-200 text-right font-mono text-xs font-bold text-emerald-700"
                        />
                      </td>

                      <td className="py-3.5 text-right">
                        <input
                          type="number"
                          placeholder="0"
                          value={payrollAdvanceMap[sum.employee.id] || ""}
                          onChange={(e) =>
                            setPayrollAdvanceMap({
                              ...payrollAdvanceMap,
                              [sum.employee.id]: Number(e.target.value),
                            })
                          }
                          className="w-20 px-2 py-1 rounded-lg border border-slate-200 text-right font-mono text-xs font-bold text-slate-700"
                        />
                      </td>

                      <td className="py-3.5 text-right font-mono font-black text-sm text-slate-900">
                        ৳{sum.netSalary.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            sum.isPaid
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {sum.isPaid ? "PAID" : "PENDING"}
                        </span>
                      </td>

                      <td className="py-3.5 text-right">
                        <button
                          disabled={sum.isPaid}
                          onClick={() => {
                            recordSalaryPayment({
                              employeeId: sum.employee.id,
                              employeeName: sum.employee.name,
                              month: selectedMonth,
                              baseSalary: sum.employee.baseSalary,
                              bonus: sum.bonus,
                              advanceDeduction: sum.advance,
                              absenceDeduction: sum.absenceDeduction,
                              absentDays: sum.absentCount,
                              otherDeduction: 0,
                              netSalary: sum.netSalary,
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm transition-all ml-auto ${
                            sum.isPaid
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          {sum.isPaid ? "Disbursed" : "Pay Salary"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: LEAVE REQUESTS & OWNER APPROVAL PIPELINE                    */}
      {/* =================================================================== */}
      {activeTab === "LEAVE" && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>Employee Leave Requests & Owner Approval</span>
              </h3>
              <p className="text-xs text-slate-500">
                Review employee vacation and sick leave requests. Approving auto-updates attendance records.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Leave Type</th>
                  <th className="pb-3">Start Date</th>
                  <th className="pb-3">End Date</th>
                  <th className="pb-3 text-center">Duration</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Owner Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {leaveRequests.map((lr) => (
                  <tr key={lr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-bold text-slate-900">{lr.employeeName}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {lr.leaveType}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-700">{lr.startDate}</td>
                    <td className="py-3 font-mono text-slate-700">{lr.endDate}</td>
                    <td className="py-3 text-center font-bold text-slate-900">{lr.totalDays} Day(s)</td>
                    <td className="py-3 text-slate-600 max-w-xs">{lr.reason}</td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          lr.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : lr.status === "REJECTED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {lr.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {lr.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => updateLeaveRequestStatus(lr.id, "APPROVED", "Approved by owner")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => updateLeaveRequestStatus(lr.id, "REJECTED", "Rejected by owner")}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm"
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-[#044a40] to-[#065F52] text-white flex items-center justify-between">
              <h3 className="font-black text-base">Add Employee Profile</h3>
              <button onClick={() => setIsAddEmpModalOpen(false)}>
                <X className="w-5 h-5 text-white/80" />
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariqul Anam"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Pharmacist"
                  value={newEmpDesignation}
                  onChange={(e) => setNewEmpDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="01711..."
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">National ID (NID)</label>
                  <input
                    type="text"
                    placeholder="NID Number"
                    value={newEmpNid}
                    onChange={(e) => setNewEmpNid(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Monthly Base Salary (৳)</label>
                <input
                  type="number"
                  value={newEmpSalary}
                  onChange={(e) => setNewEmpSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Address in Dhaka"
                  value={newEmpAddress}
                  onChange={(e) => setNewEmpAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEmpModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Application Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-[#044a40] to-[#065F52] text-white flex items-center justify-between">
              <h3 className="font-black text-base">Submit Leave Request</h3>
              <button onClick={() => setIsLeaveModalOpen(false)}>
                <X className="w-5 h-5 text-white/80" />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Employee</label>
                <select
                  value={leaveEmpId}
                  onChange={(e) => setLeaveEmpId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:outline-none"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:outline-none"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="ANNUAL">Annual Vacation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Explanation</label>
                <textarea
                  rows={2}
                  placeholder="Reason for leave application..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
