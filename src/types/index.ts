/**
 * Bộ định nghĩa kiểu dữ liệu hoàn chỉnh cho Hệ thống Quản lý Chung cư Mini
 * Đáp ứng đầy đủ Mục 0 và Quy trình 01 đến 10 theo đặc tả
 */

// ==================== MỤC 0: TÀI KHOẢN & BẢO MẬT ====================
export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string; // Email khôi phục đã xác minh
  role: 'Chủ nhà' | 'Quản lý';
  mustChangePasswordFirstLogin: boolean;
  failedLoginAttempts: number;
  lockUntil: number | null; // Timestamp tạm khóa 15 phút sau 5 lần sai
  failedChangePasswordAttempts: number;
  changePasswordLockUntil: number | null; // Timestamp tạm ngừng đổi mật khẩu 15 phút sau 5 lần sai
  authVersion: number; // Phiên bản xác thực
  passwordHash: string;
}

export interface AuthSession {
  sessionId: string;
  userId: string;
  username: string;
  role: 'Chủ nhà' | 'Quản lý';
  type: 'temp_change_password' | 'admin';
  expiresAt: number; // 30 phút không hoạt động
  createdAt: number;
}

export interface PasswordResetToken {
  token: string;
  email: string;
  authVersionAtIssue: number;
  expiresAt: number; // 15 phút
  used: boolean;
  createdAt: number;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  details: string;
  ipAddress?: string;
}

// ==================== MỤC 0.2: CẤU HÌNH THU TIỀN ====================
export interface ServiceFeeConfig {
  id: string;
  name: string;
  unit: string;
  amount: number; // Phí cố định theo phòng/kỳ
  status: 'Đang áp dụng' | 'Ngừng áp dụng';
}

export interface UtilityPriceHistory {
  id: string;
  changedAt: string;
  changedBy: string;
  effectivePeriod: string;
  electricityPrice: number; // đồng/kWh
  waterPrice: number; // đồng/m3
  services: ServiceFeeConfig[];
}

export interface BankAccountConfig {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: 'Đang sử dụng' | 'Lịch sử';
  updatedAt: string;
  updatedBy: string;
}

// ==================== QUY TRÌNH 01: QUẢN LÝ PHÒNG ====================
export type RoomStatus = 'Trống' | 'Đang thuê' | 'Sắp trả';

export type ContractExpiryBadge = 
  | 'Còn hạn' // > 30 ngày
  | 'Sắp hết hạn hợp đồng' // 1-30 ngày
  | 'Đến hạn hôm nay' // 0 ngày
  | 'Đã hết hạn hợp đồng' // < 0 ngày
  | 'Chưa có dữ liệu';

export type TenantFeedbackBadge =
  | 'Chưa có ghi nhận liên hệ'
  | 'Chưa phản hồi'
  | 'Đã phản hồi – Chưa xác nhận ngày trả'
  | 'Đã phản hồi – Đã xác nhận ngày trả'
  | 'Đã phản hồi – Tiếp tục thuê';

export interface Room {
  id: string;
  roomCode: string; // Mã phòng (duy nhất, không đổi)
  floor: number; // Tầng >= 0
  area: number; // Diện tích m2 > 0
  status: RoomStatus;
  note?: string;
  hasDeposit: boolean; // Chỉ báo Đã cọc riêng theo hợp đồng
  firstMonthRentPaid: boolean; // Tiền thuê tháng đầu đã thanh toán (PH-07)
  firstMonthPeriod: string;
  currentTenantId?: string;
  currentTenantName?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  currentContractId?: string;
  currentLeaseId?: string; // Định danh lần thuê
  expectedReturnDate?: string; // Ngày dự kiến trả
  totalOccupants: number;
  returnPlanCancelled?: boolean;
  returnPlanCancelReason?: string;
}

export interface RoomHistoryLog {
  id: string;
  roomCode: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
}

