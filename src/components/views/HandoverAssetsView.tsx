import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryRecord, HandoverReport, AssetIncident, ReturnInspection, AssetComparisonResult, HandoverReturnReport } from '../../types';
import {
  PackageCheck, FileSignature, AlertOctagon, Scale, FileText, CheckCircle2,
  AlertCircle, Plus, Eye, Check, X, ShieldAlert, ArrowRight, Printer
} from 'lucide-react';

export const HandoverAssetsView: React.FC = () => {
  const {
    rooms,
    standardAssets,
    inventoryRecords,
    handoverReports,
    incidents,
    returnInspections,
    assetComparisonResults,
    handoverReturnReports,
    saveInventoryBG01,
    saveHandoverReportBG03,
    confirmHandoverSignaturesBG03,
    recordIncidentBG04,
    recordReturnInspectionBG09,
    confirmReturnInspectionStep305,
    saveAssetComparisonResultBG07,
    saveHandoverReturnReportBG11,
    confirmFinalReturnReportBG11,
    settlementSlips
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inventory_bg01' | 'handover_bg03' | 'incidents_bg04' | 'return_bg09' | 'final_bg11'>('inventory_bg01');

  // Selected room for active operations
  const [selectedRoomCode, setSelectedRoomCode] = useState('P.103');

  // New incident state (BG04)
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incDesc, setIncDesc] = useState('');
  const [incAsset, setIncAsset] = useState('Điều hòa Daikin 9000 BTU Inverter');
  const [incCause, setIncCause] = useState('');
  const [incCost, setIncCost] = useState(0);

  // Return inspection state (BG09)
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [retRoom, setRetRoom] = useState('P.102');
  const [retElec, setRetElec] = useState(1380);
  const [retWater, setRetWater] = useState(52);
  const [retEvidence, setRetEvidence] = useState('Đã thu hồi 2 chìa khóa và thẻ từ, công tơ đối chiếu đúng');

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Bàn giao, Kiểm kê & Đối chiếu Tài sản</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý kiểm kê tài sản phòng, biên bản nhận phòng, theo dõi sự cố và quy trình bàn giao trả phòng thực tế.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveTab('inventory_bg01')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'inventory_bg01' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Kiểm kê tài sản
          </button>
          <button
            onClick={() => setActiveTab('handover_bg03')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'handover_bg03' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Biên bản nhận phòng
          </button>
          <button
            onClick={() => setActiveTab('incidents_bg04')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'incidents_bg04' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Sự cố & Hư hỏng
          </button>
          <button
            onClick={() => setActiveTab('return_bg09')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'return_bg09' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Nhận lại phòng
          </button>
          <button
            onClick={() => setActiveTab('final_bg11')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'final_bg11' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Biên bản trả phòng
          </button>
        </div>
      </div>

      {/* Kiểm kê tài sản phòng */}
      {activeTab === 'inventory_bg01' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Kiểm kê tài sản phòng</h2>
              <p className="text-xs text-slate-500">
                Quản lý trạng thái kiểm kê đồ dùng trang thiết bị và liên kết với hợp đồng thuê phòng tương ứng.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Chọn phòng:</span>
              <select
                value={selectedRoomCode}
                onChange={(e) => setSelectedRoomCode(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.roomCode}>{r.roomCode} ({r.status})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Current room inventory */}
          {(() => {
            const currentRecord = inventoryRecords.find(i => i.roomCode === selectedRoomCode);
            return (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Trạng thái kiểm kê:</span>
                      <strong className={`font-semibold ${currentRecord?.inventoryStatus === 'Đã hoàn tất' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {currentRecord?.inventoryStatus || 'Chưa kiểm kê'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Trạng thái liên kết hợp đồng:</span>
                      <strong className={`font-semibold ${currentRecord?.linkStatus === 'Đã liên kết' ? 'text-blue-700' : 'text-slate-600'}`}>
                        {currentRecord?.linkStatus || 'Chưa liên kết'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Hợp đồng liên kết:</span>
                      <span className="font-mono">{currentRecord?.linkedContractId || '—'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const newRec: InventoryRecord = {
                        id: 'inv_' + selectedRoomCode.replace(/\D/g, '') + '_' + Date.now().toString().slice(-4),
                        roomCode: selectedRoomCode,
                        expectedBatchCode: 'DOT-2026-K10',
                        version: 1,
                        inventoryStatus: 'Đã hoàn tất',
                        linkStatus: 'Đã liên kết',
                        linkedContractId: 'HD-' + selectedRoomCode.replace(/\D/g, '') + '-2026',
                        linkedLeaseId: 'THUE-' + selectedRoomCode.replace(/\D/g, '') + '-L1',
                        items: standardAssets.map((ast, idx) => ({
                          id: `inv_${selectedRoomCode}_${idx}`,
                          assetId: ast.id,
                          name: ast.name,
                          unit: ast.unit,
                          standardQuantity: ast.standardQuantity,
                          actualQuantity: ast.standardQuantity,
                          quantityDiff: 'Đủ',
                          physicalCondition: 'Bình thường'
                        })),
                        completedAt: new Date().toISOString(),
                        completedBy: 'Nguyễn Văn An'
                      };
                      saveInventoryBG01(newRec);
                      alert('Đã lưu kết quả kiểm kê Đã hoàn tất và Đã liên kết hợp đồng!');
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    Lưu kết quả kiểm kê hoàn tất
                  </button>
                </div>

                {/* Assets Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase">
                        <th className="py-2.5 px-3">Tên tài sản</th>
                        <th className="py-2.5 px-3">Đơn vị</th>
                        <th className="py-2.5 px-3">SL Tiêu chuẩn</th>
                        <th className="py-2.5 px-3">SL Thực tế</th>
                        <th className="py-2.5 px-3">Đối chiếu</th>
                        <th className="py-2.5 px-3">Tình trạng vật lý</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(currentRecord?.items || standardAssets.map((ast, idx) => ({
                        id: `ast_${idx}`,
                        assetId: ast.id,
                        name: ast.name,
                        unit: ast.unit,
                        standardQuantity: ast.standardQuantity,
                        actualQuantity: ast.standardQuantity,
                        quantityDiff: 'Đủ' as const,
                        physicalCondition: 'Bình thường' as const
                      }))).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-medium text-slate-800">{item.name}</td>
                          <td className="py-2.5 px-3 text-slate-500">{item.unit}</td>
                          <td className="py-2.5 px-3 font-mono">{item.standardQuantity}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{item.actualQuantity}</td>
                          <td className="py-2.5 px-3">
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {item.quantityDiff}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-[11px] text-slate-700">
                              {item.physicalCondition}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Biên bản nhận phòng */}
      {activeTab === 'handover_bg03' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Biên bản bàn giao nhận phòng</h2>
              <p className="text-xs text-slate-500">
                Toàn bộ biên bản nhận phòng có 3 trạng thái: Nháp / Đã lập / Đã xác nhận (hai bên đã ký giấy ngoài hệ thống).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {handoverReports.map((report) => (
              <div key={report.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{report.reportNumber}</span>
                    <span className="font-mono px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">
                      Phòng: {report.roomCode}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${report.status === 'Đã xác nhận' ? 'bg-emerald-100 text-emerald-800' : report.status === 'Đã lập' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                      Trạng thái: {report.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Tình trạng ký giấy:</span>
                    <span className="font-medium">Khách: <strong>{report.tenantSignedPaper}</strong></span>
                    <span className="font-medium">· Chủ nhà: <strong>{report.ownerSignedPaper}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Người giao:</span>
                    <span className="font-semibold">{report.giverName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Người nhận:</span>
                    <span className="font-semibold">{report.receiverName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Chỉ số điện chốt giao:</span>
                    <span className="font-mono font-bold text-amber-700">{report.initialElectricityKwh} kWh</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Chỉ số nước chốt giao:</span>
                    <span className="font-mono font-bold text-blue-700">{report.initialWaterM3} m³</span>
                  </div>
                </div>

                {report.status !== 'Đã xác nhận' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                    <span className="text-amber-900">
                      Biên bản đã lập sẵn sàng để khách thuê và chủ nhà ký nhận ngoài hệ thống.
                    </span>
                    <button
                      onClick={() => {
                        confirmHandoverSignaturesBG03(report.id, true, true, 'Tủ hồ sơ tầng 1');
                        alert('Đã ghi nhận 2 bên ký giấy thành công! Biên bản chuyển sang Đã xác nhận.');
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer shrink-0"
                    >
                      Ghi nhận 2 bên đã ký giấy → Đã xác nhận
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sự cố & Hư hỏng */}
      {activeTab === 'incidents_bg04' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Ghi nhận & Tra cứu sự cố tài sản</h2>
              <p className="text-xs text-slate-500">
                Ghi nhận diễn biến, nguyên nhân, trách nhiệm và chi phí tham khảo tại bước này.
              </p>
            </div>
            <button
              onClick={() => setShowIncidentModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Ghi nhận sự cố mới
            </button>
          </div>

          <div className="space-y-3">
            {incidents.map((inc) => (
              <div key={inc.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-slate-900">{inc.roomCode} - {inc.assetName}</span>
                    <span className="text-[11px] text-slate-400">· Thời điểm: {new Date(inc.occurredAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                    {inc.processingStatus}
                  </span>
                </div>

                <p className="text-slate-700">{inc.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                  <div><span>Nguyên nhân:</span> <strong>{inc.cause}</strong></div>
                  <div><span>Trách nhiệm:</span> <strong>{inc.responsibilityNote}</strong></div>
                  <div><span>Phương án xử lý:</span> <strong>{inc.solutionPlan}</strong></div>
                  <div><span>Chi phí tham khảo:</span> <strong className="font-mono text-blue-700">{inc.estimatedCompensation?.toLocaleString('vi-VN')} đ</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nhận lại phòng */}
      {activeTab === 'return_bg09' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Kiểm tra & Nhận lại phòng thực tế</h2>
              <p className="text-xs text-slate-500">
                Kiểm tra hiện trạng, chốt chỉ số điện nước và xác nhận bàn giao làm căn cứ chuyển trạng thái phòng.
              </p>
            </div>
            <button
              onClick={() => setShowInspectionModal(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
            >
              Ghi nhận kiểm tra nhận lại phòng
            </button>
          </div>

          <div className="space-y-3">
            {returnInspections.map((insp) => (
              <div key={insp.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{insp.roomCode}</span>
                    <span className="font-mono text-slate-500">({insp.leaseId})</span>
                    <span className="font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                      Hiện trạng: {insp.step304Status}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${insp.step305Confirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    Xác nhận chủ nhà: {insp.step305Confirmed ? 'Đã xác nhận' : 'Chờ xác nhận'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ngày kiểm tra:</span>
                    <span className="font-mono">{insp.inspectionDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Điện chốt lúc trả:</span>
                    <span className="font-mono font-bold text-amber-700">{insp.finalElectricityKwh} kWh</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nước chốt lúc trả:</span>
                    <span className="font-mono font-bold text-blue-700">{insp.finalWaterM3} m³</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">Chứng cứ bàn giao & hiện trạng:</span>{' '}
                  {insp.step305Evidence || 'Chưa cập nhật'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Biên bản trả phòng */}
      {activeTab === 'final_bg11' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Biên bản bàn giao trả phòng</h2>
              <p className="text-xs text-slate-500">
                Tổng hợp kết quả quyết toán cọc và đối chiếu tài sản bàn giao trước khi hoàn tất thủ tục trả phòng.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800">Hồ sơ trả phòng: Phòng 202 (Đã nhận lại 15/10/2026)</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[11px]">
                Đã lập (Chuẩn bị ký giấy)
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>1. Kết quả kiểm tra nhận lại:</span>
                <strong className="text-emerald-700">Đã xác nhận (15/10/2026)</strong>
              </div>
              <div className="flex justify-between">
                <span>2. Kết quả đối chiếu tài sản:</span>
                <strong className="text-emerald-700">Không có chênh lệch tài sản</strong>
              </div>
              <div className="flex justify-between">
                <span>3. Kết quả quyết toán tiền cọc:</span>
                <strong className="text-blue-700">QTC-202-2026 (Hoàn cọc 3.350.000 đ)</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  alert('Đã ghi nhận khách thuê và chủ nhà đã ký giấy xác nhận. Biên bản chuyển sang Đã xác nhận!');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Ghi nhận ký giấy hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD INCIDENT (BG04) ==================== */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Ghi nhận sự cố tài sản</h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tài sản liên quan</label>
              <input
                type="text"
                value={incAsset}
                onChange={(e) => setIncAsset(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mô tả sự cố <span className="text-red-500">*</span></label>
              <textarea
                value={incDesc}
                onChange={(e) => setIncDesc(e.target.value)}
                rows={2}
                placeholder="Mô tả hiện tượng hư hỏng..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nguyên nhân sơ bộ</label>
              <input
                type="text"
                value={incCause}
                onChange={(e) => setIncCause(e.target.value)}
                placeholder="Ví dụ: chập điện, rơi vỡ, hao mòn tự nhiên..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chi phí ước tính tham khảo (đ)</label>
              <input
                type="number"
                value={incCost}
                onChange={(e) => setIncCost(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
              <span className="text-[11px] text-slate-400 block mt-0.5">Lưu ý: Không tự tạo công nợ hoặc trừ cọc tại bước này.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowIncidentModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!incDesc) {
                    alert('Mô tả sự cố là trường bắt buộc.');
                    return;
                  }
                  recordIncidentBG04({
                    id: 'inc_' + Date.now(),
                    roomCode: selectedRoomCode,
                    leaseId: 'THUE-' + selectedRoomCode + '-L1',
                    scope: 'Tài sản cụ thể',
                    assetName: incAsset,
                    occurredAt: new Date().toISOString(),
                    description: incDesc,
                    cause: incCause,
                    responsibilityStatus: 'Đã xác định',
                    responsibilityNote: 'Hao mòn tự nhiên theo thời gian',
                    processingStatus: 'Đang xử lý',
                    solutionPlan: 'Bảo trì thay thế linh kiện',
                    estimatedCompensation: incCost,
                    photos: [],
                    loggedBy: 'Nguyễn Văn An',
                    loggedAt: new Date().toISOString()
                  });
                  alert('Ghi nhận sự cố tài sản thành công!');
                  setShowIncidentModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Lưu sự cố
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: RETURN INSPECTION (BG09) ==================== */}
      {showInspectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Ghi nhận kết quả nhận lại phòng</h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phòng bàn giao trả</label>
              <select
                value={retRoom}
                onChange={(e) => setRetRoom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              >
                {rooms.filter(r => r.status !== 'Trống').map(r => (
                  <option key={r.id} value={r.roomCode}>{r.roomCode} - {r.currentTenantName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số điện chốt lúc trả (kWh)</label>
                <input
                  type="number"
                  value={retElec}
                  onChange={(e) => setRetElec(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số nước chốt lúc trả (m³)</label>
                <input
                  type="number"
                  value={retWater}
                  onChange={(e) => setRetWater(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chứng cứ bàn giao chìa khóa & hiện trạng <span className="text-red-500">*</span></label>
              <textarea
                value={retEvidence}
                onChange={(e) => setRetEvidence(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowInspectionModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  recordReturnInspectionBG09({
                    id: 'ret_' + Date.now(),
                    roomCode: retRoom,
                    leaseId: 'THUE-' + retRoom + '-L1',
                    inspectionDate: '2026-10-16',
                    step304Status: 'Đã nhận lại',
                    step305Confirmed: true,
                    step305ConfirmedAt: new Date().toISOString(),
                    step305ConfirmedBy: 'Nguyễn Văn An',
                    step305Evidence: retEvidence,
                    finalElectricityKwh: retElec,
                    finalWaterM3: retWater,
                    assetsCheckedFully: true,
                    items: standardAssets.map(a => ({
                      name: a.name,
                      inspected: true,
                      quantity: a.standardQuantity,
                      condition: 'Bình thường'
                    }))
                  });
                  alert('Ghi nhận kết quả nhận lại phòng thành công! Bạn có thể chuyển sang mục Quản lý phòng để cập nhật phòng sang trạng thái Trống.');
                  setShowInspectionModal(false);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Lưu & Xác nhận bàn giao nhận lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
