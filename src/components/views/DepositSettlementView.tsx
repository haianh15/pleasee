import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DepositSettlementSlip, DeductionItem } from '../../types';
import {
  Scale, Plus, CheckCircle2, AlertCircle, Clock, FileCheck, ArrowRight,
  Landmark, AlertTriangle, MessageSquare, History, X
} from 'lucide-react';

export const DepositSettlementView: React.FC = () => {
  const {
    settlementSlips,
    rooms,
    updateSettlementFeedbackQTC02,
    confirmSettlementTransferReceiptQTC03,
    saveSettlementSlipQTC01
  } = useApp();

  const [selectedSlip, setSelectedSlip] = useState<DepositSettlementSlip | null>(settlementSlips[0] || null);

  // Modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackOption, setFeedbackOption] = useState<'Đồng ý' | 'Không đồng ý' | 'Chưa phản hồi' | 'Không liên hệ được'>('Đồng ý');
  const [feedbackNote, setFeedbackNote] = useState('');

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBank, setReceiptBank] = useState('Vietcombank');
  const [receiptAccNum, setReceiptAccNum] = useState('1012345678');
  const [receiptAccHolder, setReceiptAccHolder] = useState('LE VAN DAT');
  const [receiptTxn, setReceiptTxn] = useState('FT261016' + Math.floor(Math.random() * 89999 + 10000));
  const [receiptDate, setReceiptDate] = useState('2026-10-16');

  // New slip modal (QTC-01)
  const [showCreateSlipModal, setShowCreateSlipModal] = useState(false);
  const [slipRoom, setSlipRoom] = useState('P.202');
  const [slipDeposit, setSlipDeposit] = useState(3800000);
  const [deductBill, setDeductBill] = useState(450000);
  const [deductAsset, setDeductAsset] = useState(0);

  const handleCreateSlip = (e: React.FormEvent) => {
    e.preventDefault();
    const deductions: DeductionItem[] = [
      {
        id: 'ded_' + Date.now() + '_1',
        category: 'Điện nước dịch vụ kỳ cuối',
        description: 'Điện nước & phí dịch vụ kỳ cuối đến ngày nhận lại phòng thực tế',
        amount: deductBill
      }
    ];
    if (deductAsset > 0) {
      deductions.push({
        id: 'ded_' + Date.now() + '_2',
        category: 'Thiệt hại tài sản',
        description: 'Bồi thường hư hỏng theo kết quả đối chiếu tài sản BG07',
        amount: deductAsset
      });
    }

    const totalDed = deductions.reduce((s, d) => s + d.amount, 0);
    const calculated = slipDeposit - totalDed;

    const newSlip: DepositSettlementSlip = {
      id: 'QTC-' + slipRoom.replace(/\D/g, '') + '-' + Date.now().toString().slice(-4),
      roomCode: slipRoom,
      leaseId: 'THUE-' + slipRoom.replace(/\D/g, '') + '-L1',
      initialDepositAmount: slipDeposit,
      initialDepositCode: 'COC-' + slipRoom.replace(/\D/g, '') + '-L1',
      handoverReturnDate: '2026-10-15',
      deductions,
      calculatedResult: calculated,
      status: 'Đang lập',
      reviewRequired: false,
      contactLogs: [],
      step58Published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveSettlementSlipQTC01(newSlip);
    setSelectedSlip(newSlip);
    setShowCreateSlipModal(false);
    alert('Lập phiếu quyết toán cọc thành công (UC-QTC-01)!');
  };

  const handleUpdateFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlip) return;

    updateSettlementFeedbackQTC02(selectedSlip.id, feedbackOption, feedbackNote);
    setSelectedSlip(prev => prev ? {
      ...prev,
      tenantFeedback: feedbackOption,
      status: feedbackOption === 'Đồng ý' ? 'Khách đồng ý' : feedbackOption === 'Không đồng ý' ? 'Không đồng ý' : 'Không liên hệ được'
    } : null);

    setShowFeedbackModal(false);
    alert(`Đã cập nhật phản hồi khách: ${feedbackOption} (UC-QTC-02)`);
  };

  const handleConfirmTransferReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlip) return;

    const isRefund = selectedSlip.calculatedResult > 0;
    const res = confirmSettlementTransferReceiptQTC03(selectedSlip.id, {
      receiptType: isRefund ? 'Hoàn cọc' : 'Thu thêm',
      amount: Math.abs(selectedSlip.calculatedResult),
      bankName: receiptBank,
      accountNumber: receiptAccNum,
      accountHolder: receiptAccHolder,
      transferDate: receiptDate,
      transactionCode: receiptTxn,
      verifiedBy: 'Nguyễn Văn An'
    });

    if (res.success) {
      setShowReceiptModal(false);
      setSelectedSlip(prev => prev ? {
        ...prev,
        status: 'Đã có 5.8 – chờ ký biên bản',
        step58Published: true
      } : null);
      alert(res.message);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Quy trình 05</span>
            <h1 className="text-lg font-bold text-slate-900">Quản lý Quyết toán Cọc (UC-QTC-01 → UC-QTC-03)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lập phiếu quyết toán cọc khi nhận lại phòng (3.05), ghi nhận phản hồi, điều chỉnh và hoàn tất bằng 1 chứng từ chuyển khoản duy nhất (5.8).
          </p>
        </div>

        <button
          onClick={() => setShowCreateSlipModal(true)}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Lập phiếu quyết toán cọc (QTC-01)
        </button>
      </div>

      {/* Main Grid: List on Left, Detail & Actions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Slips List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Danh sách phiếu quyết toán
            </span>
            <span className="text-xs font-mono text-slate-400">({settlementSlips.length})</span>
          </div>

          <div className="space-y-2">
            {settlementSlips.map((slip) => (
              <div
                key={slip.id}
                onClick={() => setSelectedSlip(slip)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 ${selectedSlip?.id === slip.id ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-900">{slip.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${slip.status === 'Đã có 5.8 – chờ ký biên bản' ? 'bg-indigo-100 text-indigo-800' : slip.status === 'Khách đồng ý' ? 'bg-emerald-100 text-emerald-800' : slip.status === 'Tranh chấp' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                    {slip.status}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Phòng: <strong>{slip.roomCode}</strong></span>
                  <span className="font-mono">{slip.handoverReturnDate}</span>
                </div>

                <div className="flex justify-between font-mono pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Kết quả:</span>
                  <strong className={slip.calculatedResult >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                    {slip.calculatedResult > 0 ? `Hoàn: +${slip.calculatedResult.toLocaleString('vi-VN')} đ` : slip.calculatedResult < 0 ? `Thu thêm: ${slip.calculatedResult.toLocaleString('vi-VN')} đ` : 'Đối trừ hết (0 đ)'}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Slip Detail & Operations */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          {selectedSlip ? (
            <div className="space-y-5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base text-slate-900">{selectedSlip.id}</h2>
                    <span className="font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                      Phòng {selectedSlip.roomCode}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Mã cọc gốc: <strong>{selectedSlip.initialDepositCode}</strong> (kế thừa từ hợp đồng đầu tiên)
                  </span>
                </div>

                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${selectedSlip.status === 'Đã có 5.8 – chờ ký biên bản' ? 'bg-indigo-100 text-indigo-800' : selectedSlip.status === 'Khách đồng ý' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {selectedSlip.status}
                </span>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider block text-xs">
                  1. Bảng tính kết quả quyết toán (UC-QTC-01)
                </span>

                <div className="space-y-1.5 divide-y divide-slate-200">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 font-medium">Khoản tiền cọc gốc ban đầu:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedSlip.initialDepositAmount.toLocaleString('vi-VN')} đ</span>
                  </div>

                  {selectedSlip.deductions.map(d => (
                    <div key={d.id} className="flex justify-between py-1 text-slate-600">
                      <span>Khấu trừ: {d.description} ({d.category}):</span>
                      <span className="font-mono text-red-600">-{d.amount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  ))}

                  <div className="flex justify-between py-2 font-bold text-sm">
                    <span className="text-slate-900">
                      Kết quả quyết toán cọc ({selectedSlip.calculatedResult > 0 ? 'Hoàn cọc cho khách' : selectedSlip.calculatedResult < 0 ? 'Khách phải nộp thêm' : 'Đối trừ vừa hết'}):
                    </span>
                    <span className={`font-mono ${selectedSlip.calculatedResult >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {Math.abs(selectedSlip.calculatedResult).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 5.8 Status */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    Trạng thái phát hành kết quả 5.8 (ASIS-05 → BG10)
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${selectedSlip.step58Published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {selectedSlip.step58Published ? 'Đã phát hành kết quả 5.8' : 'Chưa phát hành (Chờ QTC-03)'}
                  </span>
                </div>

                {selectedSlip.transferReceipt && (
                  <div className="p-3 bg-white rounded-lg border border-blue-200 text-slate-700 space-y-1">
                    <div className="font-semibold text-slate-900">Chứng từ chuyển khoản duy nhất (BR-QTC03-08):</div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>Loại: <strong>{selectedSlip.transferReceipt.receiptType}</strong></div>
                      <div>Số tiền: <strong className="font-mono text-blue-700">{selectedSlip.transferReceipt.amount.toLocaleString('vi-VN')} đ</strong></div>
                      <div>Tài khoản nhận: <strong className="font-mono">{selectedSlip.transferReceipt.bankName} - {selectedSlip.transferReceipt.accountNumber}</strong></div>
                      <div>Mã giao dịch: <strong className="font-mono">{selectedSlip.transferReceipt.transactionCode}</strong></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200">
                {selectedSlip.status !== 'Đã có 5.8 – chờ ký biên bản' && selectedSlip.status !== 'Hoàn tất' && (
                  <button
                    onClick={() => {
                      setFeedbackOption(selectedSlip.tenantFeedback || 'Đồng ý');
                      setShowFeedbackModal(true);
                    }}
                    className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Ghi nhận phản hồi / Điều chỉnh (UC-QTC-02)
                  </button>
                )}

                {selectedSlip.status === 'Khách đồng ý' && !selectedSlip.step58Published && (
                  <button
                    onClick={() => setShowReceiptModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Ghi nhận kết quả & Chứng từ (UC-QTC-03)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-12 text-center">Chọn một phiếu quyết toán ở cột bên trái để xem chi tiết.</p>
          )}
        </div>
      </div>

      {/* ==================== MODAL: CREATE SLIP QTC-01 ==================== */}
      {showCreateSlipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Lập quyết toán cọc (UC-QTC-01)</h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phòng đã nhận lại thực tế</label>
              <select
                value={slipRoom}
                onChange={(e) => setSlipRoom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.roomCode}>{r.roomCode} ({r.status})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cọc gốc chuỗi thuê (đ)</label>
              <input
                type="number"
                value={slipDeposit}
                onChange={(e) => setSlipDeposit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nợ tiền điện nước kỳ cuối</label>
                <input
                  type="number"
                  value={deductBill}
                  onChange={(e) => setDeductBill(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Khấu trừ tài sản (BG07)</label>
                <input
                  type="number"
                  value={deductAsset}
                  onChange={(e) => setDeductAsset(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateSlipModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateSlip}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Lưu phiếu quyết toán (Đang lập)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: FEEDBACK QTC-02 ==================== */}
      {showFeedbackModal && selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Ghi nhận phản hồi quyết toán cọc (UC-QTC-02)</h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phản hồi của khách thuê</label>
              <select
                value={feedbackOption}
                onChange={(e) => setFeedbackOption(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              >
                <option value="Đồng ý">Đồng ý (Khách thống nhất phương án)</option>
                <option value="Không đồng ý">Không đồng ý (Có thắc mắc/bất đồng)</option>
                <option value="Chưa phản hồi">Chưa phản hồi (Đã gửi nhưng chưa có câu trả lời)</option>
                <option value="Không liên hệ được">Không liên hệ được (Sau ít nhất 2 lượt và 48h)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nội dung trao đổi / Lý do</label>
              <textarea
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                rows={2}
                placeholder="Ghi nhận chi tiết ý kiến của khách..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleUpdateFeedback}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Lưu phản hồi (QTC-02)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: RECEIPT QTC-03 ==================== */}
      {showReceiptModal && selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">
              Ghi nhận chứng từ & hoàn tất quyết toán (UC-QTC-03)
            </h3>
            <p className="text-slate-500">
              Chỉ chấp nhận MỘT chứng từ chuyển khoản duy nhất bằng đúng số tiền {selectedSlip.calculatedResult > 0 ? 'hoàn cọc' : 'thu thêm'} ({Math.abs(selectedSlip.calculatedResult).toLocaleString('vi-VN')} đ). Không chia nhiều lần.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ngân hàng nhận</label>
                <input
                  type="text"
                  value={receiptBank}
                  onChange={(e) => setReceiptBank(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số tài khoản nhận</label>
                <input
                  type="text"
                  value={receiptAccNum}
                  onChange={(e) => setReceiptAccNum(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chủ tài khoản nhận</label>
                <input
                  type="text"
                  value={receiptAccHolder}
                  onChange={(e) => setReceiptAccHolder(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã giao dịch ngân hàng</label>
                <input
                  type="text"
                  value={receiptTxn}
                  onChange={(e) => setReceiptTxn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmTransferReceipt}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Xác nhận hoàn tất (Phát hành 5.8)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