export interface ReturnPlanLog {
  id: string;
  roomCode: string;
  leaseId: string;
  expectedDate: string;
  oldDate?: string;
  reason?: string;
  confirmSource: 'trực tiếp' | 'điện thoại' | 'tin nhắn' | 'khác';
  confirmedAt: string;
  exchangeContent: string;
  evidenceFile?: string;
  loggedBy: string;
  loggedAt: string;
  status: 'Còn theo dõi' | 'Đã hủy' | 'Đã kết thúc';
}

export interface TenantContactLog {
  id: string;
  roomCode: string;
  leaseId: string;
  contactTimeActual: string; // Không ở tương lai
  systemInputTime: string;
  contactSource: 'trực tiếp' | 'điện thoại' | 'tin nhắn' | 'khác';
  contactResult: 'Chưa phản hồi' | 'Không tiếp tục thuê – Chưa xác nhận ngày dự kiến trả' | 'Chờ đối chiếu' | 'Đồng ý tiếp tục thuê';
  content: string;
  nextContactDate?: string;
  loggedBy: string;
  conflictFlag?: boolean;
  hdt06Reference?: string;
  contactChannelSource?: 'UC-PH-13' | 'UC-BG09' | 'UC-PH-09';
  isAppointmentOnly?: boolean;
}

// UC-PH-06: Ghi nhận điều kiện còn thiếu
export interface MissingConditionLog {
  id: string;
  roomCode: string;
  contractId: string;
  leaseId: string;
  missingContractEffect: boolean;
  missingHandover: boolean;
  notes: string;
  isTenantStoppedProcedure?: boolean;
  tenantStopReason?: string;
  tenantStopContent?: string;
  loggedBy: string;
  loggedAt: string;
  status: 'Đang theo dõi' | 'Đã bổ sung' | 'Khách dừng thủ tục';
}

// UC-PH-07: Ghi nhận hoàn tất một tháng tiền cọc và một tháng tiền thuê đầu
export interface InitialPaymentRecord {
  id: string;
  contractId: string;
  roomCode: string;
  leaseId: string;
  depositAmount: number; // 1 tháng tiền cọc
  firstMonthRentAmount: number; // 1 tháng tiền thuê
  actualAmount: number; // Thực nhận = cọc + tiền thuê
  receivedDate: string;
  transactionCode: string;
  bankAccountReceived: string; // Tài khoản MB Bank
  proofFile?: string;
  depositCode: string; // Mã cọc gốc
  rentPeriodNote: string; // Kỳ thuê đầu đã trả trước
  confirmedBy: string;
  confirmedAt: string;
  correctionHistory?: {
    field: string;
    oldVal: string;
    newVal: string;
    reason: string;
    correctedBy: string;
    correctedAt: string;
  }[];
}

// UC-PH-09: Ghi nhận chưa bàn giao xong
export interface UnfinishedHandoverLog {
  id: string;
  roomCode: string;
  leaseId: string;
  contractId: string;
  handoverVersion: string; // Mã phiên bản kết quả UC-BG09 (ví dụ: v1.0)
  step304Status: 'Chưa nhận lại';
  notFinishedIndicator: 'Chưa kết thúc thuê'; // Chỉ báo nghiệp vụ (không phải trạng thái sử dụng phòng)
  reason: string; // Lý do bắt buộc (EF-02)
  obstacleContent: string; // Nội dung vướng mắc bắt buộc
  loggedBy: string;
  loggedAt: string;
  updatedAt?: string;
  updatedBy?: string;
  history?: {
    reason: string;
    obstacleContent: string;
    changedBy: string;
    changedAt: string;
  }[];
}

// UC-PH-05: Sự kiện Bắt đầu lần thuê cho HSKT-02
export interface LeaseStartEvent {
  eventId: string;
  roomCode: string;
  contractId: string;
  leaseId: string;
  checkInDate: string;
  handoverReportId?: string;
  handoverVersion?: string;
  emittedAt: string;
  coTenantsChecked: boolean;
  syncStatus: 'Đã gửi HSKT-02' | 'Chờ đồng bộ';
}

