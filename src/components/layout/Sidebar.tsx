import React from 'react';
import {
  Settings,
  Home,
  PackageCheck,
  Users,
  FileText,
  Scale,
  Calculator,
  QrCode,
  CreditCard,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

export type NavTabKey =
  | 'config'
  | 'rooms'
  | 'handover'
  | 'tenants'
  | 'contracts'
  | 'settlement'
  | 'billing'
  | 'notices'
  | 'receipts'
  | 'debts'
  | 'reports';

interface SidebarProps {
  currentTab: NavTabKey;
  onSelectTab: (tab: NavTabKey) => void;
}

interface NavItem {
  key: NavTabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'rooms',
    label: 'Tình trạng phòng',
    icon: Home,
    description: 'Danh sách phòng, nhận/trả phòng & kế hoạch trả'
  },
  {
    key: 'handover',
    label: 'Bàn giao & Tài sản',
    icon: PackageCheck,
    description: 'Kiểm kê đồ dùng, biên bản nhận/trả & xử lý sự cố'
  },
  {
    key: 'tenants',
    label: 'Hồ sơ khách thuê',
    icon: Users,
    description: 'Danh sách khách chính, người ở cùng & cư trú'
  },
  {
    key: 'contracts',
    label: 'Hợp đồng thuê',
    icon: FileText,
    description: 'Hợp đồng thuê căn hộ, gia hạn & theo dõi thời hạn'
  },
  {
    key: 'billing',
    label: 'Tính tiền điện nước',
    icon: Calculator,
    description: 'Chỉ số điện nước & bảng tính tiền dịch vụ theo kỳ'
  },
  {
    key: 'notices',
    label: 'Thông báo & QR (QT07)',
    icon: QrCode,
    description: 'Đối chiếu khoản phải thu (UC07.1), lập thông báo QR (UC07.2) & chia sẻ Zalo (UC07.3)'
  },
  {
    key: 'receipts',
    label: 'Thu tiền phòng (QT08)',
    icon: CreditCard,
    description: 'Theo dõi thanh toán (UC08.1) & đối soát chuyển khoản ngân hàng (UC08.2)'
  },
  {
    key: 'debts',
    label: 'Quản lý công nợ',
    icon: AlertTriangle,
    description: 'Theo dõi tiền nợ quá hạn, nhắc nợ & hẹn thanh toán'
  },
  {
    key: 'settlement',
    label: 'Quyết toán tiền cọc',
    icon: Scale,
    description: 'Khấu trừ công nợ, đối chiếu tài sản & hoàn trả cọc'
  },
  {
    key: 'reports',
    label: 'Báo cáo thống kê',
    icon: BarChart3,
    description: 'Tỷ lệ lấp đầy phòng, doanh thu & đối soát quản trị'
  },
  {
    key: 'config',
    label: 'Cấu hình & Bảng giá',
    icon: Settings,
    description: 'Đơn giá điện nước, danh mục phí & tài khoản nhận tiền'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-57px)] sticky top-[57px]">
      <div className="p-3 border-b border-slate-100 bg-slate-50">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
          Danh mục nghiệp vụ quản lý
        </span>
      </div>

      <nav className="p-2 space-y-1 overflow-y-auto flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer group ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-700'}`}
            >
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'}`} />
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                  {item.label}
                </div>
                <div className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 space-y-0.5">
        <div className="font-semibold text-slate-700">Chung cư mini An Bình</div>
        <div>25 Ngõ 198 Xã Đàn, Đống Đa, Hà Nội</div>
        <div className="text-[10px] text-slate-400">Phiên bản Vận hành Toàn diện</div>
      </div>
    </aside>
  );
};
