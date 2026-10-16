import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Contract, BatchSchedule } from '../../types';
import {
  FileText, Plus, Search, ShieldCheck, CheckCircle2, Clock, AlertCircle,
  FileCheck, Calendar, ArrowRight, Eye, RefreshCw, X
} from 'lucide-react';

export const ContractsView: React.FC = () => {
  const {
    contracts,
    batchSchedules,
    rooms,
    tenants,
    addBatchSchedule,
    createContractDraftHDT02,
    confirmContractSignedHDT04,
    createRenewalContractHDT06,
    activateRenewalContractHDT07
  } = useApp();

  const [activeTab, setActiveTab] = useState<'contracts' | 'schedules' | 'renewals'>('contracts');

  // Modals
  const [showAddContract, setShowAddContract] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // New Contract Form (HDT-02)
  const [roomCode, setRoomCode] = useState(rooms[2]?.roomCode || 'P.103');
  const [tenantId, setTenantId] = useState(tenants[0]?.id || '');
  const [batchCode, setBatchCode] = useState(batchSchedules[0]?.batchCode || 'DOT-2026-K10');
  const [monthlyRent, setMonthlyRent] = useState(3500000);
  const [terms, setTerms] = useState('Hợp đồng thuê căn hộ mini theo đợt chung, thanh toán chuyển khoản định kỳ.');

  // Sign Form (HDT-04)
  const [signDate, setSignDate] = useState('2026-10-16');
  const [signProof, setSignProof] = useState('hop_dong_ky_tay_2_ben.pdf');

  // Renewal Form (HDT-06)
  const [renewalRent, setRenewalRent] = useState(3800000);
  const [renewalBatch, setRenewalBatch] = useState('DOT-2026-K11');

  // New Batch Schedule
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [newBatchCode, setNewBatchCode] = useState('');
  const [newBatchStart, setNewBatchStart] = useState('2026-11-01');
  const [newBatchEnd, setNewBatchEnd] = useState('2027-05-01');
  const [newBatchNote, setNewBatchNote] = useState('Thu định kỳ ngày 25-30 hàng tháng');

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find(t => t.id === tenantId);
    const batch = batchSchedules.find(b => b.batchCode === batchCode);
    if (!tenant || !batch) return;

    const leaseId = 'THUE-' + roomCode.replace(/\D/g, '') + '-L' + Math.floor(Math.random() * 9 + 1);

    const res = createContractDraftHDT02({
      contractType: 'Hợp đồng lần đầu',
      leaseId,
      roomCode,
      tenantId: tenant.id,
      tenantName: tenant.fullName,
      batchCode: batch.batchCode,
      startDate: batch.startDate,
      endDate: batch.endDate,
      monthlyRent,
      depositAmount: monthlyRent, // 1 tháng cọc (BR-HDT02-02)
      firstMonthRentAmount: monthlyRent, // 1 tháng tiền thuê đầu
      firstMonthRentPaid: false,
      paymentMethod: 'Chuyển khoản',
      terms
    });

    if (res.success) {
      setShowAddContract(false);
      alert(res.message);
    }
  };

  const handleSignContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    const res = confirmContractSignedHDT04(selectedContract.id, signDate, [signProof]);
    if (res.success) {
      setShowSignModal(false);
      alert(res.message + ' Bạn có thể chuyển sang mục Quản lý phòng để ghi nhận thanh toán cọc và tiền thuê đầu.');
    }
  };

  const handleCreateRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    const batch = batchSchedules.find(b => b.batchCode === renewalBatch);
    if (!batch) return;

    const res = createRenewalContractHDT06({
      previousContractId: selectedContract.id,
      roomCode: selectedContract.roomCode,
      tenantId: selectedContract.tenantId,
      tenantName: selectedContract.tenantName,
      batchCode: batch.batchCode,
      startDate: batch.startDate,
      endDate: batch.endDate,
      monthlyRent: renewalRent,
      terms: 'Hợp đồng gia hạn tiếp tục thuê, kế thừa khoản cọc gốc ban đầu.'
    });

    if (res.success) {
      setShowRenewalModal(false);
      alert(res.message);
    }
  };

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchCode.trim()) return;

    addBatchSchedule({
      batchCode: newBatchCode.trim(),
      startDate: newBatchStart,
      endDate: newBatchEnd,
      billingCycleNote: newBatchNote,
      isConfirmed: true
    });

    setShowAddBatch(false);
    setNewBatchCode('');
    alert('Thêm lịch đợt hợp đồng chung thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Quản lý Hợp đồng Thuê</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lập hợp đồng lần đầu, theo dõi thời hạn thuê, lịch đợt hợp đồng chung và hợp đồng nối tiếp kế thừa tiền cọc.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs shrink-0">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'contracts' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Danh sách hợp đồng
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'schedules' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Lịch đợt hợp đồng chung
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: CONTRACTS LIST ==================== */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <span className="text-xs text-slate-600">
              Chính sách cọc: Hợp đồng lần đầu thu cọc = 1 tháng thuê. Mọi hợp đồng nối tiếp kế thừa cọc gốc (không thu lại).
            </span>

            <button
              onClick={() => setShowAddContract(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Lập hợp đồng thuê mới
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Mã hợp đồng</th>
                    <th className="py-2.5 px-3">Loại hợp đồng</th>
                    <th className="py-2.5 px-3">Phòng</th>
                    <th className="py-2.5 px-3">Khách thuê</th>
                    <th className="py-2.5 px-3">Thời hạn</th>
                    <th className="py-2.5 px-3">Giá thuê / tháng</th>
                    <th className="py-2.5 px-3">Tiền cọc</th>
                    <th className="py-2.5 px-3">Ký giấy</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contracts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{c.id}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[11px] font-medium ${c.contractType === 'Hợp đồng nối tiếp' ? 'text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-semibold' : 'text-slate-600'}`}>
                          {c.contractType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{c.roomCode}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{c.tenantName}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        {c.startDate} → {c.endDate}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold">
                        {c.monthlyRent.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700">
                        {c.depositAmount.toLocaleString('vi-VN')} đ
                        {c.previousContractId && <span className="block text-[10px] text-slate-400 font-sans">(cọc gốc)</span>}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[11px] font-semibold ${c.isSignedPaper ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {c.isSignedPaper ? 'Đã ký giấy' : 'Chưa ký'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${c.status === 'Hiệu lực' ? 'bg-emerald-100 text-emerald-800' : c.status === 'Chờ hiệu lực' ? 'bg-blue-100 text-blue-800' : c.status === 'Nháp' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                        {c.status === 'Nháp' && (
                          <button
                            onClick={() => {
                              setSelectedContract(c);
                              setShowSignModal(true);
                            }}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold cursor-pointer"
                          >
                            Ghi nhận đã ký
                          </button>
                        )}
                        {c.status === 'Hiệu lực' && !contracts.some(sub => sub.previousContractId === c.id) && (
                          <button
                            onClick={() => {
                              setSelectedContract(c);
                              setRenewalRent(c.monthlyRent);
                              setShowRenewalModal(true);
                            }}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-semibold cursor-pointer"
                          >
                            Gia hạn hợp đồng
                          </button>
                        )}
                        {c.contractType === 'Hợp đồng nối tiếp' && c.status === 'Nháp' && (
                          <button
                            onClick={() => {
                              activateRenewalContractHDT07(c.id, new Date().toISOString().split('T')[0], ['hop_dong_gia_han_ky_tay.pdf']);
                              alert('Đã kích hoạt hợp đồng nối tiếp thành công! Hợp đồng cũ kết thúc, kế hoạch trả cũ tự hủy.');
                            }}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold cursor-pointer"
                          >
                            Kích hoạt nối tiếp
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: BATCH SCHEDULES ==================== */}
      {activeTab === 'schedules' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Lịch đợt hợp đồng chung</h2>
              <p className="text-xs text-slate-500">
                Lịch chung áp dụng cho toàn bộ các phòng tham gia cùng đợt thuê. Các hợp đồng tham chiếu theo đợt đã xác nhận.
              </p>
            </div>
            <button
              onClick={() => setShowAddBatch(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm lịch đợt mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batchSchedules.map((b) => (
              <div key={b.batchCode} className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-sm text-blue-700">{b.batchCode}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    Đã xác nhận
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ngày bắt đầu đợt:</span>
                    <span className="font-mono font-semibold">{b.startDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ngày kết thúc đợt:</span>
                    <span className="font-mono font-semibold">{b.endDate}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  Chu kỳ thu tiền: {b.billingCycleNote}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD CONTRACT HDT-02 ==================== */}
      {showAddContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Lập hợp đồng thuê mới</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phòng thuê <span className="text-red-500">*</span></label>
                <select
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.roomCode}>{r.roomCode} ({r.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Khách thuê <span className="text-red-500">*</span></label>
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đợt hợp đồng chung <span className="text-red-500">*</span></label>
              <select
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              >
                {batchSchedules.map(b => (
                  <option key={b.batchCode} value={b.batchCode}>{b.batchCode} ({b.startDate} → {b.endDate})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Giá thuê hàng tháng (đ) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiền cọc (Cố định = 1 tháng thuê)</label>
                <input
                  type="number"
                  value={monthlyRent}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg font-mono text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phương thức thanh toán</label>
              <input
                type="text"
                value="Chuyển khoản (Không thu tiền mặt)"
                readOnly
                className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg text-slate-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddContract(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateContract}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Lưu hợp đồng dự thảo (Nháp)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: SIGN CONTRACT HDT-04 ==================== */}
      {showSignModal && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Ghi nhận hợp đồng đã ký</h3>
            <p className="text-slate-500">
              Ghi nhận bản giấy đã được hai bên ký tay và khóa nội dung hợp đồng.
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span>Mã hợp đồng:</span> <strong className="font-mono">{selectedContract.id}</strong>
              </div>
              <div className="flex justify-between">
                <span>Phòng & Khách:</span> <strong>{selectedContract.roomCode} - {selectedContract.tenantName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Thời hạn thuê:</span> <span className="font-mono">{selectedContract.startDate} → {selectedContract.endDate}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày ký hợp đồng giấy <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={signDate}
                onChange={(e) => setSignDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tệp chứng cứ chữ ký 2 bên (PDF / Scan) <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={signProof}
                onChange={(e) => setSignProof(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSignContract}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Xác nhận đã ký
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: RENEWAL CONTRACT ==================== */}
      {showRenewalModal && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Lập hợp đồng nối tiếp</h3>
            <p className="text-slate-500">
              Khách tiếp tục thuê cùng phòng. Hợp đồng nối tiếp kế thừa khoản cọc gốc ban đầu, không thu cọc mới.
            </p>

            <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg space-y-1">
              <div className="flex justify-between">
                <span>Hợp đồng trước:</span> <strong className="font-mono">{selectedContract.id}</strong>
              </div>
              <div className="flex justify-between">
                <span>Cọc gốc kế thừa:</span> <strong className="font-mono text-emerald-700">{selectedContract.depositAmount.toLocaleString('vi-VN')} đ</strong>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đợt hợp đồng mới</label>
              <select
                value={renewalBatch}
                onChange={(e) => setRenewalBatch(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              >
                {batchSchedules.map(b => (
                  <option key={b.batchCode} value={b.batchCode}>{b.batchCode} ({b.startDate} → {b.endDate})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Giá thuê kỳ mới (đ)</label>
              <input
                type="number"
                value={renewalRent}
                onChange={(e) => setRenewalRent(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRenewalModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateRenewal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Lập hợp đồng nối tiếp (Nháp)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD BATCH SCHEDULE ==================== */}
      {showAddBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Thêm Lịch đợt hợp đồng chung</h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mã đợt (duy nhất) <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={newBatchCode}
                onChange={(e) => setNewBatchCode(e.target.value)}
                placeholder="Ví dụ: DOT-2026-K12"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ngày bắt đầu đợt <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={newBatchStart}
                  onChange={(e) => setNewBatchStart(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ngày kết thúc đợt <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={newBatchEnd}
                  onChange={(e) => setNewBatchEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddBatch(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddBatch}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Xác nhận lịch đợt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