// ==================== QUY TRÌNH 02: BÀN GIAO & TÀI SẢN ====================
export interface Asset {
  id: string;
  name: string;
  unit: string;
  standardQuantity: number;
}

export interface RoomAssetItem {
  id: string;
  assetId: string;
  name: string;
  unit: string;
  standardQuantity: number;
  actualQuantity: number; // Số nguyên >= 0
  quantityDiff: 'Đủ' | 'Thiếu' | 'Thừa';
  physicalCondition: 'Bình thường' | 'Hư hỏng' | 'Khác';
  notes?: string;
}

export interface InventoryRecord {
  id: string;
  roomCode: string;
  expectedBatchCode: string;
  version: number;
  inventoryStatus: 'Nháp' | 'Đã hoàn tất';
  linkStatus: 'Chưa liên kết' | 'Đã liên kết';
  linkedContractId?: string;
  linkedLeaseId?: string;
  items: RoomAssetItem[];
  completedAt?: string;
  completedBy?: string;
}

export interface HandoverCondition {
  id: string;
  roomCode: string;
  expectedBatchCode?: string;
  linkedContractId?: string;
  linkedLeaseId?: string;
  status?: 'Nháp' | 'Đã hoàn tất';
  scope: 'Tài sản cụ thể' | 'Hiện trạng chung của phòng';
  assetName?: string;
  description: string;
  photos: string[]; // Tối đa 10 ảnh JPG/PNG/WEBP <= 5MB (dành sẵn 2 cho công tơ)
  videoUrl?: string; // HTTP(S) URL
  evidenceStatus?: 'Đã đính kèm' | 'Chưa đính kèm' | 'Chưa giải trình' | 'Chưa xác minh';
  initialElectricityKwh: number;
  initialWaterM3: number;
  meterElectricCode?: string;
  meterWaterCode?: string;
  meterPhotos: string[];
  tenantChecked: boolean;
  tenantCheckNote?: string;
  tenantCheckSupplement?: 'Có bổ sung' | 'Không cần bổ sung';
  supplementNote?: string;
  handoverDoneAt: string;
  loggedBy: string;
  version: number;
}

export interface HandoverReport {
  id: string;
  reportNumber: string;
  roomCode: string;
  contractId: string;
  leaseId: string;
  date: string;
  giverName: string;
  receiverName: string;
  status: 'Nháp' | 'Đã lập' | 'Đã xác nhận';
  tenantSignedPaper: 'Chưa ký' | 'Đã ký giấy';
  ownerSignedPaper: 'Chưa ký' | 'Đã ký giấy';
  paperLocation?: string;
  signedDocumentScanUrl?: string;
  version: number;
  createdAt: string;
  confirmedAt?: string;
  initialElectricityKwh: number;
  initialWaterM3: number;
}

export interface AssetIncident {
  id: string;
  roomCode: string;
  leaseId: string;
  scope: 'Tài sản cụ thể' | 'Hiện trạng chung';
  assetName?: string;
  occurredAt: string;
  description: string;
  cause?: string;
  responsibilityStatus: 'Chưa xác định' | 'Đã xác định';
  responsibilityNote?: string;
  processingStatus: 'Chưa xử lý' | 'Đang xử lý' | 'Đã xử lý';
  solutionPlan?: string;
  actualResult?: string;
  estimatedCompensation?: number; // Chỉ là tham khảo
  tenantPaidExternallyNote?: string; // Nhãn "Do User cung cấp – chưa xác minh độc lập"
  photos: string[];
  videoUrl?: string;
  loggedBy: string;
  loggedAt: string;
}

export interface ReturnInspection {
  id: string;
  roomCode: string;
  leaseId: string;
  inspectionDate: string;
  step304Status: 'Đã nhận lại' | 'Chưa nhận lại' | 'Chưa có kết quả';
  step305Confirmed: boolean; // Chủ nhà xác nhận độc lập tại 3.05
  step305ConfirmedAt?: string;
  step305ConfirmedBy?: string;
  step305Evidence?: string;
  finalElectricityKwh?: number;
  finalWaterM3?: number;
  assetsCheckedFully: boolean;
  incompleteReason?: string;
  items: {
    name: string;
    inspected: boolean;
    quantity: number;
    condition: string;
    reasonIfNotInspected?: string;
  }[];
}

