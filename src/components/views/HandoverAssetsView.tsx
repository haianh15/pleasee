import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  InventoryRecord,
  HandoverCondition,
  HandoverReport,
  AssetIncident,
  ReturnInspection,
  AssetComparisonResult,
  HandoverReturnReport,
  RoomAssetItem
} from '../../types';
import {
  PackageCheck,
  FileSignature,
  AlertOctagon,
  Scale,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  Check,
  X,
  ShieldAlert,
  ArrowRight,
  ClipboardList,
  Search,
  Filter,
  Camera,
  Video,
  FileSpreadsheet,
  Link2,
  History,
  RotateCcw,
  Zap,
  Droplet,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

export const HandoverAssetsView: React.FC = () => {
  const {
    rooms,
    contracts,
    standardAssets,
    inventoryRecords,
    handoverConditions,
    handoverReports,
    incidents,
    returnInspections,
    assetComparisonResults,
    handoverReturnReports,
    saveInventoryBG01,
    saveHandoverConditionBG02,
    saveHandoverReportBG03,
    confirmHandoverSignaturesBG03,
    recordIncidentBG04,
    recordReturnInspectionBG09,
    confirmReturnInspectionStep305,
    saveAssetComparisonResultBG07,
    saveHandoverReturnReportBG11,
    confirmFinalReturnReportBG11,
    initialPaymentRecords,
    currentUser
  } = useApp();

  // Active sub-tab covering all 6 requested Use Cases:
  // UC-BG01: inventory_bg01 (Kiểm kê tài sản)
  // UC-BG02: condition_bg02 (Hiện trạng bàn giao)
  // UC-BG03: handover_bg03 (Biên bản nhận phòng)
  // UC-BG04: incident_add_bg04 (Ghi nhận sự cố)
  // UC-BG05: incident_search_bg05 (Tra cứu lịch sử sự cố)
  // UC-BG06: compare_bg06 (Đối chiếu tài sản trả phòng)
  const [activeTab, setActiveTab] = useState<
    'inventory_bg01' | 'condition_bg02' | 'handover_bg03' | 'incident_add_bg04' | 'incident_search_bg05' | 'compare_bg06'
  >('inventory_bg01');

  // Selected room for active operations
  const [selectedRoomCode, setSelectedRoomCode] = useState<string>('P.103');

  // Toast feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  // Helper: target room
  const selectedRoom = rooms.find(r => r.roomCode === selectedRoomCode) || rooms[0];
  const targetContract = contracts.find(c => c.roomCode === selectedRoomCode && (c.status === 'Hiệu lực' || c.status === 'Chờ hiệu lực'));
  const currentInitialPayment = initialPaymentRecords.find(p => p.roomCode === selectedRoomCode);

  // ==================== STATE UC-BG01: KIỂM KÊ TÀI SẢN PHÒNG ====================
  const existingInventory = inventoryRecords.find(i => i.roomCode === selectedRoomCode);
  const [inventoryItems, setInventoryItems] = useState<RoomAssetItem[]>(() => {
    if (existingInventory && existingInventory.items.length > 0) {
      return existingInventory.items;
    }
    return standardAssets.map((ast, idx) => ({
      id: `inv_item_${selectedRoomCode}_${idx}`,
      assetId: ast.id,
      name: ast.name,
      unit: ast.unit,
      standardQuantity: ast.standardQuantity,
      actualQuantity: ast.standardQuantity,
      quantityDiff: 'Đủ' as const,
      physicalCondition: 'Bình thường' as const,
      notes: ''
    }));
  });

  // AF-01: Modal bổ sung tài sản mới vào kiểm kê
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetUnit, setNewAssetUnit] = useState('Cái');
  const [newAssetQty, setNewAssetQty] = useState<number>(1);
  const [newAssetCondition, setNewAssetCondition] = useState<'Bình thường' | 'Hư hỏng' | 'Khác'>('Bình thường');
  const [newAssetNote, setNewAssetNote] = useState('');

  // Modal liên kết hợp đồng / lần thuê thực tế (BR-UC.BG.01-05 & 07)
  const [showLinkContractModal, setShowLinkContractModal] = useState(false);
  const [linkContractId, setLinkContractId] = useState(targetContract?.id || '');

  // ==================== STATE UC-BG02: GHI NHẬN HIỆN TRẠNG TÀI SẢN ====================
  const existingCondition = handoverConditions.find(c => c.roomCode === selectedRoomCode);
  const [condScope, setCondScope] = useState<'Tài sản cụ thể' | 'Hiện trạng chung của phòng'>('Hiện trạng chung của phòng');
  const [condAssetName, setCondAssetName] = useState<string>(standardAssets[0]?.name || 'Điều hòa Daikin');
  const [condDesc, setCondDesc] = useState<string>(existingCondition?.description || 'Phòng sạch sẽ, sơn tường mới, sàn gạch men nguyên vẹn.');
  const [condPhotos, setCondPhotos] = useState<string[]>(existingCondition?.photos || ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop']);
  const [condVideoUrl, setCondVideoUrl] = useState<string>(existingCondition?.videoUrl || '');
  const [condVideoError, setCondVideoError] = useState<string | null>(null);

  // Bước 1.03: Chốt chỉ số điện nước thực tế ngoài hệ thống
  const [meterElecCode, setMeterElecCode] = useState<string>(existingCondition?.meterElectricCode || 'CT-D-' + selectedRoomCode.replace(/\D/g, ''));
  const [meterElecKwh, setMeterElecKwh] = useState<number>(existingCondition?.initialElectricityKwh || 1250);
  const [meterWaterCode, setMeterWaterCode] = useState<string>(existingCondition?.meterWaterCode || 'CT-N-' + selectedRoomCode.replace(/\D/g, ''));
  const [meterWaterM3, setMeterWaterM3] = useState<number>(existingCondition?.initialWaterM3 || 45);
  const [meterPhotos, setMeterPhotos] = useState<string[]>(existingCondition?.meterPhotos || ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop']);

  // Bước 1.04 & 1.05: Khách kiểm tra thực tế
  const [tenantCheckOption, setTenantCheckOption] = useState<'Không cần bổ sung' | 'Có bổ sung'>('Không cần bổ sung');
  const [tenantCheckNote, setTenantCheckNote] = useState<string>(existingCondition?.tenantCheckNote || 'Khách đã kiểm tra thực tế tại phòng.');
  const [supplementNote, setSupplementNote] = useState<string>(existingCondition?.supplementNote || '');

  // ==================== STATE UC-BG03: LẬP BIÊN BẢN NHẬN PHÒNG ====================
  const existingReport = handoverReports.find(r => r.roomCode === selectedRoomCode);
  const [showSignPaperModal, setShowSignPaperModal] = useState(false);
  const [signPaperTenant, setSignPaperTenant] = useState<boolean>(existingReport?.tenantSignedPaper === 'Đã ký giấy');
  const [signPaperOwner, setSignPaperOwner] = useState<boolean>(existingReport?.ownerSignedPaper === 'Đã ký giấy');
  const [paperLocation, setPaperLocation] = useState<string>(existingReport?.paperLocation || 'Tủ hồ sơ tầng 1 - Kẹp P.' + selectedRoomCode.replace(/\D/g, ''));
  const [signedDocumentScanUrl, setSignedDocumentScanUrl] = useState<string>(existingReport?.signedDocumentScanUrl || '');

  // ==================== STATE UC-BG04: GHI NHẬN SỰ CỐ TÀI SẢN ====================
  const [incScope, setIncScope] = useState<'Tài sản cụ thể' | 'Hiện trạng chung'>('Tài sản cụ thể');
  const [incAsset, setIncAsset] = useState<string>(standardAssets[0]?.name || 'Điều hòa Daikin');
  const [incDesc, setIncDesc] = useState('');
  const [incCause, setIncCause] = useState('');
  const [incRespStatus, setIncRespStatus] = useState<'Chưa xác định' | 'Đã xác định'>('Chưa xác định');
  const [incRespNote, setIncRespNote] = useState('');
  const [incProcessingStatus, setIncProcessingStatus] = useState<'Chưa xử lý' | 'Đang xử lý' | 'Đã xử lý'>('Đang xử lý');
  const [incSolutionPlan, setIncSolutionPlan] = useState('');
  const [incActualResult, setIncActualResult] = useState('');
  const [incEstimatedCost, setIncEstimatedCost] = useState<number>(0);
  const [incExternalPaymentNote, setIncExternalPaymentNote] = useState('');
  const [incPhotos, setIncPhotos] = useState<string[]>([]);
  const [incVideoUrl, setIncVideoUrl] = useState('');

  // ==================== STATE UC-BG05: TRA CỨU SỰ CỐ TÀI SẢN ====================
  const [bg05FilterAsset, setBg05FilterAsset] = useState<string>('Tất cả');
  const [bg05FilterStatus, setBg05FilterStatus] = useState<string>('Tất cả');
  const [bg05FilterStartDate, setBg05FilterStartDate] = useState<string>('');
  const [bg05FilterEndDate, setBg05FilterEndDate] = useState<string>('');
  const [bg05SearchKeyword, setBg05SearchKeyword] = useState<string>('');
  const [selectedIncidentDetail, setSelectedIncidentDetail] = useState<AssetIncident | null>(null);
  const [bg05AuditStamp, setBg05AuditStamp] = useState<string | null>(null);

  // ==================== STATE UC-BG06: ĐỐI CHIẾU TÀI SẢN KHI TRẢ PHÒNG ====================
  const returnInspectionTarget = returnInspections.find(i => i.roomCode === selectedRoomCode);
  const [comparisonItems, setComparisonItems] = useState<{
    assetName: string;
    qtyReceive: number;
    qtyReturn: number;
    condReceive: string;
    condReturn: string;
    diffResult: 'Đúng như bàn giao' | 'Khác biệt';
    diffNote: string;
  }[]>([]);

  // Update inventory items when room changes
  const handleRoomChange = (roomCode: string) => {
    setSelectedRoomCode(roomCode);
    const existing = inventoryRecords.find(i => i.roomCode === roomCode);
    if (existing && existing.items.length > 0) {
      setInventoryItems(existing.items);
    } else {
      setInventoryItems(standardAssets.map((ast, idx) => ({
        id: `inv_item_${roomCode}_${idx}`,
        assetId: ast.id,
        name: ast.name,
        unit: ast.unit,
        standardQuantity: ast.standardQuantity,
        actualQuantity: ast.standardQuantity,
        quantityDiff: 'Đủ' as const,
        physicalCondition: 'Bình thường' as const,
        notes: ''
      })));
    }
  };

  // Compute quantityDiff based on standard and actual
  const updateActualQty = (index: number, val: number) => {
    setInventoryItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const actual = Math.max(0, Math.floor(val));
      const diff: 'Đủ' | 'Thiếu' | 'Thừa' = actual === item.standardQuantity ? 'Đủ' : actual < item.standardQuantity ? 'Thiếu' : 'Thừa';
      return {
        ...item,
        actualQuantity: actual,
        quantityDiff: diff
      };
    }));
  };

  const updatePhysicalCondition = (index: number, cond: 'Bình thường' | 'Hư hỏng' | 'Khác') => {
    setInventoryItems(prev => prev.map((item, i) => i === index ? { ...item, physicalCondition: cond } : item));
  };

  const updateItemNotes = (index: number, notes: string) => {
    setInventoryItems(prev => prev.map((item, i) => i === index ? { ...item, notes } : item));
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-xs font-semibold ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' :
          toast.type === 'error' ? 'bg-red-50 text-red-900 border-red-300' :
          'bg-blue-50 text-blue-900 border-blue-300'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900">Bàn giao, Kiểm kê &amp; Đối chiếu Tài sản (UC-BG01 → BG06)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy trình chuẩn: Kiểm kê tài sản (BG01) &rarr; Ghi nhận hiện trạng (BG02) &rarr; Lập biên bản (BG03) &rarr; Theo dõi sự cố (BG04/05) &rarr; Đối chiếu khi trả phòng (BG06).
          </p>
        </div>

        {/* Global Room Selector */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
          <span className="font-semibold text-slate-600">Phòng thao tác:</span>
          <select
            value={selectedRoomCode}
            onChange={(e) => handleRoomChange(e.target.value)}
            className="px-2.5 py-1 border border-slate-300 rounded bg-white font-mono font-bold text-blue-700 cursor-pointer"
          >
            {rooms.map(r => (
              <option key={r.id} value={r.roomCode}>
                {r.roomCode} - {r.currentTenantName || 'Trống'} ({r.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto text-xs shrink-0">
        <button
          onClick={() => setActiveTab('inventory_bg01')}
          className={`px-3 py-2 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'inventory_bg01' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>1. Kiểm kê tài sản (UC-BG01)</span>
        </button>
        <button
          onClick={() => setActiveTab('condition_bg02')}
          className={`px-3 py-2 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'condition_bg02' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>2. Hiện trạng bàn giao (UC-BG02)</span>
        </button>
        <button
          onClick={() => setActiveTab('handover_bg03')}
          className={`px-3 py-2 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'handover_bg03' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSignature className="w-3.5 h-3.5" />
          <span>3. Biên bản nhận phòng (UC-BG03)</span>
        </button>
        <button
          onClick={() => setActiveTab('incident_add_bg04')}
          className={`px-3 py-2 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'incident_add_bg04' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
          <span>4. Ghi sự cố tài sản (UC-BG04)</span>
        </button>
        <button
          onClick={() => setActiveTab('incident_search_bg05')}
          className={`px-3 py-2 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'incident_search_bg05' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>5. Tra cứu lịch sử sự cố (UC-BG05)</span>
        </button>
        <button
          onClick={() => setActiveTab('compare_bg06')}
          className={`px-3 py-2 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'compare_bg06' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-emerald-600" />
          <span>6. Đối chiếu trả phòng (UC-BG06)</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: KIỂM KÊ TÀI SẢN PHÒNG (UC-BG01)
      ========================================================================= */}
      {activeTab === 'inventory_bg01' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
          {/* Header Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">UC-BG01</span>
                <h2 className="text-sm font-bold text-slate-900">Kiểm kê tài sản chuẩn bị trước khi giao phòng</h2>
              </div>
              <p className="text-slate-500 mt-0.5">
                Kiểm tra danh mục, số lượng và tình trạng vật lý thực tế. Quản lý 2 trạng thái độc lập: Kiểm kê (Nháp/Hoàn tất) &amp; Liên kết HĐ (Chưa/Đã liên kết).
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddAssetModal(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Bổ sung tài sản (AF-01)</span>
              </button>
              <button
                onClick={() => setShowLinkContractModal(true)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Liên kết HĐ/Lần thuê (BR-01-05)</span>
              </button>
            </div>
          </div>

          {/* Room & Status Info Bar (Giao diện mục 2) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-700">
            <div>
              <span className="text-slate-500 block text-[11px]">Mã phòng &amp; Tầng:</span>
              <strong className="font-mono text-slate-900">{selectedRoom.roomCode} (Tầng {selectedRoom.floor})</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Đợt dự kiến &amp; Phiên bản:</span>
              <span className="font-mono text-slate-800">{existingInventory?.expectedBatchCode || 'DOT-2026-K10'} (v{existingInventory?.version || 1})</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">1. Trạng thái kiểm kê:</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                existingInventory?.inventoryStatus === 'Đã hoàn tất' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {existingInventory?.inventoryStatus || 'Chưa kiểm kê'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">2. Trạng thái liên kết HĐ:</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                existingInventory?.linkStatus === 'Đã liên kết' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {existingInventory?.linkStatus || 'Chưa liên kết'}
              </span>
              {existingInventory?.linkedContractId && (
                <span className="block text-[10px] font-mono text-slate-500">{existingInventory.linkedContractId}</span>
              )}
            </div>
          </div>

          {/* Quy tắc cảnh báo nghiệp vụ BR-UC.BG.01-07 */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Quy tắc nghiệp vụ BR-UC.BG.01-07:</strong> Bản kiểm kê <em>Đã hoàn tất</em> nhưng <em>Chưa liên kết</em> là hợp lệ để chuẩn bị trước ký HĐ, song <strong>KHÔNG đủ điều kiện</strong> cho UC-BG03 Lưu Đã lập. Trước 1.06 phải có đồng thời <strong>Đã hoàn tất</strong> và <strong>Đã liên kết</strong> đúng hợp đồng/lần thuê.
            </div>
          </div>

          {/* Table of Assets (Giao diện mục 3) */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Tên tài sản / Thiết bị</th>
                  <th className="py-2.5 px-3">Đơn vị</th>
                  <th className="py-2.5 px-3">SL Danh mục</th>
                  <th className="py-2.5 px-3">SL Thực tế (nguyên &ge; 0)</th>
                  <th className="py-2.5 px-3">Đối chiếu SL (BR-01-06)</th>
                  <th className="py-2.5 px-3">Tình trạng vật lý</th>
                  <th className="py-2.5 px-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {inventoryItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{item.unit}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{item.standardQuantity}</td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.actualQuantity}
                        onChange={(e) => updateActualQty(idx, Number(e.target.value))}
                        className="w-16 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-center text-blue-700 bg-blue-50/40"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        item.quantityDiff === 'Đủ' ? 'bg-emerald-100 text-emerald-800' :
                        item.quantityDiff === 'Thiếu' ? 'bg-rose-100 text-rose-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {item.quantityDiff}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={item.physicalCondition}
                        onChange={(e) => updatePhysicalCondition(idx, e.target.value as any)}
                        className="px-2 py-1 border border-slate-300 rounded text-xs bg-white cursor-pointer"
                      >
                        <option value="Bình thường">Bình thường</option>
                        <option value="Hư hỏng">Hư hỏng</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        placeholder="Ghi chú chi tiết..."
                        value={item.notes || ''}
                        onChange={(e) => updateItemNotes(idx, e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons (Giao diện mục 4) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                // AF-03: Hủy bỏ
                handleRoomChange(selectedRoomCode);
                showToast('info', 'Đã hủy các thay đổi chưa lưu và khôi phục dữ liệu gốc.');
              }}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
            >
              Hủy thay đổi (AF-03)
            </button>

            <div className="flex items-center gap-2">
              {/* AF-02: Lưu nháp */}
              <button
                onClick={() => {
                  const draftRecord: InventoryRecord = {
                    id: existingInventory?.id || 'inv_' + selectedRoomCode.replace(/\D/g, '') + '_' + Date.now().toString().slice(-4),
                    roomCode: selectedRoomCode,
                    expectedBatchCode: existingInventory?.expectedBatchCode || 'DOT-2026-K10',
                    version: (existingInventory?.version || 1),
                    inventoryStatus: 'Nháp',
                    linkStatus: existingInventory?.linkStatus || 'Chưa liên kết',
                    linkedContractId: existingInventory?.linkedContractId,
                    linkedLeaseId: existingInventory?.linkedLeaseId,
                    items: inventoryItems,
                    completedAt: undefined,
                    completedBy: currentUser?.fullName || 'Chủ nhà'
                  };
                  saveInventoryBG01(draftRecord);
                  showToast('info', 'Đã lưu nháp kiểm kê tài sản (AF-02). Chưa đủ căn cứ lập biên bản chính thức.');
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold cursor-pointer"
              >
                Lưu nháp kiểm kê (AF-02)
              </button>

              {/* Bước 3: Lưu hoàn tất */}
              <button
                onClick={() => {
                  // Validation EF-02 & EF-04
                  for (const itm of inventoryItems) {
                    if (itm.actualQuantity < 0 || !Number.isInteger(itm.actualQuantity)) {
                      showToast('error', `EF-02: Số lượng của "${itm.name}" không hợp lệ. Phải là số nguyên không âm.`);
                      return;
                    }
                  }
                  const completedRecord: InventoryRecord = {
                    id: existingInventory?.id || 'inv_' + selectedRoomCode.replace(/\D/g, '') + '_' + Date.now().toString().slice(-4),
                    roomCode: selectedRoomCode,
                    expectedBatchCode: existingInventory?.expectedBatchCode || 'DOT-2026-K10',
                    version: (existingInventory?.version || 1),
                    inventoryStatus: 'Đã hoàn tất',
                    linkStatus: existingInventory?.linkStatus || (targetContract ? 'Đã liên kết' : 'Chưa liên kết'),
                    linkedContractId: existingInventory?.linkedContractId || targetContract?.id,
                    linkedLeaseId: existingInventory?.linkedLeaseId || (targetContract ? targetContract.leaseId : undefined),
                    items: inventoryItems,
                    completedAt: new Date().toISOString(),
                    completedBy: currentUser?.fullName || 'Chủ nhà'
                  };
                  saveInventoryBG01(completedRecord);
                  showToast('success', 'Đã lưu kết quả kiểm kê ĐÃ HOÀN TẤT thành công (UC-BG01)!');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
              >
                Lưu kiểm kê hoàn tất (Bước 3)
              </button>

              {/* Bước 4: Tiếp tục ghi hiện trạng (UC-BG02) */}
              <button
                onClick={() => setActiveTab('condition_bg02')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Tiếp tục ghi hiện trạng (UC-BG02)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: GHI NHẬN HIỆN TRẠNG TÀI SẢN (UC-BG02)
      ========================================================================= */}
      {activeTab === 'condition_bg02' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">UC-BG02</span>
                <h2 className="text-sm font-bold text-slate-900">Ghi nhận hiện trạng tài sản &amp; Chốt chỉ số điện nước bàn giao</h2>
              </div>
              <p className="text-slate-500 mt-0.5">
                Ghi nhận tình trạng phòng bằng mô tả, ảnh, URL video; chốt công tơ điện nước ngoài hệ thống (bước 1.03) và ghi nhận kết quả khách kiểm tra (1.04).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                existingInventory?.inventoryStatus === 'Đã hoàn tất' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                Kiểm kê BG01: {existingInventory?.inventoryStatus || 'Chưa kiểm kê'}
              </span>
            </div>
          </div>

          {/* Form ghi nhận hiện trạng */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>1. Mô tả hiện trạng &amp; Bằng chứng (Ảnh/Video)</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phạm vi ghi nhận <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={condScope}
                    onChange={(e) => setCondScope(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Hiện trạng chung của phòng">Hiện trạng chung của phòng</option>
                    <option value="Tài sản cụ thể">Tài sản cụ thể</option>
                  </select>
                </div>

                {condScope === 'Tài sản cụ thể' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tài sản liên quan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={condAssetName}
                      onChange={(e) => setCondAssetName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    >
                      {inventoryItems.map(item => (
                        <option key={item.id} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mô tả tình trạng thực tế <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={condDesc}
                  onChange={(e) => setCondDesc(e.target.value)}
                  placeholder="Mô tả kỹ hiện trạng màu sơn tường, vết nứt, độ mới của đồ đạc..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                />
              </div>

              {/* Photos & Limits (BR-UC.BG.02-08) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">
                    Ảnh minh chứng hiện trạng (Tối đa 5MB/ảnh)
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Đã tải {condPhotos.length}/8 ảnh (dành sẵn 2 vị trí cho ảnh công tơ)
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {condPhotos.map((p, idx) => (
                    <div key={idx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-300">
                      <img src={p} alt="Bằng chứng" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setCondPhotos(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {condPhotos.length < 8 && (
                    <button
                      onClick={() => {
                        const samplePhotos = [
                          'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop',
                          'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500&auto=format&fit=crop',
                          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&auto=format&fit=crop'
                        ];
                        const nextPhoto = samplePhotos[condPhotos.length % samplePhotos.length];
                        setCondPhotos(prev => [...prev, nextPhoto]);
                      }}
                      className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-[9px]">Thêm ảnh</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Video URL HTTP(S) (EF-07) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Đường dẫn video kiểm chứng ngoài (HTTP/HTTPS)
                </label>
                <input
                  type="url"
                  value={condVideoUrl}
                  onChange={(e) => {
                    const url = e.target.value;
                    setCondVideoUrl(url);
                    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                      setCondVideoError('EF-07: URL video phải có định dạng HTTP hoặc HTTPS hợp lệ.');
                    } else {
                      setCondVideoError(null);
                    }
                  }}
                  placeholder="https://drive.google.com/... hoặc https://youtube.com/..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                />
                {condVideoError ? (
                  <span className="text-[10px] text-red-600 font-semibold block mt-0.5">{condVideoError}</span>
                ) : (
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    * Không upload video trực tiếp. URL đúng cú pháp nhưng chưa kiểm chứng quyền sẽ lưu nhãn "Chưa xác minh".
                  </span>
                )}
              </div>
            </div>

            {/* Bước 1.03 & 1.04: Chốt số công tơ & Khách kiểm tra */}
            <div className="space-y-4">
              {/* Khối Chốt công tơ điện nước (1.03) */}
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>2. Chốt chỉ số điện nước bàn giao (Bước 1.03)</span>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                    Bắt buộc có 02 ảnh công tơ
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Mã đồng hồ điện:</label>
                    <input
                      type="text"
                      value={meterElecCode}
                      onChange={(e) => setMeterElecCode(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                    />
                    <label className="font-semibold text-slate-700 block pt-1">Số điện đầu kỳ (kWh):</label>
                    <input
                      type="number"
                      min="0"
                      value={meterElecKwh}
                      onChange={(e) => setMeterElecKwh(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono font-bold text-amber-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Mã đồng hồ nước:</label>
                    <input
                      type="text"
                      value={meterWaterCode}
                      onChange={(e) => setMeterWaterCode(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                    />
                    <label className="font-semibold text-slate-700 block pt-1">Số nước đầu kỳ (m³):</label>
                    <input
                      type="number"
                      min="0"
                      value={meterWaterM3}
                      onChange={(e) => setMeterWaterM3(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono font-bold text-blue-800"
                    />
                  </div>
                </div>

                {/* Meter photos (dành sẵn 2 vị trí) */}
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Ảnh chụp công tơ thực tế đối chứng:</span>
                  <div className="flex items-center gap-2">
                    {meterPhotos.map((m, idx) => (
                      <div key={idx} className="w-16 h-16 rounded border overflow-hidden">
                        <img src={m} alt="Công tơ" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {meterPhotos.length < 2 && (
                      <button
                        onClick={() => setMeterPhotos(prev => [...prev, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop'])}
                        className="px-2 py-1 text-[11px] bg-blue-600 text-white rounded font-medium cursor-pointer"
                      >
                        + Bổ sung ảnh công tơ
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Khối Khách kiểm tra (1.04 & 1.05) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900">3. Kết quả khách kiểm tra thực tế (Bước 1.04 &amp; 1.05)</span>
                  <select
                    value={tenantCheckOption}
                    onChange={(e) => setTenantCheckOption(e.target.value as any)}
                    className="px-2 py-0.5 border border-slate-300 rounded font-semibold text-slate-800 bg-white"
                  >
                    <option value="Không cần bổ sung">Không cần bổ sung</option>
                    <option value="Có bổ sung">Có bổ sung (AF-01)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Ghi chú đối chiếu thực tế của khách:</label>
                  <input
                    type="text"
                    value={tenantCheckNote}
                    onChange={(e) => setTenantCheckNote(e.target.value)}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white"
                  />
                </div>

                {tenantCheckOption === 'Có bổ sung' && (
                  <div>
                    <label className="block text-amber-800 font-semibold mb-1">Nội dung khách yêu cầu bổ sung (Bước 1.05):</label>
                    <textarea
                      rows={2}
                      value={supplementNote}
                      onChange={(e) => setSupplementNote(e.target.value)}
                      placeholder="Ghi rõ yêu cầu sửa chữa, vệ sinh lại hoặc bổ sung thêm đồ đạc..."
                      className="w-full px-2.5 py-1 border border-amber-300 rounded bg-amber-50/50"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('inventory_bg01')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
            >
              &larr; Quay lại kiểm kê BG01
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const cond: HandoverCondition = {
                    id: existingCondition?.id || 'hc_' + selectedRoomCode.replace(/\D/g, '') + '_' + Date.now().toString().slice(-4),
                    roomCode: selectedRoomCode,
                    expectedBatchCode: existingInventory?.expectedBatchCode || 'DOT-2026-K10',
                    linkedContractId: existingInventory?.linkedContractId,
                    linkedLeaseId: existingInventory?.linkedLeaseId,
                    status: 'Nháp',
                    scope: condScope,
                    assetName: condScope === 'Tài sản cụ thể' ? condAssetName : undefined,
                    description: condDesc,
                    photos: condPhotos,
                    videoUrl: condVideoUrl,
                    evidenceStatus: condPhotos.length > 0 ? 'Đã đính kèm' : 'Chưa đính kèm',
                    initialElectricityKwh: meterElecKwh,
                    initialWaterM3: meterWaterM3,
                    meterElectricCode: meterElecCode,
                    meterWaterCode: meterWaterCode,
                    meterPhotos: meterPhotos,
                    tenantChecked: true,
                    tenantCheckNote,
                    tenantCheckSupplement: tenantCheckOption,
                    supplementNote,
                    handoverDoneAt: new Date().toISOString(),
                    loggedBy: currentUser?.fullName || 'Chủ nhà',
                    version: existingCondition ? existingCondition.version + 1 : 1
                  };
                  saveHandoverConditionBG02(cond);
                  showToast('info', 'Đã lưu nháp hồ sơ hiện trạng bàn giao (UC-BG02).');
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold cursor-pointer"
              >
                Lưu nháp hiện trạng
              </button>

              <button
                onClick={() => {
                  if (!condDesc.trim()) {
                    showToast('error', 'Vui lòng nhập mô tả tình trạng thực tế.');
                    return;
                  }
                  if (condVideoError) {
                    showToast('error', condVideoError);
                    return;
                  }
                  const cond: HandoverCondition = {
                    id: existingCondition?.id || 'hc_' + selectedRoomCode.replace(/\D/g, '') + '_' + Date.now().toString().slice(-4),
                    roomCode: selectedRoomCode,
                    expectedBatchCode: existingInventory?.expectedBatchCode || 'DOT-2026-K10',
                    linkedContractId: existingInventory?.linkedContractId || targetContract?.id,
                    linkedLeaseId: existingInventory?.linkedLeaseId || targetContract?.leaseId,
                    status: existingInventory?.inventoryStatus === 'Đã hoàn tất' ? 'Đã hoàn tất' : 'Nháp',
                    scope: condScope,
                    assetName: condScope === 'Tài sản cụ thể' ? condAssetName : undefined,
                    description: condDesc,
                    photos: condPhotos,
                    videoUrl: condVideoUrl,
                    evidenceStatus: condVideoUrl && !condVideoError ? 'Chưa xác minh' : (condPhotos.length > 0 ? 'Đã đính kèm' : 'Chưa đính kèm'),
                    initialElectricityKwh: meterElecKwh,
                    initialWaterM3: meterWaterM3,
                    meterElectricCode: meterElecCode,
                    meterWaterCode: meterWaterCode,
                    meterPhotos: meterPhotos,
                    tenantChecked: true,
                    tenantCheckNote,
                    tenantCheckSupplement: tenantCheckOption,
                    supplementNote,
                    handoverDoneAt: new Date().toISOString(),
                    loggedBy: currentUser?.fullName || 'Chủ nhà',
                    version: existingCondition ? existingCondition.version + 1 : 1
                  };
                  saveHandoverConditionBG02(cond);
                  showToast('success', 'Đã lưu hiện trạng bàn giao & chỉ số điện nước thành công (UC-BG02)!');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
              >
                Lưu hiện trạng bàn giao (Bước 3)
              </button>

              <button
                onClick={() => setActiveTab('handover_bg03')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Lập biên bản nhận phòng (UC-BG03)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: LẬP BIÊN BẢN NHẬN PHÒNG (UC-BG03)
      ========================================================================= */}
      {activeTab === 'handover_bg03' && (() => {
        // Evaluate Mandatory Prerequisites for 1.06 Lưu Đã lập
        const cond1ContractValid = Boolean(targetContract && (targetContract.status === 'Hiệu lực' || targetContract.isSignedPaper));
        const cond2DepositPaid = Boolean((currentInitialPayment && currentInitialPayment.depositAmount > 0) || selectedRoom.hasDeposit);
        const cond3FirstRentPaid = Boolean((currentInitialPayment && currentInitialPayment.firstMonthRentAmount > 0) || selectedRoom.firstMonthRentPaid);
        const cond4InventoryReady = Boolean(existingInventory?.inventoryStatus === 'Đã hoàn tất' && existingInventory?.linkStatus === 'Đã liên kết');
        const cond5MetersReady = Boolean(existingCondition && existingCondition.meterPhotos.length > 0 && existingCondition.initialElectricityKwh >= 0 && existingCondition.initialWaterM3 >= 0);

        const canSaveOfficially106 = cond1ContractValid && cond2DepositPaid && cond3FirstRentPaid && cond4InventoryReady && cond5MetersReady;

        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">UC-BG03</span>
                  <h2 className="text-sm font-bold text-slate-900">Biên bản bàn giao nhận phòng</h2>
                </div>
                <p className="text-slate-500 mt-0.5">
                  Lập biên bản nhận phòng từ kết quả kiểm kê và chốt công tơ thực tế. Hai bên ký giấy ngoài hệ thống. Toàn bộ biên bản chỉ có 3 trạng thái: Nháp / Đã lập / Đã xác nhận.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Trạng thái biên bản:</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  existingReport?.status === 'Đã xác nhận' ? 'bg-emerald-100 text-emerald-800' :
                  existingReport?.status === 'Đã lập' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {existingReport?.status || 'Chưa lập'}
                </span>
              </div>
            </div>

            {/* Khối kiểm tra điều kiện tiên quyết bắt buộc (Giao diện mục 4) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-800 text-[11px] block uppercase tracking-wider">
                Khối điều kiện bắt buộc để Lưu Đã lập (1.06) &amp; Bắt đầu bàn giao thực tế:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-[11px]">
                <div className={`p-2 rounded border flex items-center justify-between ${cond1ContractValid ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                  <span>1. HĐ đã ký &amp; hiệu lực</span>
                  <strong>{cond1ContractValid ? 'Đạt' : 'Chưa đạt'}</strong>
                </div>
                <div className={`p-2 rounded border flex items-center justify-between ${cond2DepositPaid ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                  <span>2. Đã thu cọc 1 tháng (PH-07)</span>
                  <strong>{cond2DepositPaid ? 'Đạt' : 'Chưa đạt'}</strong>
                </div>
                <div className={`p-2 rounded border flex items-center justify-between ${cond3FirstRentPaid ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                  <span>3. Thu thuê kỳ đầu 1 tháng</span>
                  <strong>{cond3FirstRentPaid ? 'Đạt' : 'Chưa đạt'}</strong>
                </div>
                <div className={`p-2 rounded border flex items-center justify-between ${cond4InventoryReady ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                  <span>4. BG01 Hoàn tất &amp; Liên kết</span>
                  <strong>{cond4InventoryReady ? 'Đạt' : 'Chưa đạt'}</strong>
                </div>
                <div className={`p-2 rounded border flex items-center justify-between ${cond5MetersReady ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                  <span>5. BG02 Số đọc/Ảnh công tơ</span>
                  <strong>{cond5MetersReady ? 'Đạt' : 'Chưa đạt'}</strong>
                </div>
              </div>
              {!canSaveOfficially106 && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px]">
                  ⚠️ <strong>Chưa đủ điều kiện bắt buộc:</strong> Chỉ cho phép <em>Xem trước / Lưu nháp</em> hồ sơ chuẩn bị. Khóa quyền Lưu Đã lập ở bước 1.06 và bàn giao nhận phòng cho đến khi đủ tất cả 5 điều kiện (BR-UC.BG.03-04 &amp; 08).
                </div>
              )}
            </div>

            {/* Xem trước nội dung Biên bản bàn giao (Bản giấy chuẩn bị ngoài hệ thống - BR-UC.BG.03-01 & 09) */}
            <div className="p-5 border-2 border-slate-300 rounded-2xl bg-white shadow-xs space-y-4">
              <div className="text-center space-y-1 border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-900 text-sm uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                <p className="text-[11px] text-slate-600 font-medium">Độc lập - Tự do - Hạnh phúc</p>
                <h4 className="font-bold text-slate-900 text-base pt-2">BIÊN BẢN BÀN GIAO NHẬN PHÒNG &amp; TÀI SẢN</h4>
                <div className="flex justify-center items-center gap-3 text-[11px] font-mono text-slate-500">
                  <span>Số BB: <strong>{existingReport?.reportNumber || 'BB-' + selectedRoomCode.replace(/\D/g, '') + '-2026'}</strong></span>
                  <span>·</span>
                  <span>Mã HĐ: <strong>{targetContract?.id || 'HD-' + selectedRoomCode.replace(/\D/g, '') + '-2026'}</strong></span>
                  <span>·</span>
                  <span>Phiên bản nội dung: <strong>v{existingReport?.version || 1}</strong></span>
                </div>
              </div>

              {/* Bên giao và Bên nhận */}
              <div className="grid grid-cols-2 gap-4 text-[11px] p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">BÊN GIAO (Đại diện Quản lý/Chủ nhà):</span>
                  <div>Họ tên: <strong>{existingReport?.giverName || currentUser?.fullName || 'Nguyễn Văn An'}</strong></div>
                  <div>Điện thoại: <strong>0912 345 678</strong></div>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-1">BÊN NHẬN (Khách thuê phòng {selectedRoom.roomCode}):</span>
                  <div>Họ tên: <strong>{existingReport?.receiverName || selectedRoom.currentTenantName || 'Trần Văn Bình'}</strong></div>
                  <div>CCCD: <strong>001095012345</strong></div>
                </div>
              </div>

              {/* Chỉ số công tơ điện nước chỉ đọc từ 1.03 (BR-UC.BG.03-02 & 03) */}
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5 text-[11px]">
                <span className="font-bold text-slate-900 block">CHỈ SỐ CÔNG TƠ ĐIỆN NƯỚC CHỐT LÚC BÀN GIAO (BƯỚC 1.03 - CHỈ ĐỌC):</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>Mã ĐH Điện: <strong className="font-mono">{meterElecCode}</strong></div>
                  <div>Chỉ số điện: <strong className="font-mono text-amber-800">{meterElecKwh} kWh</strong></div>
                  <div>Mã ĐH Nước: <strong className="font-mono">{meterWaterCode}</strong></div>
                  <div>Chỉ số nước: <strong className="font-mono text-blue-800">{meterWaterM3} m³</strong></div>
                </div>
              </div>

              {/* Bảng danh sách tài sản */}
              <div>
                <span className="font-bold text-slate-900 block mb-1.5 text-[11px]">DANH MỤC TRANG THIẾT BỊ BÀN GIAO:</span>
                <table className="w-full text-left text-[11px] border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-1.5 border">Tên tài sản</th>
                      <th className="p-1.5 border">ĐVT</th>
                      <th className="p-1.5 border text-center">SL Thực nhận</th>
                      <th className="p-1.5 border">Tình trạng vật lý</th>
                      <th className="p-1.5 border">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryItems.map((itm) => (
                      <tr key={itm.id} className="border-b">
                        <td className="p-1.5 border font-medium">{itm.name}</td>
                        <td className="p-1.5 border">{itm.unit}</td>
                        <td className="p-1.5 border font-mono font-bold text-center">{itm.actualQuantity}</td>
                        <td className="p-1.5 border">{itm.physicalCondition}</td>
                        <td className="p-1.5 border text-slate-500">{itm.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vị trí chữ ký tay trên bản giấy (BR-UC.BG.03-01 & 06) */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 text-center text-[11px]">
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">ĐẠI DIỆN KHÁCH THUÊ</span>
                  <span className="text-slate-400 italic block">(Ký và ghi rõ họ tên trên bản giấy)</span>
                  <div className="h-16 flex items-center justify-center font-serif text-slate-600">
                    {existingReport?.tenantSignedPaper === 'Đã ký giấy' ? '✓ Đã ký bản giấy' : '[Chờ ký tay ngoài hệ thống]'}
                  </div>
                  <strong>{existingReport?.receiverName || selectedRoom.currentTenantName || 'Trần Văn Bình'}</strong>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">ĐẠI DIỆN CHỦ NHÀ / QUẢN LÝ</span>
                  <span className="text-slate-400 italic block">(Ký và ghi rõ họ tên trên bản giấy)</span>
                  <div className="h-16 flex items-center justify-center font-serif text-slate-600">
                    {existingReport?.ownerSignedPaper === 'Đã ký giấy' ? '✓ Đã ký bản giấy' : '[Chờ ký tay ngoài hệ thống]'}
                  </div>
                  <strong>{existingReport?.giverName || currentUser?.fullName || 'Nguyễn Văn An'}</strong>
                </div>
              </div>

              <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center text-[10px] text-slate-500">
                * Phần mềm không có nút In, Xuất để in hoặc ký điện tử. User chuẩn bị bản giấy ngoài hệ thống theo đúng mã và phiên bản trên (BR-UC.BG.03-06 &amp; 09).
              </div>
            </div>

            {/* Action Buttons for BG03 */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveTab('condition_bg02')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                &larr; Sửa hiện trạng (UC-BG02)
              </button>

              <div className="flex items-center gap-2">
                {/* Lưu nháp biên bản */}
                <button
                  onClick={() => {
                    const draft: HandoverReport = {
                      id: existingReport?.id || 'bb_' + selectedRoomCode.replace(/\D/g, ''),
                      reportNumber: existingReport?.reportNumber || 'BB-' + selectedRoomCode.replace(/\D/g, '') + '-2026',
                      roomCode: selectedRoomCode,
                      contractId: targetContract?.id || 'HD-' + selectedRoomCode.replace(/\D/g, '') + '-2026',
                      leaseId: targetContract?.leaseId || 'THUE-' + selectedRoomCode + '-L1',
                      date: new Date().toISOString().substring(0, 10),
                      giverName: currentUser?.fullName || 'Nguyễn Văn An',
                      receiverName: selectedRoom.currentTenantName || 'Trần Văn Bình',
                      status: 'Nháp',
                      tenantSignedPaper: 'Chưa ký',
                      ownerSignedPaper: 'Chưa ký',
                      version: (existingReport?.version || 1),
                      createdAt: new Date().toISOString(),
                      initialElectricityKwh: meterElecKwh,
                      initialWaterM3: meterWaterM3
                    };
                    saveHandoverReportBG03(draft);
                    showToast('info', 'Đã lưu nháp biên bản nhận phòng.');
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold cursor-pointer"
                >
                  Lưu nháp biên bản
                </button>

                {/* Bước 5: Lưu Đã lập (1.06) */}
                <button
                  disabled={!canSaveOfficially106}
                  onClick={() => {
                    if (!canSaveOfficially106) {
                      showToast('error', 'Chưa đủ điều kiện tiên quyết bắt buộc để Lưu Đã lập (1.06).');
                      return;
                    }
                    const officialReport: HandoverReport = {
                      id: existingReport?.id || 'bb_' + selectedRoomCode.replace(/\D/g, ''),
                      reportNumber: existingReport?.reportNumber || 'BB-' + selectedRoomCode.replace(/\D/g, '') + '-2026',
                      roomCode: selectedRoomCode,
                      contractId: targetContract?.id || 'HD-' + selectedRoomCode.replace(/\D/g, '') + '-2026',
                      leaseId: targetContract?.leaseId || 'THUE-' + selectedRoomCode + '-L1',
                      date: new Date().toISOString().substring(0, 10),
                      giverName: currentUser?.fullName || 'Nguyễn Văn An',
                      receiverName: selectedRoom.currentTenantName || 'Trần Văn Bình',
                      status: 'Đã lập',
                      tenantSignedPaper: existingReport?.tenantSignedPaper || 'Chưa ký',
                      ownerSignedPaper: existingReport?.ownerSignedPaper || 'Chưa ký',
                      version: (existingReport?.version || 1),
                      createdAt: new Date().toISOString(),
                      initialElectricityKwh: meterElecKwh,
                      initialWaterM3: meterWaterM3
                    };
                    saveHandoverReportBG03(officialReport);
                    showToast('success', 'Đã lưu biên bản nhận phòng ở trạng thái ĐÃ LẬP (Bước 1.06)! Sẵn sàng ký giấy ngoài hệ thống.');
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold cursor-pointer shadow-xs ${
                    canSaveOfficially106
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Lưu Đã lập (Bước 1.06)
                </button>

                {/* Ghi nhận kết quả ký giấy (Bước 7) */}
                <button
                  onClick={() => setShowSignPaperModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <FileSignature className="w-4 h-4" />
                  <span>Ghi nhận ký giấy (1.07 &amp; 1.08)</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          TAB 4: GHI NHẬN SỰ CỐ TÀI SẢN (UC-BG04)
      ========================================================================= */}
      {activeTab === 'incident_add_bg04' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">UC-BG04</span>
                <h2 className="text-sm font-bold text-slate-900">Ghi nhận sự cố &amp; Hư hỏng tài sản trong thời gian thuê</h2>
              </div>
              <p className="text-slate-500 mt-0.5">
                Chỉ ghi nhận thông tin tường thuật diễn biến thực tế do User cung cấp. KHÔNG xử lý thu tiền, không tạo khoản phải thu hay trừ cọc (BR-UC.BG.04-04 &rarr; 06).
              </p>
            </div>

            <button
              onClick={() => setActiveTab('incident_search_bg05')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Tra cứu lịch sử sự cố (UC-BG05)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cột trái: Thông tin cơ bản */}
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phạm vi sự cố <span className="text-red-500">*</span>
                </label>
                <select
                  value={incScope}
                  onChange={(e) => setIncScope(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Tài sản cụ thể">Tài sản cụ thể</option>
                  <option value="Hiện trạng chung">Hiện trạng chung của phòng</option>
                </select>
              </div>

              {incScope === 'Tài sản cụ thể' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tài sản liên quan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={incAsset}
                    onChange={(e) => setIncAsset(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    {standardAssets.map(a => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mô tả sự cố &amp; Diễn biến thực tế <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={incDesc}
                  onChange={(e) => setIncDesc(e.target.value)}
                  placeholder="Mô tả cụ thể hiện tượng hư hỏng, chập điện, vỡ kính, rò rỉ nước..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Xác định nguyên nhân/trách nhiệm</label>
                  <select
                    value={incRespStatus}
                    onChange={(e) => setIncRespStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    <option value="Chưa xác định">Chưa xác định</option>
                    <option value="Đã xác định">Đã xác định</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tình trạng xử lý</label>
                  <select
                    value={incProcessingStatus}
                    onChange={(e) => setIncProcessingStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    <option value="Chưa xử lý">Chưa xử lý</option>
                    <option value="Đang xử lý">Đang xử lý</option>
                    <option value="Đã xử lý">Đã xử lý</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nguyên nhân sơ bộ (nếu biết)</label>
                <input
                  type="text"
                  value={incCause}
                  onChange={(e) => setIncCause(e.target.value)}
                  placeholder="Ví dụ: Chập điện lưới, hao mòn tự nhiên, sơ suất của khách..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>

            {/* Cột phải: Phương án xử lý & Bằng chứng tham khảo */}
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phương án xử lý kỹ thuật</label>
                <input
                  type="text"
                  value={incSolutionPlan}
                  onChange={(e) => setIncSolutionPlan(e.target.value)}
                  placeholder="Ví dụ: Gọi thợ bảo trì thay tụ điện, thay vòi nước mới..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kết quả xử lý thực tế</label>
                <input
                  type="text"
                  value={incActualResult}
                  onChange={(e) => setIncActualResult(e.target.value)}
                  placeholder="Ví dụ: Đã sửa xong ngày 14/10/2026, thiết bị chạy êm..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              {/* Thông tin tham khảo tài chính (BR-UC.BG.04-05 & 08) */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 text-[11px]">Thông tin chi phí tham khảo:</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">
                    Do User cung cấp – chưa xác minh độc lập
                  </span>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Chi phí ước tính trao đổi (nếu có, đ):</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={incEstimatedCost}
                    onChange={(e) => setIncEstimatedCost(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono font-bold text-blue-700"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    * Không biến số tiền này thành khoản phải thu hay lệnh khấu trừ cọc (BR-04-05).
                  </span>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Ghi chú khách đã thanh toán ngoài (nếu có):</label>
                  <input
                    type="text"
                    value={incExternalPaymentNote}
                    onChange={(e) => setIncExternalPaymentNote(e.target.value)}
                    placeholder="Ví dụ: Khách đã tự trả tiền thợ 150.000đ trực tiếp..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>

              {/* URL video hoặc ảnh đính kèm */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Liên kết video kiểm chứng ngoài (nếu có)</label>
                <input
                  type="url"
                  value={incVideoUrl}
                  onChange={(e) => setIncVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                if (!incDesc.trim()) {
                  showToast('error', 'EF-01: Mô tả sự cố là trường bắt buộc.');
                  return;
                }
                const newIncident: AssetIncident = {
                  id: 'inc_' + Date.now(),
                  roomCode: selectedRoomCode,
                  leaseId: targetContract?.leaseId || 'THUE-' + selectedRoomCode + '-L1',
                  scope: incScope,
                  assetName: incScope === 'Tài sản cụ thể' ? incAsset : undefined,
                  occurredAt: new Date().toISOString(),
                  description: incDesc,
                  cause: incCause || 'Chưa xác định',
                  responsibilityStatus: incRespStatus,
                  responsibilityNote: incRespNote,
                  processingStatus: incProcessingStatus,
                  solutionPlan: incSolutionPlan,
                  actualResult: incActualResult,
                  estimatedCompensation: incEstimatedCost,
                  tenantPaidExternallyNote: incExternalPaymentNote ? incExternalPaymentNote + ' (Do User cung cấp – chưa xác minh độc lập)' : undefined,
                  photos: incPhotos,
                  videoUrl: incVideoUrl,
                  loggedBy: currentUser?.fullName || 'Chủ nhà',
                  loggedAt: new Date().toISOString()
                };
                recordIncidentBG04(newIncident);
                showToast('success', 'Đã lưu ghi nhận sự cố tài sản thành công (UC-BG04)!');
                setIncDesc('');
                setIncCause('');
                setIncSolutionPlan('');
                setIncActualResult('');
                setIncEstimatedCost(0);
                setIncExternalPaymentNote('');
              }}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
            >
              Lưu sự cố tài sản (Bước 4)
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: TRA CỨU LỊCH SỬ SỰ CỐ TÀI SẢN (UC-BG05)
      ========================================================================= */}
      {activeTab === 'incident_search_bg05' && (() => {
        // Filter incidents according to room and criteria (BR-UC.BG.05-01)
        const roomIncidents = incidents.filter(i => {
          if (i.roomCode !== selectedRoomCode) return false;
          if (bg05FilterAsset !== 'Tất cả' && i.assetName !== bg05FilterAsset) return false;
          if (bg05FilterStatus !== 'Tất cả' && i.processingStatus !== bg05FilterStatus) return false;
          if (bg05FilterStartDate && i.occurredAt < bg05FilterStartDate) return false;
          if (bg05FilterEndDate && i.occurredAt > bg05FilterEndDate) return false;
          if (bg05SearchKeyword) {
            const kw = bg05SearchKeyword.toLowerCase();
            const matchDesc = i.description.toLowerCase().includes(kw);
            const matchCause = i.cause?.toLowerCase().includes(kw);
            if (!matchDesc && !matchCause) return false;
          }
          return true;
        });

        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">UC-BG05</span>
                  <h2 className="text-sm font-bold text-slate-900">Tra cứu lịch sử sự cố tài sản: Phòng {selectedRoomCode}</h2>
                </div>
                <p className="text-slate-500 mt-0.5">
                  Tra cứu các sự cố đã phát sinh trong thời gian thuê để làm căn cứ đối chiếu khi trả phòng. Dữ liệu chỉ đọc (BR-UC.BG.05-02).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const stamp = `AUDIT-BG05-${selectedRoomCode}-${Date.now().toString().slice(-6)}`;
                    setBg05AuditStamp(stamp);
                    showToast('success', `Đã ghi nhận dấu tra cứu phiên đối chiếu: ${stamp} (BR-UC.BG.05-05)`);
                  }}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Gắn dấu tra cứu BG06/BG07 (BR-05-05)</span>
                </button>
              </div>
            </div>

            {/* Filter Bar (Giao diện mục 2) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Tài sản:</span>
                <select
                  value={bg05FilterAsset}
                  onChange={(e) => setBg05FilterAsset(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="Tất cả">Tất cả tài sản</option>
                  {standardAssets.map(a => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Trạng thái:</span>
                <select
                  value={bg05FilterStatus}
                  onChange={(e) => setBg05FilterStatus(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="Tất cả">Tất cả trạng thái</option>
                  <option value="Chưa xử lý">Chưa xử lý</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Đã xử lý">Đã xử lý</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Từ ngày:</span>
                <input
                  type="date"
                  value={bg05FilterStartDate}
                  onChange={(e) => setBg05FilterStartDate(e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                />
                <span className="font-semibold text-slate-700">Đến:</span>
                <input
                  type="date"
                  value={bg05FilterEndDate}
                  onChange={(e) => setBg05FilterEndDate(e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                />
              </div>

              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Tìm theo mô tả / nguyên nhân..."
                  value={bg05SearchKeyword}
                  onChange={(e) => setBg05SearchKeyword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>

              {(bg05FilterAsset !== 'Tất cả' || bg05FilterStatus !== 'Tất cả' || bg05FilterStartDate || bg05FilterEndDate || bg05SearchKeyword) && (
                <button
                  onClick={() => {
                    setBg05FilterAsset('Tất cả');
                    setBg05FilterStatus('Tất cả');
                    setBg05FilterStartDate('');
                    setBg05FilterEndDate('');
                    setBg05SearchKeyword('');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Bảng danh sách sự cố (Giao diện mục 3) */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Thời điểm</th>
                    <th className="py-2.5 px-3">Tài sản / Phạm vi</th>
                    <th className="py-2.5 px-3">Mô tả sự cố</th>
                    <th className="py-2.5 px-3">Nguyên nhân</th>
                    <th className="py-2.5 px-3">Tình trạng xử lý</th>
                    <th className="py-2.5 px-3">Chi phí tham khảo</th>
                    <th className="py-2.5 px-3 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {roomIncidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {inc.occurredAt.replace('T', ' ').substring(0, 16)}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {inc.assetName || inc.scope}
                      </td>
                      <td className="py-2.5 px-3 max-w-[240px] truncate text-slate-700" title={inc.description}>
                        {inc.description}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{inc.cause || 'Chưa rõ'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.processingStatus === 'Đã xử lý' ? 'bg-emerald-100 text-emerald-800' :
                          inc.processingStatus === 'Đang xử lý' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {inc.processingStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {inc.estimatedCompensation ? inc.estimatedCompensation.toLocaleString('vi-VN') + ' đ' : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedIncidentDetail(inc)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold cursor-pointer"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                  {roomIncidents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        Không có sự cố nào phù hợp với bộ lọc trong phòng {selectedRoomCode}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal xem chi tiết sự cố (Giao diện mục 4) */}
            {selectedIncidentDetail && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="w-5 h-5 text-amber-600" />
                      <h3 className="font-bold text-slate-900 text-sm">
                        Chi tiết sự cố: {selectedIncidentDetail.assetName || selectedIncidentDetail.scope}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedIncidentDetail(null)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2 text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div>Thời điểm phát sinh: <strong className="font-mono">{selectedIncidentDetail.occurredAt.replace('T', ' ')}</strong></div>
                    <div>Phòng / Lần thuê: <strong className="font-mono">{selectedIncidentDetail.roomCode} ({selectedIncidentDetail.leaseId})</strong></div>
                    <div>Mô tả: <p className="font-medium text-slate-900 mt-0.5">{selectedIncidentDetail.description}</p></div>
                    <div>Nguyên nhân: <strong>{selectedIncidentDetail.cause}</strong></div>
                    <div>Trách nhiệm: <strong>{selectedIncidentDetail.responsibilityStatus}</strong> {selectedIncidentDetail.responsibilityNote ? `(${selectedIncidentDetail.responsibilityNote})` : ''}</div>
                    <div>Phương án xử lý: <strong>{selectedIncidentDetail.solutionPlan || 'Chưa cập nhật'}</strong></div>
                    <div>Kết quả thực tế: <strong>{selectedIncidentDetail.actualResult || 'Đang theo dõi'}</strong></div>
                    {selectedIncidentDetail.estimatedCompensation ? (
                      <div>Chi phí tham khảo: <strong className="font-mono text-blue-700">{selectedIncidentDetail.estimatedCompensation.toLocaleString('vi-VN')} đ</strong> (Do User cung cấp – chưa xác minh độc lập)</div>
                    ) : null}
                    {selectedIncidentDetail.tenantPaidExternallyNote && (
                      <div className="p-2 bg-amber-100/60 rounded text-amber-900 font-medium">
                        {selectedIncidentDetail.tenantPaidExternallyNote}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                      Người ghi nhận: {selectedIncidentDetail.loggedBy} · Lúc: {selectedIncidentDetail.loggedAt.replace('T', ' ')}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => {
                        setSelectedIncidentDetail(null);
                        setActiveTab('compare_bg06');
                      }}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-semibold cursor-pointer"
                    >
                      &larr; Quay lại đối chiếu (UC-BG06)
                    </button>
                    <button
                      onClick={() => setSelectedIncidentDetail(null)}
                      className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-medium cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* =========================================================================
          TAB 6: ĐỐI CHIẾU TÀI SẢN KHI TRẢ PHÒNG (UC-BG06)
      ========================================================================= */}
      {activeTab === 'compare_bg06' && (() => {
        // Evaluate Prerequisites for UC-BG06
        const step305Confirmed = Boolean(returnInspectionTarget?.step305Confirmed);
        const reportConfirmedBG03 = Boolean(existingReport && existingReport.status === 'Đã xác nhận');

        const canPerformOfficialComparison = step305Confirmed && reportConfirmedBG03;

        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">UC-BG06</span>
                  <h2 className="text-sm font-bold text-slate-900">Đối chiếu tài sản khi trả phòng: {selectedRoomCode}</h2>
                </div>
                <p className="text-slate-500 mt-0.5">
                  So sánh tài sản thực tế lúc khách trả phòng với biên bản nhận phòng BG03 đã ký để phát hiện thiếu hụt, hư hỏng hoặc khác biệt.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('incident_search_bg05')}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Xem lịch sử sự cố (UC-BG05)</span>
                </button>
              </div>
            </div>

            {/* Thông tin đầu trang & Điều kiện tiên quyết (Giao diện mục 2 & 7) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-700">
              <div>
                <span className="text-slate-500 block text-[11px]">Mã phòng / Lần thuê:</span>
                <strong className="font-mono text-slate-900">{selectedRoom.roomCode} ({selectedRoom.currentLeaseId || 'THUE-' + selectedRoom.roomCode})</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Biên bản nhận phòng BG03:</span>
                <span className={`font-semibold ${reportConfirmedBG03 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {existingReport?.reportNumber || 'Chưa có'} · {reportConfirmedBG03 ? 'Đã xác nhận' : 'Chưa đủ chữ ký'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Xác nhận nhận lại 3.05 (BG09):</span>
                <span className={`font-semibold ${step305Confirmed ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {step305Confirmed ? 'Đã xác nhận nhận lại' : 'Chưa xác nhận 3.05'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Điện / Nước lúc nhận (BG03):</span>
                <span className="font-mono font-bold text-slate-800">
                  {existingReport?.initialElectricityKwh || 1250} kWh · {existingReport?.initialWaterM3 || 45} m³
                </span>
              </div>
            </div>

            {/* Warning if 3.05 or BG03 unconfirmed */}
            {!canPerformOfficialComparison && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Điều kiện đối chiếu chính thức chưa đạt (BR-UC.BG.06-08 &amp; 09):</span>
                </div>
                <p>
                  Theo sơ đồ quy trình, đối chiếu chính thức chỉ được bắt đầu sau khi <strong>Chủ nhà xác nhận Đã nhận lại tại BG09/3.05</strong> và <strong>Biên bản nhận phòng BG03 đã được hai bên ký tay (Đã xác nhận)</strong>.
                  {!step305Confirmed && ' Hiện tại phòng chưa hoàn tất xác nhận 3.05.'}
                  {!reportConfirmedBG03 && ' Biên bản nhận phòng BG03 chưa có đủ 2 chữ ký tay xác nhận.'}
                  {' '}Hệ thống chỉ cho phép xem/kiểm tra sơ bộ, <strong>khóa nút Lưu đối chiếu hoàn tất</strong>.
                </p>
              </div>
            )}

            {/* Comparison Table (Giao diện mục 3) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Bảng đối chiếu tình trạng tài sản nhận &amp; trả (Comparison Table):
                </span>
                <button
                  onClick={() => {
                    // Populate comparison items from inventory and return inspection
                    const items = inventoryItems.map(itm => {
                      const retItm = returnInspectionTarget?.items.find(r => r.name === itm.name);
                      const qtyReturn = retItm ? retItm.quantity : itm.actualQuantity;
                      const condReturn = retItm ? retItm.condition : itm.physicalCondition;
                      const isMatch = itm.actualQuantity === qtyReturn && itm.physicalCondition === condReturn;
                      return {
                        assetName: itm.name,
                        qtyReceive: itm.actualQuantity,
                        qtyReturn,
                        condReceive: itm.physicalCondition,
                        condReturn,
                        diffResult: isMatch ? ('Đúng như bàn giao' as const) : ('Khác biệt' as const),
                        diffNote: isMatch ? 'Số lượng và tình trạng khớp với biên bản nhận phòng' : 'Có chênh lệch cần kiểm tra'
                      };
                    });
                    setComparisonItems(items);
                    showToast('success', 'Đã tự động lấy dữ liệu và so sánh với biên bản nhận phòng BG03!');
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>So sánh với biên bản nhận phòng</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                      <th className="py-2.5 px-3">Tài sản / Thiết bị</th>
                      <th className="py-2.5 px-3 text-center">SL Nhận</th>
                      <th className="py-2.5 px-3 text-center">SL Trả</th>
                      <th className="py-2.5 px-3">Tình trạng lúc nhận</th>
                      <th className="py-2.5 px-3">Tình trạng lúc trả</th>
                      <th className="py-2.5 px-3">Kết quả đối chiếu</th>
                      <th className="py-2.5 px-3">Ghi chú chênh lệch / Bằng chứng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {(comparisonItems.length > 0 ? comparisonItems : inventoryItems.map(itm => ({
                      assetName: itm.name,
                      qtyReceive: itm.actualQuantity,
                      qtyReturn: itm.actualQuantity,
                      condReceive: itm.physicalCondition,
                      condReturn: itm.physicalCondition,
                      diffResult: 'Đúng như bàn giao' as const,
                      diffNote: 'Khớp biên bản nhận'
                    }))).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{row.assetName}</td>
                        <td className="py-2.5 px-3 font-mono text-center">{row.qtyReceive}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-center text-blue-700">{row.qtyReturn}</td>
                        <td className="py-2.5 px-3 text-slate-600">{row.condReceive}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{row.condReturn}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            row.diffResult === 'Đúng như bàn giao' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {row.diffResult}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {row.diffNote}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quy tắc không tự phạt tiền (BR-UC.BG.06-03 & 04) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px]">
              * <strong>Quy tắc BR-UC.BG.06-03 &amp; 04:</strong> Phát hiện chênh lệch tài sản không tự xác định khách có trách nhiệm hoặc tự tính chi phí bồi thường; đối chiếu tài sản không làm thay đổi trạng thái sử dụng phòng. Việc giải quyết chênh lệch được thực hiện tại UC-BG07.
            </div>

            {/* Footer Buttons (Giao diện mục 4) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveTab('handover_bg03')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                &larr; Xem lại biên bản nhận BG03
              </button>

              <div className="flex items-center gap-2">
                <button
                  disabled={!canPerformOfficialComparison}
                  onClick={() => {
                    if (!canPerformOfficialComparison) {
                      showToast('error', 'Chưa đủ điều kiện 3.05 và BG03 Đã xác nhận để lưu đối chiếu hoàn tất.');
                      return;
                    }
                    const hasDiff = comparisonItems.some(i => i.diffResult === 'Khác biệt');
                    const compResult: AssetComparisonResult = {
                      id: 'comp_' + selectedRoomCode.replace(/\D/g, '') + '_' + Date.now().toString().slice(-4),
                      roomCode: selectedRoomCode,
                      leaseId: targetContract?.leaseId || 'THUE-' + selectedRoomCode + '-L1',
                      hasDifference: hasDiff,
                      hasPendingWork: hasDiff,
                      pendingWorkNote: hasDiff ? 'Có chênh lệch tài sản cần thống nhất giải quyết tại UC-BG07' : 'Tất cả tài sản đúng như bàn giao ban đầu',
                      tenantFeedbackStatus: 'Đã phản hồi',
                      unanimousStatus: hasDiff ? 'Chưa thống nhất' : 'Đã thống nhất',
                      transferredToSettlement318: false,
                      loggedAt: new Date().toISOString()
                    };
                    saveAssetComparisonResultBG07(compResult);
                    showToast('success', 'Đã lưu kết quả đối chiếu tài sản thành công (UC-BG06)!');
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold cursor-pointer shadow-xs ${
                    canPerformOfficialComparison
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Lưu kết quả đối chiếu (Bước 3)
                </button>

                <button
                  onClick={() => {
                    showToast('info', 'Chuyển sang UC-BG07 để ghi nhận kết quả xử lý chênh lệch và thống nhất bồi thường.');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Xử lý chênh lệch (UC-BG07)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          MODAL: BỔ SUNG TÀI SẢN VÀO DANH SÁCH KIỂM KÊ (AF-01 / UC-BG01)
      ========================================================================= */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Bổ sung tài sản vào danh sách kiểm kê (AF-01)</h3>
              </div>
              <button
                onClick={() => setShowAddAssetModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên tài sản / Thiết bị phát hiện <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  placeholder="Ví dụ: Bình nóng lạnh Ariston 20L..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    value={newAssetUnit}
                    onChange={(e) => setNewAssetUnit(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số lượng thực tế</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={newAssetQty}
                    onChange={(e) => setNewAssetQty(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tình trạng vật lý ban đầu</label>
                <select
                  value={newAssetCondition}
                  onChange={(e) => setNewAssetCondition(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Bình thường">Bình thường</option>
                  <option value="Hư hỏng">Hư hỏng</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú nguồn gốc phát hiện</label>
                <input
                  type="text"
                  value={newAssetNote}
                  onChange={(e) => setNewAssetNote(e.target.value)}
                  placeholder="Ví dụ: Thiết bị do chủ nhà trang bị thêm tháng trước..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddAssetModal(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!newAssetName.trim()) {
                    showToast('error', 'Vui lòng nhập tên tài sản.');
                    return;
                  }
                  const newItem: RoomAssetItem = {
                    id: 'inv_custom_' + Date.now(),
                    assetId: 'ast_custom_' + Date.now(),
                    name: newAssetName.trim(),
                    unit: newAssetUnit.trim() || 'Cái',
                    standardQuantity: newAssetQty,
                    actualQuantity: newAssetQty,
                    quantityDiff: 'Đủ',
                    physicalCondition: newAssetCondition,
                    notes: newAssetNote ? newAssetNote + ' (Bổ sung tại AF-01)' : 'Bổ sung khi kiểm kê'
                  };
                  setInventoryItems(prev => [...prev, newItem]);
                  showToast('success', `Đã bổ sung tài sản "${newAssetName}" vào danh sách kiểm kê phòng ${selectedRoomCode}!`);
                  setShowAddAssetModal(false);
                  setNewAssetName('');
                  setNewAssetNote('');
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Thêm vào danh sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: LIÊN KẾT HỢP ĐỒNG / LẦN THUÊ (BR-UC.BG.01-05 & 07)
      ========================================================================= */}
      {showLinkContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Liên kết Hợp đồng / Lần thuê thực tế</h3>
              </div>
              <button
                onClick={() => setShowLinkContractModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600">
              Chọn hợp đồng thuê tương ứng của phòng <strong>{selectedRoomCode}</strong> để chuyển trạng thái từ <em>Chưa liên kết</em> sang <em>Đã liên kết</em>.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hợp đồng thuê phòng {selectedRoomCode}</label>
              <select
                value={linkContractId}
                onChange={(e) => setLinkContractId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-800"
              >
                {contracts.filter(c => c.roomCode === selectedRoomCode).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.tenantName} ({c.status})
                  </option>
                ))}
                {contracts.filter(c => c.roomCode === selectedRoomCode).length === 0 && (
                  <option value="">Không có hợp đồng nào thuộc phòng {selectedRoomCode}</option>
                )}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowLinkContractModal(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const target = contracts.find(c => c.id === linkContractId);
                  if (!target) {
                    showToast('error', 'Vui lòng chọn một hợp đồng hợp lệ.');
                    return;
                  }
                  const updatedRec: InventoryRecord = {
                    id: existingInventory?.id || 'inv_' + selectedRoomCode.replace(/\D/g, '') + '_' + Date.now().toString().slice(-4),
                    roomCode: selectedRoomCode,
                    expectedBatchCode: existingInventory?.expectedBatchCode || 'DOT-2026-K10',
                    version: existingInventory?.version || 1,
                    inventoryStatus: existingInventory?.inventoryStatus || 'Đã hoàn tất',
                    linkStatus: 'Đã liên kết',
                    linkedContractId: target.id,
                    linkedLeaseId: target.leaseId,
                    items: inventoryItems,
                    completedAt: existingInventory?.completedAt || new Date().toISOString(),
                    completedBy: currentUser?.fullName || 'Chủ nhà'
                  };
                  saveInventoryBG01(updatedRec);
                  showToast('success', `Đã liên kết hồ sơ kiểm kê với Hợp đồng ${target.id} thành công!`);
                  setShowLinkContractModal(false);
                }}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Xác nhận liên kết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: GHI NHẬN KẾT QUẢ KÝ GIẤY BIÊN BẢN NHẬN PHÒNG (1.07 & 1.08 / BG03)
      ========================================================================= */}
      {showSignPaperModal && existingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Ghi nhận kết quả ký giấy hai bên (Bước 1.07 &amp; 1.08)</h3>
              </div>
              <button
                onClick={() => setShowSignPaperModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600">
              Ghi nhận kết quả ký tay ngoài hệ thống của Khách thuê và Chủ nhà trên bản giấy <strong>{existingReport.reportNumber} (v{existingReport.version})</strong>.
            </p>

            <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 block">1. Khách thuê đã ký tay (Bước 1.07):</span>
                  <span className="text-[11px] text-slate-500">{existingReport.receiverName}</span>
                </div>
                <input
                  type="checkbox"
                  checked={signPaperTenant}
                  onChange={(e) => setSignPaperTenant(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 block">2. Chủ nhà/Quản lý đã ký tay (Bước 1.08):</span>
                  <span className="text-[11px] text-slate-500">{existingReport.giverName}</span>
                </div>
                <input
                  type="checkbox"
                  checked={signPaperOwner}
                  onChange={(e) => setSignPaperOwner(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nơi lưu trữ bản giấy chính thức <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={paperLocation}
                  onChange={(e) => setPaperLocation(e.target.value)}
                  placeholder="Ví dụ: Tủ hồ sơ Tầng 1 - Kẹp P101..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tệp ảnh/scan bản giấy đã ký (tùy chọn)</label>
                <input
                  type="text"
                  value={signedDocumentScanUrl}
                  onChange={(e) => setSignedDocumentScanUrl(e.target.value)}
                  placeholder="https://... hoặc mã lưu trữ tệp scan"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono text-[11px]"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Không bắt buộc tải scan; bản giấy vẫn là chứng cứ gốc (BR-UC.BG.03-11).</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowSignPaperModal(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  confirmHandoverSignaturesBG03(existingReport.id, signPaperTenant, signPaperOwner, paperLocation);
                  if (signPaperTenant && signPaperOwner) {
                    showToast('success', 'Đã ghi nhận cả 2 bên đã ký tay! Biên bản chuyển sang trạng thái ĐÃ XÁC NHẬN (BR-UC.BG.03-12).');
                  } else {
                    showToast('info', 'Đã cập nhật tình trạng ký tay từng bên. Biên bản giữ trạng thái Đã lập cho đến khi cả hai bên đều ký.');
                  }
                  setShowSignPaperModal(false);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Lưu kết quả ký giấy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
