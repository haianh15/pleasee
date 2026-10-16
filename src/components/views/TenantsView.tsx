import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tenant, CoTenant } from '../../types';
import {
  Users, UserPlus, Search, ShieldCheck, History, CheckCircle2,
  AlertCircle, Edit, FileText, ArrowRight, UserCheck, Plus, X
} from 'lucide-react';

export const TenantsView: React.FC = () => {
  const {
    tenants,
    coTenants,
    tenantHistory,
    addTenantHSKT01,
    addCoTenantHSKT02,
    updateCoTenantStatusHSKT02,
    applyTenantUpdateHSKT04
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tenants' | 'co_tenants' | 'history'>('tenants');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');

  // New tenant modal
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');
  const [paperStatus, setPaperStatus] = useState<'Đã cung cấp' | 'Chưa cung cấp'>('Đã cung cấp');
  const [verifyStatus, setVerifyStatus] = useState<'Chưa xác minh' | 'Đã xác minh hợp lệ' | 'Không hợp lệ'>('Đã xác minh hợp lệ');
  const [notes, setNotes] = useState('');
  const [tenantMsg, setTenantMsg] = useState<string | null>(null);

  // New co-tenant modal
  const [showAddCoTenant, setShowAddCoTenant] = useState(false);
  const [parentTenantId, setParentTenantId] = useState(tenants[0]?.id || '');
  const [coName, setCoName] = useState('');
  const [coIdNumber, setCoIdNumber] = useState('');
  const [coRel, setCoRel] = useState('Vợ/Chồng');

  // Selected tenant for detail
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredTenants = tenants.filter(t =>
    t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phoneNumber.includes(searchTerm) ||
    (t.idNumber && t.idNumber.includes(searchTerm))
  );

  const handleAddTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTenantMsg(null);
    if (!fullName.trim() || !phone.trim()) {
      setTenantMsg('Họ tên và Số điện thoại là trường bắt buộc.');
      return;
    }
    const res = addTenantHSKT01({
      fullName: fullName.trim(),
      phoneNumber: phone.trim(),
      idNumber: idNumber.trim() || undefined,
      address: address.trim() || undefined,
      paperStatus,
      verificationStatus: verifyStatus,
      notes: notes.trim() || undefined
    });

    if (!res.success) {
      setTenantMsg(res.message);
    } else {
      setShowAddTenant(false);
      setFullName('');
      setPhone('');
      setIdNumber('');
      setAddress('');
      alert(res.message);
    }
  };

  const handleAddCoTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coName.trim()) return;

    addCoTenantHSKT02({
      tenantId: parentTenantId,
      fullName: coName.trim(),
      idNumber: coIdNumber.trim() || undefined,
      relationship: coRel,
      status: 'Đang cư trú',
      actualArrivalDate: new Date().toISOString().split('T')[0],
      arrivalVerificationEvidence: 'Đã xuất trình giấy tờ cư trú xác minh'
    });

    setShowAddCoTenant(false);
    setCoName('');
    setCoIdNumber('');
    alert('Thêm người ở cùng thành công!');
  };

  const handleEditTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    applyTenantUpdateHSKT04(selectedTenant.id, {
      fullName: editFullName,
      phoneNumber: editPhone,
      address: editAddress
    });

    setShowEditModal(false);
    alert('Cập nhật hồ sơ khách thuê thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Quản lý Hồ sơ Khách thuê</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý hồ sơ khách chính, người ở cùng (cư trú), kiểm tra định danh và tra cứu lịch sử thuê phòng.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs shrink-0">
          <button
            onClick={() => setActiveTab('tenants')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'tenants' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Hồ sơ khách thuê
          </button>
          <button
            onClick={() => setActiveTab('co_tenants')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'co_tenants' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Người ở cùng
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Lịch sử hồ sơ
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: TENANTS LIST ==================== */}
      {activeTab === 'tenants' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo họ tên, số điện thoại hoặc số CCCD..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                setTenantMsg(null);
                setShowAddTenant(true);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Thêm hồ sơ khách thuê
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Mã hồ sơ</th>
                    <th className="py-2.5 px-3">Họ và tên</th>
                    <th className="py-2.5 px-3">Số điện thoại</th>
                    <th className="py-2.5 px-3">Số CCCD / Định danh</th>
                    <th className="py-2.5 px-3">Quê quán / Địa chỉ</th>
                    <th className="py-2.5 px-3">Trạng thái giấy tờ</th>
                    <th className="py-2.5 px-3">Xác minh định danh</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{t.id}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{t.fullName}</td>
                      <td className="py-2.5 px-3 font-mono">{t.phoneNumber}</td>
                      <td className="py-2.5 px-3 font-mono">{t.idNumber || <span className="text-slate-400 italic">Chưa cấp</span>}</td>
                      <td className="py-2.5 px-3 text-slate-600">{t.address || '—'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${t.paperStatus === 'Đã cung cấp' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {t.paperStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${t.verificationStatus === 'Đã xác minh hợp lệ' ? 'bg-emerald-100 text-emerald-800' : t.verificationStatus === 'Không hợp lệ' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                          {t.verificationStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1">
                        <button
                          onClick={() => {
                            setSelectedTenant(t);
                            setEditFullName(t.fullName);
                            setEditPhone(t.phoneNumber);
                            setEditAddress(t.address || '');
                            setShowEditModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold cursor-pointer"
                        >
                          Cập nhật
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

      {/* ==================== TAB 2: CO-TENANTS ==================== */}
      {activeTab === 'co_tenants' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Quản lý người ở cùng</h2>
              <p className="text-xs text-slate-500">
                Theo dõi tình trạng cư trú: Nháp / Dự kiến / Đang cư trú / Đã kết thúc. Người ở cùng không có hóa đơn riêng.
              </p>
            </div>
            <button
              onClick={() => setShowAddCoTenant(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm người ở cùng
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Phòng cư trú</th>
                  <th className="py-2.5 px-3">Khách chính đại diện</th>
                  <th className="py-2.5 px-3">Mối quan hệ</th>
                  <th className="py-2.5 px-3">Số định danh</th>
                  <th className="py-2.5 px-3">Ngày đến thực tế</th>
                  <th className="py-2.5 px-3">Trạng thái cư trú</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coTenants.map((c) => {
                  const parentTenant = tenants.find(t => t.id === c.tenantId);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{c.fullName}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">{c.roomCode || 'Chưa gán'}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{parentTenant?.fullName || c.tenantId}</td>
                      <td className="py-2.5 px-3 text-slate-600">{c.relationship}</td>
                      <td className="py-2.5 px-3 font-mono">{c.idNumber || '—'}</td>
                      <td className="py-2.5 px-3 font-mono">{c.actualArrivalDate || '—'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${c.status === 'Đang cư trú' ? 'bg-emerald-100 text-emerald-800' : c.status === 'Đã kết thúc' ? 'bg-slate-200 text-slate-700' : 'bg-blue-100 text-blue-800'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {c.status === 'Đang cư trú' ? (
                          <button
                            onClick={() => {
                              updateCoTenantStatusHSKT02(c.id, 'Đã kết thúc');
                              alert(`Đã kết thúc cư trú cho ${c.fullName}`);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium cursor-pointer"
                          >
                            Kết thúc cư trú
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">Đã kết thúc</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: HISTORY ==================== */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Lịch sử hồ sơ khách thuê</h2>
              <p className="text-xs text-slate-500">Tra cứu lịch sử biến động, thay đổi thông tin và các lần cư trú của khách.</p>
            </div>
          </div>

          <div className="space-y-2">
            {tenantHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">Chưa có bản ghi lịch sử biến động nào.</p>
            ) : (
              tenantHistory.map((h) => (
                <div key={h.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span className="font-semibold text-slate-800">{h.action} (Hồ sơ: {h.tenantId})</span>
                    <span className="font-mono">{new Date(h.timestamp).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="text-slate-600 font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                    {h.newValues}
                  </div>
                  <div className="text-[11px] text-slate-400 text-right">Thực hiện bởi: {h.performedBy}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD TENANT ==================== */}
      {showAddTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Ghi nhận hồ sơ khách thuê</h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Họ và tên khách thuê <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Hoàng Văn Nam"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Số CCCD / Định danh
                </label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="001..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Địa chỉ / Quê quán</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Xã, Huyện, Tỉnh..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tình trạng giấy tờ</label>
                <select
                  value={paperStatus}
                  onChange={(e) => setPaperStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="Đã cung cấp">Đã cung cấp</option>
                  <option value="Chưa cung cấp">Chưa cung cấp</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Xác minh định danh</label>
                <select
                  value={verifyStatus}
                  onChange={(e) => setVerifyStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="Đã xác minh hợp lệ">Đã xác minh hợp lệ</option>
                  <option value="Chưa xác minh">Chưa xác minh</option>
                  <option value="Không hợp lệ">Không hợp lệ</option>
                </select>
              </div>
            </div>

            {tenantMsg && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {tenantMsg}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddTenant(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddTenantSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Xác nhận tạo hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD CO-TENANT ==================== */}
      {showAddCoTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Thêm người ở cùng</h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Khách chính đại diện</label>
              <select
                value={parentTenantId}
                onChange={(e) => setParentTenantId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.fullName} ({t.phoneNumber})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Họ và tên người ở cùng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={coName}
                onChange={(e) => setCoName(e.target.value)}
                placeholder="Nhập họ và tên"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số định danh / CCCD</label>
                <input
                  type="text"
                  value={coIdNumber}
                  onChange={(e) => setCoIdNumber(e.target.value)}
                  placeholder="CCCD hoặc số khai sinh"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quan hệ với khách chính</label>
                <select
                  value={coRel}
                  onChange={(e) => setCoRel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="Vợ/Chồng">Vợ/Chồng</option>
                  <option value="Con">Con</option>
                  <option value="Bố/Mẹ">Bố/Mẹ</option>
                  <option value="Anh/Chị/Em">Anh/Chị/Em</option>
                  <option value="Bạn cùng phòng">Bạn cùng phòng</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddCoTenant(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddCoTenantSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Lưu người ở cùng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: EDIT TENANT ==================== */}
      {showEditModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Cập nhật hồ sơ khách thuê</h3>
            <p className="text-[11px] text-slate-500">
              Cập nhật thông tin định danh và địa chỉ liên lạc của khách thuê.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Họ và tên</label>
              <input
                type="text"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Địa chỉ</label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleEditTenantSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Lưu thay đổi (HSKT-04)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