export interface AssetComparison {
  id: string;
  roomCode: string;
  leaseId: string;
  hasDifference: boolean;
  details: {
    assetName: string;
    qtyReceive: number;
    qtyReturn: number;
    condReceive: string;
    condReturn: string;
    differenceNote: string;
  }[];
  concludedBy: string;
  concludedAt: string;
}

export interface AssetComparisonResult {
  id: string;
  roomCode: string;
  leaseId: string;
  hasDifference: boolean; // Từ BG06
  hasPendingWork: boolean; // Còn nội dung cần xử lý?
  pendingWorkNote?: string;
  solutionPlan?: string;
  ownerOpinion?: string;
  tenantOpinion?: string;
  tenantFeedbackStatus: 'Đã phản hồi' | 'Chưa phản hồi' | 'Không liên hệ được';
  unanimousStatus: 'Đã thống nhất' | 'Chưa thống nhất' | 'Chưa xác định';
  compensationAmount?: number;
  transferredToSettlement318: boolean;
  loggedAt: string;
}

export interface HandoverReturnReport {
  id: string;
  reportNumber: string;
  roomCode: string;
  leaseId: string;
  contractId: string;
  status: 'Nháp' | 'Đã lập' | 'Đã xác nhận';
  tenantSignedPaper: 'Khách đã ký' | 'Chưa ký' | 'Khách không ký';
  tenantNotSignReason?: string;
  ownerSignedPaper: 'Đã ký' | 'Chưa ký';
  reviewRequired: boolean;
  version: number;
  createdAt: string;
  confirmedAt?: string;
}

// ==================== QUY TRÌNH 03: HỒ SƠ KHÁCH THUÊ ====================
export interface Tenant {
  id: string; // Mã hồ sơ khách
  fullName: string;
  phoneNumber: string;
  idNumber?: string;
  address?: string;
  paperStatus: 'Đã cung cấp' | 'Chưa cung cấp';
  verificationStatus: 'Chưa xác minh' | 'Đã xác minh hợp lệ' | 'Không hợp lệ';
  requestAdmissionCode?: string; // Mã yêu cầu tiếp nhận
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface CoTenant {
  id: string;
  tenantId: string;
  roomCode?: string;
  leaseId?: string;
  fullName: string;
  idNumber?: string;
  relationship: string;
  status: 'Nháp' | 'Dự kiến' | 'Đang cư trú' | 'Đã kết thúc';
  expectedArrivalDate?: string;
  actualArrivalDate?: string;
  departureDate?: string;
  arrivalVerificationEvidence?: string;
}

export interface TenantChangeProposal {
  id: string;
  tenantId: string;
  version: number;
  proposedData: Partial<Tenant>;
  evidenceNote: string;
  verificationResult: 'Đạt' | 'Chưa đạt' | 'Chưa xác minh';
  verifiedAt?: string;
  verifiedBy?: string;
  reason?: string;
}

export interface TenantHistoryEntry {
  id: string;
  tenantId: string;
  action: string;
  timestamp: string;
  performedBy: string;
  oldValues?: string;
  newValues?: string;
  relatedLeaseId?: string;
}

// ==================== QUY TRÌNH 04: HỢP ĐỒNG THUÊ ====================
export interface BatchSchedule {
  batchCode: string;
  startDate: string;
  endDate: string;
  billingCycleNote: string;
  isConfirmed: boolean;
}

export interface LeaseConditionDraft {
  id: string;
  requestCode: string; // Mã yêu cầu tiếp nhận duy nhất
  tenantId?: string;
  roomCode: string;
  batchCode: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number; // Luôn = 1 tháng thuê
  billingCycle: string;
  paymentMethod: 'Chuyển khoản';
  termsNote: string;
  tenantAgreed44a1: boolean;
  version: number;
  updatedAt: string;
}

export interface Contract {
  id: string; // Mã hợp đồng
  contractType: 'Hợp đồng lần đầu' | 'Hợp đồng nối tiếp';
  requestCode?: string;
  leaseId: string; // Mã lần thuê
  roomCode: string;
  tenantId: string;
  tenantName: string;
  batchCode: string;
  startDate: string;
  endDate: string;
  signedDate?: string;
  actualCheckInDate?: string;
  monthlyRent: number;
  depositAmount: number; // Luôn = 1 tháng tiền thuê (kế thừa cọc gốc ở hợp đồng nối tiếp)
  firstMonthRentAmount: number; // 1 tháng tiền thuê
  firstMonthRentPaid: boolean;
  paymentMethod: 'Chuyển khoản';
  terms: string;
  status: 'Nháp' | 'Đã ký' | 'Chờ hiệu lực' | 'Hiệu lực' | 'Kết thúc';
  isSignedPaper: boolean;
  signedProofFiles?: string[];
  previousContractId?: string; // Hợp đồng cũ đối với hợp đồng nối tiếp
  initialDepositCode?: string; // Mã cọc gốc từ hợp đồng đầu
  version: number;
}

// ==================== QUY TRÌNH 05: QUYẾT TOÁN CỌC ====================
export type DepositSettlementStatus = 
  | 'Đang lập'
  | 'Không đồng ý'
  | 'Khách đồng ý'
  | 'Không liên hệ được'
  | 'Tranh chấp'
  | 'Đã có 5.8 – chờ ký biên bản'
  | 'Hoàn tất'
  | 'Đã hủy';

export interface DeductionItem {
  id: string;
  category: 'Công nợ kỳ trước' | 'Điện nước dịch vụ kỳ cuối' | 'Thiệt hại tài sản' | 'Khoản trừ theo điều khoản hợp đồng';
  description: string;
  amount: number;
  evidence?: string;
  clauseRef?: string; // Điều khoản hợp đồng
}

export interface DepositSettlementSlip {
  id: string; // Mã phiếu quyết toán
  roomCode: string;
  leaseId: string;
  initialDepositAmount: number; // Cọc gốc
  initialDepositCode: string;
  handoverReturnDate: string;
  deductions: DeductionItem[];
  calculatedResult: number; // Cọc gốc - Tổng khấu trừ (>0 hoàn cọc; <0 thu thêm; =0 đối trừ hết)
  status: DepositSettlementStatus;
  reviewRequired: boolean; // Cần rà soát khi kỳ cuối đổi
  tenantFeedback?: 'Đồng ý' | 'Không đồng ý' | 'Chưa phản hồi' | 'Không liên hệ được';
  disputeReason?: string;
  contactLogs: {
    contactTime: string;
    channel: string;
    contactPerson: string;
    result: string;
    evidence?: string;
  }[];
  // Chứng từ chuyển khoản duy nhất khi có tiền phải hoàn/thu thêm
  transferReceipt?: {
    receiptType: 'Hoàn cọc' | 'Thu thêm';
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    transferDate: string;
    transactionCode: string;
    verifiedBy: string;
  };
  step58Published: boolean;
  step58PublishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== QUY TRÌNH 06: TÍNH TIỀN THEO KỲ ====================
export interface MeterReading {
  id: string;
  roomCode: string;
  leaseId: string;
  periodCode: string; // Mã kỳ
  readingType: 'Theo kỳ chung' | 'Ngoài kỳ chung';
  readingDate: string;
  electricMeterCode: string;
  initialElectricKwh: number;
  finalElectricKwh: number;
  waterMeterCode: string;
  initialWaterM3: number;
  finalWaterM3: number;
  // Bất thường
  isAbnormal: boolean;
  abnormalReason?: 'Nhập sai' | 'Quay vòng' | 'Thay công tơ' | 'Công tơ hỏng' | 'Khác';
  verifiedElectricKwh?: number; // Sản lượng sử dụng thực tế đã xác minh
  verifiedWaterM3?: number;
  abnormalEvidence?: string;
  status: 'Nháp' | 'Nháp – điều chỉnh' | 'Đã xác nhận';
  pendingVerificationFlag: boolean; // Cờ Chờ xác minh
  needsRecalculateFlag: boolean; // Cờ Cần tính lại
  isFinalPeriodForLease?: boolean; // Dùng làm kỳ cuối
}

export interface PeriodBill {
  id: string;
  roomCode: string;
  leaseId: string;
  periodCode: string;
  // Hai khoảng thời gian riêng biệt
  servicePeriodFrom: string;
  servicePeriodTo: string;
  nextRentPeriodFrom: string;
  nextRentPeriodTo: string;
  isRentPeriodEnded?: boolean; // Khách đã trả phòng, không tính thuê kỳ tiếp
  nextMonthRentAmount: number;
  electricityUsage: number;
  electricityRate: number;
  electricityAmount: number;
  waterUsage: number;
  waterRate: number;
  waterAmount: number;
  serviceFees: {
    name: string;
    amount: number;
  }[];
  adjustmentAmount?: number;
  adjustmentReason?: string;
  totalAmount: number;
  isConfirmed: boolean;
  confirmedAt?: string;
  version: number;
}

// ==================== QUY TRÌNH 07: THÔNG BÁO THU TIỀN ====================
export interface ReceivableReconciliation {
  id: string;
  roomCode: string;
  leaseId: string;
  periodCode: string;
  billId: string;
  // Nhóm 1: Tiền thuê kỳ tiếp theo (trả trước)
  nextRentPeriodFrom: string;
  nextRentPeriodTo: string;
  nextRentAmount: number;
  nextRentStatus: 'Chưa thu' | 'Đã thu' | 'Không phát sinh';
  nextRentPrepaidAtPH07?: boolean;
  // Nhóm 2: Tiền điện, nước, phí dịch vụ kỳ vừa sử dụng (trả sau)
  servicePeriodFrom: string;
  servicePeriodTo: string;
  electricityUsage: number;
  electricityRate: number;
  electricityAmount: number;
  waterUsage: number;
  waterRate: number;
  waterAmount: number;
  serviceFees: {
    name: string;
    amount: number;
  }[];
  adjustmentAmount?: number;
  adjustmentReason?: string;
  serviceTotalAmount: number;
  serviceStatus: 'Chưa thu' | 'Đã thu';
  // Tham chiếu nợ cũ kỳ trước (chỉ xem, không cộng dồn)
  overdueDebtReference?: {
    noticeCode: string;
    amount: number;
    dueDate: string;
    noticeId?: string;
  };
  netReceivableAmount: number; // Tổng tiền còn phải trả thực tế sau khi kiểm tra
  isZeroBalance?: boolean; // AF-01: Tổng tiền = 0 không tạo khoản thu mới, không tạo QR 0đ
  zeroBalanceMessage?: string;
  isReconciled: boolean;
  reconciledAt?: string;
  reconciledBy?: string;
  notes?: string;
}

export interface PaymentNotice {
  id: string;
  noticeCode: string;
  roomCode: string;
  leaseId: string;
  periodCode: string;
  servicePeriod: string;
  nextRentPeriod: string;
  dueDate: string; // Hạn thanh toán (>= ngày phát hành khi tạo mới, giữ nguyên khi thay thế)
  originalDueDate: string; // Giữ nguyên hạn gốc khi thay thế
  totalAmount: number;
  status: 'Đang hiệu lực' | 'Đã thay thế';
  paymentStatus: 'Chưa thu' | 'Đã thu';
  // Chi tiết 2 nhóm theo BR-UC07.1-02 và BR-UC07.2-02
  breakdown?: {
    nextRentAmount: number;
    nextRentPeriodFrom?: string;
    nextRentPeriodTo?: string;
    isRentEnded?: boolean;
    nextRentPrepaid?: boolean;
    electricityAmount: number;
    electricityUsage?: number;
    electricityRate?: number;
    waterAmount: number;
    waterUsage?: number;
    waterRate?: number;
    serviceFees: { name: string; amount: number }[];
    adjustmentAmount?: number;
    adjustmentReason?: string;
  };
  // Tham chiếu nợ cũ chỉ tra cứu, không cộng vào tổng tiền mới
  priorDebtReference?: {
    noticeCode: string;
    amount: number;
    dueDate: string;
    noticeId?: string;
  };
  qrBankSnapshot: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    transferContent: string;
    amount: number;
  };
  replacedByNoticeId?: string;
  replacedNoticeId?: string;
  reconciliationId?: string;
  createdAt: string;
}

// ==================== QUY TRÌNH 08: THU TIỀN ====================
export interface ReceiptAuditEntry {
  action: string; // 'Tạo chứng từ thu' | 'Sửa xác nhận thu nhầm (AF-03)' | 'Khôi phục'
  timestamp: string;
  user: string;
  reason?: string;
  previousStatus?: string;
  newStatus?: string;
  transactionCode: string;
  amount: number;
  details?: string;
}

export interface PaymentReceipt {
  id: string;
  noticeId: string;
  roomCode: string;
  leaseId: string;
  periodCode: string;
  amountReceived: number;
  receivedDate: string;
  transactionCode: string;
  bankAccountReceived: string;
  paymentMethod?: 'Chuyển khoản ngân hàng';
  proofFile?: string;
  status: 'Đang hiệu lực' | 'Không còn hiệu lực';
  invalidatedReason?: string;
  invalidatedAt?: string;
  invalidatedBy?: string;
  confirmedBy: string;
  confirmedAt: string;
  auditHistory?: ReceiptAuditEntry[]; // Lịch sử thay đổi / sửa thu nhầm không xóa giao dịch nguồn
}

// ==================== QUY TRÌNH 09: CÔNG NỢ ====================
export interface DebtHistoryReminder {
  id: string;
  noticeId: string;
  roomCode: string;
  leaseId: string;
  contactDate: string;
  channel: 'Zalo' | 'Điện thoại' | 'Gặp trực tiếp';
  result: string;
  notes?: string;
  proofFile?: string;
  isRetrospective?: boolean;
  tenantConfirmedContact?: boolean;
  loggedBy: string;
  loggedAt: string;
}

export interface DebtPromise {
  id: string;
  noticeId: string;
  roomCode: string;
  contactTime: string;
  channel: 'Zalo' | 'Điện thoại' | 'Gặp trực tiếp';
  content: string;
  hasPromiseDate: boolean;
  promisedDate?: string;
  notes?: string;
  proofFile?: string;
  needsVerificationASIS08?: boolean;
  verificationNote?: string;
  loggedBy: string;
  loggedAt: string;
}

// ==================== QUY TRÌNH 10: BÁO CÁO QUẢN TRỊ ====================
export interface ManagementReportSnapshot {
  id: string;
  reportCode: string;
  createdAt: string;
  createdBy: string;
  asOfTimestamp: string;
  periodLabel: string;
  sourceVersion: string;
  roomStats: {
    totalRooms: number;
    vacantRooms: number;
    rentedRooms: number;
    returningRooms: number;
    occupancyRate: number | string;
    roomsSnapshot: {
      roomCode: string;
      status: string;
      hasDeposit: boolean;
      expectedReturnDate?: string;
    }[];
  };
  financialStats: {
    totalReceivable: number;
    totalCollected: number; // Thực thu chuyển khoản ngân hàng
    totalHandledByDeposit: number; // Khấu trừ bù cọc
    totalUncollected: number;
    totalOverdueDebt: number;
    initialRentTotal: number;
    nextRentTotal: number;
    utilityFeesTotal: number;
    depositHoldingTotal: number;
  };
  reconciliationStatus: 'Đã kiểm tra' | 'Chưa xác minh' | 'Có chênh lệch';
  reconciledAt?: string;
  reconciledBy?: string;
}

