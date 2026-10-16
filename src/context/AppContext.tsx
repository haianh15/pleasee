import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserAccount,
  AuthSession,
  PasswordResetToken,
  SecurityAuditLog,
  ServiceFeeConfig,
  UtilityPriceHistory,
  BankAccountConfig,
  BatchSchedule,
  Room,
  RoomHistoryLog,
  ReturnPlanLog,
  TenantContactLog,
  InventoryRecord,
  HandoverCondition,
  HandoverReport,
  AssetIncident,
  ReturnInspection,
  AssetComparisonResult,
  HandoverReturnReport,
  Tenant,
  CoTenant,
  TenantChangeProposal,
  TenantHistoryEntry,
  Contract,
  DepositSettlementSlip,
  MeterReading,
  PeriodBill,
  PaymentNotice,
  PaymentReceipt,
  ReceivableReconciliation,
  DebtHistoryReminder,
  DebtPromise,
  Asset,
  MissingConditionLog,
  UnfinishedHandoverLog,
  InitialPaymentRecord,
  LeaseStartEvent,
  ManagementReportSnapshot
} from '../types';

import {
  INITIAL_USERS,
  INITIAL_SERVICES,
  INITIAL_PRICE_HISTORY,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_BATCH_SCHEDULES,
  INITIAL_STANDARD_ASSETS,
  INITIAL_ROOMS,
  INITIAL_TENANTS,
  INITIAL_CO_TENANTS,
  INITIAL_CONTRACTS,
  INITIAL_INVENTORY_RECORDS,
  INITIAL_HANDOVER_CONDITIONS,
  INITIAL_HANDOVER_REPORTS,
  INITIAL_INCIDENTS,
  INITIAL_METER_READINGS,
  INITIAL_PERIOD_BILLS,
  INITIAL_PAYMENT_NOTICES,
  INITIAL_PAYMENT_RECEIPTS,
  INITIAL_DEBT_REMINDERS,
  INITIAL_DEBT_PROMISES,
  INITIAL_RETURN_INSPECTIONS,
  INITIAL_SETTLEMENT_SLIPS,
  INITIAL_ROOM_HISTORY,
  INITIAL_INITIAL_PAYMENT_RECORDS,
  INITIAL_MISSING_CONDITION_LOGS,
  INITIAL_UNFINISHED_HANDOVER_LOGS,
  INITIAL_LEASE_START_EVENTS
} from '../data/seedData';

interface AppContextType {
  // Auth
  currentUser: UserAccount | null;
  currentSession: AuthSession | null;
  authNotification: string | null;
  setAuthNotification: (msg: string | null) => void;
  login: (username: string, password: string) => { success: boolean; message?: string; requireChangePass?: boolean };
  changePasswordFirstLogin: (currentPass: string, newPass: string, confirmPass: string) => { success: boolean; message: string };
  logout: () => { success: boolean; message: string };
  changePasswordFromProfile: (currentPass: string, newPass: string, confirmPass: string) => { success: boolean; message: string };
  requestPasswordResetEmail: (email: string) => { success: boolean; message: string; generatedToken?: string };
  resetPasswordWithToken: (token: string, newPass: string, confirmPass: string) => { success: boolean; message: string };
  resetTokens: PasswordResetToken[];

  // Config (Mục 0.2)
  services: ServiceFeeConfig[];
  priceHistory: UtilityPriceHistory[];
  bankAccounts: BankAccountConfig[];
  activeBankAccount: BankAccountConfig | undefined;
  updateUtilityPrices: (electricPrice: number, waterPrice: number, serviceItems: ServiceFeeConfig[], effectivePeriod: string) => boolean;
  updateBankAccount: (bankName: string, accountNumber: string, accountHolder: string) => boolean;

  // Rooms (QT01)
  rooms: Room[];
  roomHistory: RoomHistoryLog[];
  returnPlans: ReturnPlanLog[];
  contactLogs: TenantContactLog[];
  initialPaymentRecords: InitialPaymentRecord[];
  missingConditionLogs: MissingConditionLog[];
  unfinishedHandoverLogs: UnfinishedHandoverLog[];
  leaseStartEvents: LeaseStartEvent[];
  addRoom: (roomCode: string, floor: number, area: number, note?: string) => { success: boolean; message: string; field?: string; code?: string; room?: Room };
  updateRoom: (roomCode: string, floor: number, area: number, note?: string) => { success: boolean; message: string; field?: string; code?: string; room?: Room };
  recordInitialPaymentPH07: (params: {
    roomCode: string;
    leaseId: string;
    contractId: string;
    depositAmount: number;
    firstMonthRentAmount: number;
    actualAmount: number;
    receivedDate: string;
    transactionCode: string;
    bankAccountReceived: string;
    proofFile?: string;
  }) => { success: boolean; message: string };
  correctInitialPaymentPH07: (id: string, reason: string, updatedFields: Partial<InitialPaymentRecord>) => { success: boolean; message: string };
  confirmCheckInPH05: (roomCode: string, leaseId: string, actualCheckInDate: string, handoverReportId?: string, handoverVersion?: string) => { success: boolean; message: string };
  saveMissingConditionPH06: (params: {
    roomCode: string;
    contractId: string;
    leaseId: string;
    missingContractEffect: boolean;
    missingHandover: boolean;
    notes: string;
    isTenantStoppedProcedure?: boolean;
    tenantStopReason?: string;
    tenantStopContent?: string;
  }) => { success: boolean; message: string };
  updateExpectedReturnDatePH11_12: (params: {
    roomCode: string;
    leaseId: string;
    expectedDate: string;
    confirmSource: 'trực tiếp' | 'điện thoại' | 'tin nhắn' | 'khác';
    confirmedAt: string;
    exchangeContent: string;
    reason?: string;
  }) => { success: boolean; message: string };
  recordTenantContactPH13: (params: {
    roomCode: string;
    leaseId: string;
    contactTimeActual: string;
    contactSource: 'trực tiếp' | 'điện thoại' | 'tin nhắn' | 'khác';
    contactResult: 'Chưa phản hồi' | 'Không tiếp tục thuê – Chưa xác nhận ngày dự kiến trả' | 'Chờ đối chiếu' | 'Đồng ý tiếp tục thuê';
    content: string;
    nextContactDate?: string;
    isAppointmentOnly?: boolean;
    contactChannelSource?: 'UC-PH-13' | 'UC-BG09' | 'UC-PH-09';
  }) => { success: boolean; message: string; logId?: string; isConflict?: boolean };
  autoCancelReturnPlanPH14: (roomCode: string, renewalContractId?: string) => { success: boolean; message: string };
  checkExtensionResultPH15: (roomCode: string) => {
    result: 'Có bằng chứng hợp lệ về việc tiếp tục thuê' | 'Chưa có căn cứ';
    caseType: 'Trường hợp 01' | 'Trường hợp 02' | 'Trường hợp 03';
    reason: string;
    activeContract?: Contract;
    renewalContract?: Contract;
  };
  confirmReturnStep305AndVacantPH08: (roomCode: string, leaseId: string, actualReturnDate?: string) => { success: boolean; message: string };
  saveUnfinishedHandoverPH09: (params: {
    roomCode: string;
    leaseId: string;
    contractId: string;
    handoverVersion: string;
    reason: string;
    obstacleContent: string;
    existingId?: string;
  }) => { success: boolean; message: string };

  // Handover & Assets (QT02)
  standardAssets: Asset[];
  inventoryRecords: InventoryRecord[];
  handoverConditions: HandoverCondition[];
  handoverReports: HandoverReport[];
  incidents: AssetIncident[];
  returnInspections: ReturnInspection[];
  assetComparisonResults: AssetComparisonResult[];
  handoverReturnReports: HandoverReturnReport[];
  saveInventoryBG01: (record: InventoryRecord) => void;
  saveHandoverConditionBG02: (condition: HandoverCondition) => { success: boolean; message: string };
  saveHandoverReportBG03: (report: HandoverReport) => void;
  confirmHandoverSignaturesBG03: (reportId: string, tenantSigned: boolean, ownerSigned: boolean, paperLocation?: string) => void;
  recordIncidentBG04: (incident: AssetIncident) => void;
  recordReturnInspectionBG09: (inspection: ReturnInspection) => void;
  confirmReturnInspectionStep305: (roomCode: string, leaseId: string, evidence: string) => void;
  saveAssetComparisonResultBG07: (result: AssetComparisonResult) => void;
  saveHandoverReturnReportBG11: (report: HandoverReturnReport) => void;
  confirmFinalReturnReportBG11: (reportId: string, tenantSignedStatus: 'Khách đã ký' | 'Khách không ký', notSignReason?: string) => void;

  // Tenants (QT03)
  tenants: Tenant[];
  coTenants: CoTenant[];
  tenantProposals: TenantChangeProposal[];
  tenantHistory: TenantHistoryEntry[];
  addTenantHSKT01: (tenant: Omit<Tenant, 'id' | 'createdAt' | 'createdBy'>) => { success: boolean; tenantId?: string; message: string };
  addCoTenantHSKT02: (coTenant: Omit<CoTenant, 'id'>) => void;
  updateCoTenantStatusHSKT02: (coTenantId: string, status: 'Đang cư trú' | 'Đã kết thúc', actualDate?: string, evidence?: string) => void;
  verifyTenantProposalHSKT03: (proposal: TenantChangeProposal) => void;
  applyTenantUpdateHSKT04: (tenantId: string, updatedFields: Partial<Tenant>) => void;

  // Contracts (QT04)
  contracts: Contract[];
  batchSchedules: BatchSchedule[];
  addBatchSchedule: (batch: BatchSchedule) => void;
  createContractDraftHDT02: (contract: Omit<Contract, 'id' | 'status' | 'isSignedPaper' | 'version'>) => { success: boolean; contractId?: string; message: string };
  confirmContractSignedHDT04: (contractId: string, signedDate: string, proofFiles: string[]) => { success: boolean; message: string };
  createRenewalContractHDT06: (params: {
    previousContractId: string;
    roomCode: string;
    tenantId: string;
    tenantName: string;
    batchCode: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    terms: string;
  }) => { success: boolean; contractId?: string; message: string };
  activateRenewalContractHDT07: (contractId: string, signedDate: string, proofFiles: string[]) => { success: boolean; message: string };

  // Deposit Settlement (QT05)
  settlementSlips: DepositSettlementSlip[];
  saveSettlementSlipQTC01: (slip: DepositSettlementSlip) => void;
  updateSettlementFeedbackQTC02: (slipId: string, feedback: 'Đồng ý' | 'Không đồng ý' | 'Chưa phản hồi' | 'Không liên hệ được', reason?: string, deductionUpdates?: { id: string; amount: number }[]) => void;
  confirmSettlementTransferReceiptQTC03: (slipId: string, receipt: DepositSettlementSlip['transferReceipt']) => { success: boolean; message: string };

  // Billing (QT06)
  meterReadings: MeterReading[];
  periodBills: PeriodBill[];
  saveMeterReadingTT01: (reading: MeterReading) => void;
  updateMeterReadingTT02: (readingId: string, updates: Partial<MeterReading>, reason: string) => void;
  generatePeriodBillTT03: (roomCode: string, periodCode: string) => { success: boolean; billId?: string; message: string };
  confirmPeriodBillTT03: (billId: string) => { success: boolean; message: string };

  // Payment Notices (QT07)
  reconciliations: ReceivableReconciliation[];
  performReconciliationUC07_1: (billId: string) => { success: boolean; result?: ReceivableReconciliation; message: string };
  confirmReconciliationUC07_1: (reconciliationId: string) => { success: boolean; message: string };
  paymentNotices: PaymentNotice[];
  generatePaymentNotice07_2: (billId: string, dueDate: string, reconciliationId?: string) => { success: boolean; noticeId?: string; message: string };
  replacePaymentNotice07_2: (oldNoticeId: string, reason?: string) => { success: boolean; noticeId?: string; message: string };

  // Payment Receipts (QT08)
  paymentReceipts: PaymentReceipt[];
  confirmPaymentReceipt08_2: (noticeId: string, amount: number, receivedDate: string, transactionCode: string, bankAccountReceived: string, proofFile?: string) => { success: boolean; message: string };
  revertPaymentReceipt08_2: (receiptId: string, reason: string) => { success: boolean; message: string };

  // Debts (QT09)
  debtReminders: DebtHistoryReminder[];
  debtPromises: DebtPromise[];
  recordDebtReminder09_2: (reminder: Omit<DebtHistoryReminder, 'id' | 'loggedAt' | 'loggedBy'>) => { success: boolean; message: string; record?: DebtHistoryReminder };
  recordDebtPromise09_3: (promise: Omit<DebtPromise, 'id' | 'loggedAt' | 'loggedBy'>) => { success: boolean; message: string; record?: DebtPromise };

  // Security Audit Log
  securityLogs: SecurityAuditLog[];
  logSecurity: (action: string, details: string) => void;

  // Management Reports (QT10)
  reportSnapshots: ManagementReportSnapshot[];
  saveReportSnapshot: (snapshot: ManagementReportSnapshot) => void;

  // Quick reset for demo/testing
  resetAllToSeedData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Storage helpers
  const getStored = <T,>(key: string, defaultVal: T): T => {
    try {
      const item = localStorage.getItem(`mini_apt_${key}`);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const setStored = <T,>(key: string, val: T) => {
    try {
      localStorage.setItem(`mini_apt_${key}`, JSON.stringify(val));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  };

  // State Declarations
  const [users, setUsers] = useState<UserAccount[]>(() => getStored('users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getStored('currentUser', INITIAL_USERS[0]));
  const [currentSession, setCurrentSession] = useState<AuthSession | null>(() => {
    return {
      sessionId: 'sess_init_' + Date.now(),
      userId: INITIAL_USERS[0].id,
      username: INITIAL_USERS[0].username,
      role: INITIAL_USERS[0].role,
      type: 'admin',
      expiresAt: Date.now() + 30 * 60 * 1000,
      createdAt: Date.now()
    };
  });
  const [resetTokens, setResetTokens] = useState<PasswordResetToken[]>(() => getStored('resetTokens', []));
  const [authNotification, setAuthNotification] = useState<string | null>(null);

  const [services, setServices] = useState<ServiceFeeConfig[]>(() => getStored('services', INITIAL_SERVICES));
  const [priceHistory, setPriceHistory] = useState<UtilityPriceHistory[]>(() => getStored('priceHistory', INITIAL_PRICE_HISTORY));
  const [bankAccounts, setBankAccounts] = useState<BankAccountConfig[]>(() => getStored('bankAccounts', INITIAL_BANK_ACCOUNTS));

  const [batchSchedules, setBatchSchedules] = useState<BatchSchedule[]>(() => getStored('batchSchedules', INITIAL_BATCH_SCHEDULES));
  const [standardAssets] = useState<Asset[]>(INITIAL_STANDARD_ASSETS);
  const [rooms, setRooms] = useState<Room[]>(() => getStored('rooms', INITIAL_ROOMS));
  const [roomHistory, setRoomHistory] = useState<RoomHistoryLog[]>(() => getStored('roomHistory', INITIAL_ROOM_HISTORY));
  const [returnPlans, setReturnPlans] = useState<ReturnPlanLog[]>(() => getStored('returnPlans', []));
  const [contactLogs, setContactLogs] = useState<TenantContactLog[]>(() => getStored('contactLogs', []));
  const [initialPaymentRecords, setInitialPaymentRecords] = useState<InitialPaymentRecord[]>(() => getStored('initialPaymentRecords', INITIAL_INITIAL_PAYMENT_RECORDS));
  const [missingConditionLogs, setMissingConditionLogs] = useState<MissingConditionLog[]>(() => getStored('missingConditionLogs', INITIAL_MISSING_CONDITION_LOGS));
  const [unfinishedHandoverLogs, setUnfinishedHandoverLogs] = useState<UnfinishedHandoverLog[]>(() => getStored('unfinishedHandoverLogs', INITIAL_UNFINISHED_HANDOVER_LOGS));
  const [leaseStartEvents, setLeaseStartEvents] = useState<LeaseStartEvent[]>(() => getStored('leaseStartEvents', INITIAL_LEASE_START_EVENTS));

  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>(() => getStored('inventoryRecords', INITIAL_INVENTORY_RECORDS));
  const [handoverConditions, setHandoverConditions] = useState<HandoverCondition[]>(() => getStored('handoverConditions', INITIAL_HANDOVER_CONDITIONS));
  const [handoverReports, setHandoverReports] = useState<HandoverReport[]>(() => getStored('handoverReports', INITIAL_HANDOVER_REPORTS));
  const [incidents, setIncidents] = useState<AssetIncident[]>(() => getStored('incidents', INITIAL_INCIDENTS));
  const [returnInspections, setReturnInspections] = useState<ReturnInspection[]>(() => getStored('returnInspections', INITIAL_RETURN_INSPECTIONS));
  const [assetComparisonResults, setAssetComparisonResults] = useState<AssetComparisonResult[]>(() => getStored('assetComparisonResults', []));
  const [handoverReturnReports, setHandoverReturnReports] = useState<HandoverReturnReport[]>(() => getStored('handoverReturnReports', []));

  const [tenants, setTenants] = useState<Tenant[]>(() => getStored('tenants', INITIAL_TENANTS));
  const [coTenants, setCoTenants] = useState<CoTenant[]>(() => getStored('coTenants', INITIAL_CO_TENANTS));
  const [tenantProposals, setTenantProposals] = useState<TenantChangeProposal[]>(() => getStored('tenantProposals', []));
  const [tenantHistory, setTenantHistory] = useState<TenantHistoryEntry[]>(() => getStored('tenantHistory', []));

  const [contracts, setContracts] = useState<Contract[]>(() => getStored('contracts', INITIAL_CONTRACTS));
  const [settlementSlips, setSettlementSlips] = useState<DepositSettlementSlip[]>(() => getStored('settlementSlips', INITIAL_SETTLEMENT_SLIPS));

  const [meterReadings, setMeterReadings] = useState<MeterReading[]>(() => getStored('meterReadings', INITIAL_METER_READINGS));
  const [periodBills, setPeriodBills] = useState<PeriodBill[]>(() => getStored('periodBills', INITIAL_PERIOD_BILLS));
  const [reconciliations, setReconciliations] = useState<ReceivableReconciliation[]>(() => getStored('reconciliations', []));
  const [paymentNotices, setPaymentNotices] = useState<PaymentNotice[]>(() => getStored('paymentNotices', INITIAL_PAYMENT_NOTICES));
  const [paymentReceipts, setPaymentReceipts] = useState<PaymentReceipt[]>(() => getStored('paymentReceipts', INITIAL_PAYMENT_RECEIPTS));
  const [debtReminders, setDebtReminders] = useState<DebtHistoryReminder[]>(() => getStored('debtReminders', INITIAL_DEBT_REMINDERS));
  const [debtPromises, setDebtPromises] = useState<DebtPromise[]>(() => getStored('debtPromises', INITIAL_DEBT_PROMISES));
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditLog[]>(() => getStored('securityLogs', []));
  const [reportSnapshots, setReportSnapshots] = useState<ManagementReportSnapshot[]>(() => getStored('reportSnapshots', [
    {
      id: 'snap_demo_01',
      reportCode: 'BCQT-202610-01',
      createdAt: '2026-10-15 17:30',
      createdBy: 'Quản lý Nguyễn Văn An',
      asOfTimestamp: '15/10/2026 17:30:00',
      periodLabel: 'Kỳ tháng 10/2026',
      sourceVersion: 'ASIS-01 v2.4 (Chốt kỳ 10/2026)',
      roomStats: {
        totalRooms: 12,
        vacantRooms: 2,
        rentedRooms: 8,
        returningRooms: 2,
        occupancyRate: 83.3,
        roomsSnapshot: [
          { roomCode: 'P.101', status: 'Đang thuê', hasDeposit: true, expectedReturnDate: '2026-12-31' },
          { roomCode: 'P.102', status: 'Trống', hasDeposit: false },
          { roomCode: 'P.103', status: 'Đang thuê', hasDeposit: true },
          { roomCode: 'P.201', status: 'Sắp trả', hasDeposit: true, expectedReturnDate: '2026-10-25' },
          { roomCode: 'P.202', status: 'Đang thuê', hasDeposit: true },
          { roomCode: 'P.203', status: 'Đang thuê', hasDeposit: true },
          { roomCode: 'P.301', status: 'Đang thuê', hasDeposit: true },
          { roomCode: 'P.302', status: 'Trống', hasDeposit: true },
          { roomCode: 'P.303', status: 'Sắp trả', hasDeposit: true, expectedReturnDate: '2026-10-20' },
          { roomCode: 'P.401', status: 'Đang thuê', hasDeposit: true },
          { roomCode: 'P.402', status: 'Đang thuê', hasDeposit: true },
          { roomCode: 'P.403', status: 'Đang thuê', hasDeposit: true }
        ]
      },
      financialStats: {
        totalReceivable: 45500000,
        totalCollected: 38200000,
        totalHandledByDeposit: 2500000,
        totalUncollected: 4800000,
        totalOverdueDebt: 3100000,
        initialRentTotal: 7000000,
        nextRentTotal: 31500000,
        utilityFeesTotal: 7000000,
        depositHoldingTotal: 42000000
      },
      reconciliationStatus: 'Đã kiểm tra',
      reconciledAt: '15/10/2026 17:25',
      reconciledBy: 'Quản lý Nguyễn Văn An'
    }
  ]));

  // Sync state to local storage on changes
  useEffect(() => { setStored('reportSnapshots', reportSnapshots); }, [reportSnapshots]);
  useEffect(() => { setStored('users', users); }, [users]);
  useEffect(() => { setStored('currentUser', currentUser); }, [currentUser]);
  useEffect(() => { setStored('services', services); }, [services]);
  useEffect(() => { setStored('priceHistory', priceHistory); }, [priceHistory]);
  useEffect(() => { setStored('bankAccounts', bankAccounts); }, [bankAccounts]);
  useEffect(() => { setStored('rooms', rooms); }, [rooms]);
  useEffect(() => { setStored('roomHistory', roomHistory); }, [roomHistory]);
  useEffect(() => { setStored('returnPlans', returnPlans); }, [returnPlans]);
  useEffect(() => { setStored('contactLogs', contactLogs); }, [contactLogs]);
  useEffect(() => { setStored('initialPaymentRecords', initialPaymentRecords); }, [initialPaymentRecords]);
  useEffect(() => { setStored('missingConditionLogs', missingConditionLogs); }, [missingConditionLogs]);
  useEffect(() => { setStored('unfinishedHandoverLogs', unfinishedHandoverLogs); }, [unfinishedHandoverLogs]);
  useEffect(() => { setStored('leaseStartEvents', leaseStartEvents); }, [leaseStartEvents]);
  useEffect(() => { setStored('inventoryRecords', inventoryRecords); }, [inventoryRecords]);
  useEffect(() => { setStored('handoverConditions', handoverConditions); }, [handoverConditions]);
  useEffect(() => { setStored('handoverReports', handoverReports); }, [handoverReports]);
  useEffect(() => { setStored('incidents', incidents); }, [incidents]);
  useEffect(() => { setStored('returnInspections', returnInspections); }, [returnInspections]);
  useEffect(() => { setStored('assetComparisonResults', assetComparisonResults); }, [assetComparisonResults]);
  useEffect(() => { setStored('handoverReturnReports', handoverReturnReports); }, [handoverReturnReports]);
  useEffect(() => { setStored('tenants', tenants); }, [tenants]);
  useEffect(() => { setStored('coTenants', coTenants); }, [coTenants]);
  useEffect(() => { setStored('tenantProposals', tenantProposals); }, [tenantProposals]);
  useEffect(() => { setStored('tenantHistory', tenantHistory); }, [tenantHistory]);
  useEffect(() => { setStored('contracts', contracts); }, [contracts]);
  useEffect(() => { setStored('batchSchedules', batchSchedules); }, [batchSchedules]);
  useEffect(() => { setStored('settlementSlips', settlementSlips); }, [settlementSlips]);
  useEffect(() => { setStored('meterReadings', meterReadings); }, [meterReadings]);
  useEffect(() => { setStored('periodBills', periodBills); }, [periodBills]);
  useEffect(() => { setStored('reconciliations', reconciliations); }, [reconciliations]);
  useEffect(() => { setStored('paymentNotices', paymentNotices); }, [paymentNotices]);
  useEffect(() => { setStored('paymentReceipts', paymentReceipts); }, [paymentReceipts]);
  useEffect(() => { setStored('debtReminders', debtReminders); }, [debtReminders]);
  useEffect(() => { setStored('debtPromises', debtPromises); }, [debtPromises]);
  useEffect(() => { setStored('securityLogs', securityLogs); }, [securityLogs]);

  const logSecurity = (action: string, details: string) => {
    const newLog: SecurityAuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'anonymous',
      action,
      details
    };
    setSecurityLogs(prev => [newLog, ...prev]);
  };

  // ==================== AUTH METHODS (UC-TK-01 -> 04) ====================
  const login = (username: string, password: string) => {
    const trimmedUser = username.trim();
    if (!trimmedUser && !password) {
      return { success: false, message: 'Tên đăng nhập là trường bắt buộc và Mật khẩu là trường bắt buộc' };
    }
    if (!trimmedUser) {
      return { success: false, message: 'Tên đăng nhập là trường bắt buộc' };
    }
    if (!password) {
      return { success: false, message: 'Mật khẩu là trường bắt buộc' };
    }

    const user = users.find(u => u.username === trimmedUser);
    const now = Date.now();

    if (!user) {
      logSecurity('LOGIN_FAILED', `User not found: ${trimmedUser}`);
      return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại.' };
    }

    // Check lock
    if (user.lockUntil && user.lockUntil > now) {
      const minsLeft = Math.ceil((user.lockUntil - now) / 60000);
      return { success: false, message: `Tài khoản tạm thời bị khóa do sai quá 5 lần. Vui lòng thử lại sau ${minsLeft} phút.` };
    }

    if (user.passwordHash !== password) {
      const newFails = user.failedLoginAttempts + 1;
      let newLock: number | null = null;
      let lockMsg = '';
      if (newFails >= 5) {
        newLock = now + 15 * 60 * 1000;
        lockMsg = ' Bạn đã nhập sai 5 lần liên tiếp. Tài khoản tạm khóa 15 phút.';
      }

      setUsers(prev => prev.map(u => u.id === user.id ? {
        ...u,
        failedLoginAttempts: newFails,
        lockUntil: newLock
      } : u));

      logSecurity('LOGIN_FAILED', `User ${trimmedUser} password mismatch. Tries: ${newFails}`);
      return { success: false, message: `Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại.${lockMsg}` };
    }

    // Login successful
    const updatedUser = { ...user, failedLoginAttempts: 0, lockUntil: null };
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setCurrentUser(updatedUser);

    if (updatedUser.mustChangePasswordFirstLogin) {
      const tempSession: AuthSession = {
        sessionId: 'sess_temp_' + now,
        userId: user.id,
        username: user.username,
        role: user.role,
        type: 'temp_change_password',
        expiresAt: now + 15 * 60 * 1000,
        createdAt: now
      };
      setCurrentSession(tempSession);
      logSecurity('LOGIN_FIRST_TIME', `Temp session for mandatory password change: ${user.username}`);
      return { success: true, requireChangePass: true, message: 'Đăng nhập thành công! Vui lòng đổi mật khẩu lần đầu.' };
    }

    const adminSession: AuthSession = {
      sessionId: 'sess_adm_' + now,
      userId: user.id,
      username: user.username,
      role: user.role,
      type: 'admin',
      expiresAt: now + 30 * 60 * 1000,
      createdAt: now
    };
    setCurrentSession(adminSession);
    logSecurity('LOGIN_SUCCESS', `Admin session established for ${user.username}`);
    return { success: true, requireChangePass: false };
  };

  const changePasswordFirstLogin = (currentPass: string, newPass: string, confirmPass: string) => {
    if (!currentUser || !currentSession) {
      return { success: false, message: 'Phiên làm việc đã kết thúc. Vui lòng đăng nhập lại.' };
    }

    if (!currentPass) return { success: false, message: 'Mật khẩu hiện tại là trường bắt buộc' };
    if (!newPass) return { success: false, message: 'Mật khẩu mới là trường bắt buộc' };
    if (!confirmPass) return { success: false, message: 'Xác nhận mật khẩu mới là trường bắt buộc' };

    if (currentUser.passwordHash !== currentPass) {
      return { success: false, message: 'Mật khẩu hiện tại không chính xác.' };
    }

    if (newPass === currentPass) {
      return { success: false, message: 'Mật khẩu mới phải khác mật khẩu hiện tại.' };
    }

    if (newPass.length < 12) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 12 ký tự theo chính sách bảo mật.' };
    }

    if (newPass !== confirmPass) {
      return { success: false, message: 'Xác nhận mật khẩu không khớp.' };
    }

    const now = Date.now();
    const updatedUser: UserAccount = {
      ...currentUser,
      passwordHash: newPass,
      mustChangePasswordFirstLogin: false,
      authVersion: currentUser.authVersion + 1,
      failedLoginAttempts: 0,
      lockUntil: null
    };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);

    // Create new admin session
    const adminSession: AuthSession = {
      sessionId: 'sess_adm_' + now,
      userId: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
      type: 'admin',
      expiresAt: now + 30 * 60 * 1000,
      createdAt: now
    };
    setCurrentSession(adminSession);
    logSecurity('PASSWORD_CHANGED_FIRST_LOGIN', `First login password change succeeded for ${updatedUser.username}`);

    return { success: true, message: 'Đổi mật khẩu thành công!' };
  };

  const logout = () => {
    const isTemp = currentSession?.type === 'temp_change_password';
    logSecurity('LOGOUT', `Session revoked: ${currentSession?.sessionId}`);
    setCurrentSession(null);
    setCurrentUser(null);
    if (isTemp) {
      return { success: true, message: 'Đã thoát khỏi bước đổi mật khẩu. Vui lòng đăng nhập lại.' };
    }
    return { success: true, message: 'Đăng xuất thành công!' };
  };

  const changePasswordFromProfile = (currentPass: string, newPass: string, confirmPass: string) => {
    if (!currentUser || !currentSession || currentSession.type !== 'admin') {
      return { success: false, message: 'Phiên làm việc đã kết thúc. Vui lòng đăng nhập lại.' };
    }

    const now = Date.now();
    if (currentUser.changePasswordLockUntil && currentUser.changePasswordLockUntil > now) {
      return { success: false, message: 'Tạm thời chưa thể đổi mật khẩu. Vui lòng thử lại sau.' };
    }

    if (!currentPass) return { success: false, message: 'Mật khẩu hiện tại là trường bắt buộc' };
    if (!newPass) return { success: false, message: 'Mật khẩu mới là trường bắt buộc' };
    if (!confirmPass) return { success: false, message: 'Xác nhận mật khẩu mới là trường bắt buộc' };

    if (newPass !== confirmPass) {
      return { success: false, message: 'Xác nhận mật khẩu không khớp.' };
    }

    if (newPass.length < 12) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 12 ký tự.' };
    }

    if (currentUser.passwordHash !== currentPass) {
      const fails = currentUser.failedChangePasswordAttempts + 1;
      let newLock: number | null = null;
      let msg = 'Mật khẩu hiện tại không chính xác.';
      if (fails >= 5) {
        newLock = now + 15 * 60 * 1000;
        msg = 'Nhập sai 5 lần liên tiếp. Tạm thời ngừng chức năng đổi mật khẩu trong 15 phút.';
      }
      const updatedUser = { ...currentUser, failedChangePasswordAttempts: fails, changePasswordLockUntil: newLock };
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      return { success: false, message: msg };
    }

    if (newPass === currentPass) {
      return { success: false, message: 'Mật khẩu mới phải khác mật khẩu hiện tại.' };
    }

    const updatedUser: UserAccount = {
      ...currentUser,
      passwordHash: newPass,
      authVersion: currentUser.authVersion + 1,
      failedChangePasswordAttempts: 0,
      changePasswordLockUntil: null
    };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    logSecurity('PASSWORD_CHANGED_PROFILE', `Password changed successfully for ${currentUser.username}`);
    return { success: true, message: 'Đổi mật khẩu thành công!' };
  };

  const requestPasswordResetEmail = (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) {
      return { success: false, message: 'Email là trường bắt buộc' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { success: false, message: 'Email không đúng định dạng.' };
    }

    const user = users.find(u => u.email.toLowerCase() === trimmed.toLowerCase());
    let generatedToken: string | undefined = undefined;

    if (user) {
      const token = 'rst_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      const resetObj: PasswordResetToken = {
        token,
        email: user.email,
        authVersionAtIssue: user.authVersion,
        expiresAt: Date.now() + 15 * 60 * 1000,
        used: false,
        createdAt: Date.now()
      };
      setResetTokens(prev => [resetObj, ...prev]);
      generatedToken = token;
      logSecurity('PASSWORD_RESET_REQUESTED', `Reset link generated for verified email of ${user.username}`);
    }

    // Always return safe identical message (BR-UC.TK.04-02)
    return {
      success: true,
      message: 'Nếu email đã được liên kết với tài khoản hợp lệ, liên kết đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư đến hoặc thư rác.',
      generatedToken
    };
  };

  const resetPasswordWithToken = (token: string, newPass: string, confirmPass: string) => {
    const tokenObj = resetTokens.find(t => t.token === token);
    const now = Date.now();

    if (!tokenObj || tokenObj.used) {
      return { success: false, message: 'Liên kết không còn hiệu lực. Vui lòng yêu cầu liên kết mới.' };
    }

    if (tokenObj.expiresAt < now) {
      return { success: false, message: 'Liên kết đã hết hạn. Vui lòng yêu cầu liên kết mới.' };
    }

    const user = users.find(u => u.email.toLowerCase() === tokenObj.email.toLowerCase());
    if (!user || user.authVersion !== tokenObj.authVersionAtIssue) {
      return { success: false, message: 'Liên kết không còn hiệu lực do thông tin xác thực đã thay đổi.' };
    }

    if (!newPass) return { success: false, message: 'Mật khẩu mới là trường bắt buộc' };
    if (!confirmPass) return { success: false, message: 'Xác nhận mật khẩu mới là trường bắt buộc' };

    if (newPass !== confirmPass) {
      return { success: false, message: 'Xác nhận mật khẩu không khớp.' };
    }

    if (newPass.length < 12) {
      return { success: false, message: 'Mật khẩu mới có ít nhất 12 ký tự.' };
    }

    if (newPass === user.passwordHash) {
      return { success: false, message: 'Mật khẩu mới phải khác mật khẩu hiện tại.' };
    }

    // Update password
    const updatedUser: UserAccount = {
      ...user,
      passwordHash: newPass,
      authVersion: user.authVersion + 1,
      mustChangePasswordFirstLogin: false,
      failedLoginAttempts: 0,
      lockUntil: null
    };

    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setResetTokens(prev => prev.map(t => t.token === token ? { ...t, used: true } : t));
    logSecurity('PASSWORD_RESET_SUCCESS', `Password reset successful for ${user.username}`);

    return { success: true, message: 'Đặt lại mật khẩu thành công!' };
  };

  // ==================== CONFIG METHODS (UC-CH-01, UC-CH-02) ====================
  const activeBankAccount = bankAccounts.find(b => b.status === 'Đang sử dụng') || bankAccounts[0];

  const updateUtilityPrices = (
    electricPrice: number,
    waterPrice: number,
    serviceItems: ServiceFeeConfig[],
    effectivePeriod: string
  ) => {
    if (electricPrice <= 0 || waterPrice <= 0) return false;
    const historyItem: UtilityPriceHistory = {
      id: 'uph_' + Date.now(),
      changedAt: new Date().toISOString(),
      changedBy: currentUser?.fullName || 'Chủ nhà',
      effectivePeriod,
      electricityPrice: electricPrice,
      waterPrice: waterPrice,
      services: serviceItems
    };
    setServices(serviceItems);
    setPriceHistory(prev => [historyItem, ...prev]);
    logSecurity('CONFIG_PRICE_UPDATED', `Updated prices: Điện ${electricPrice}đ, Nước ${waterPrice}đ for ${effectivePeriod}`);
    return true;
  };

  const updateBankAccount = (bankName: string, accountNumber: string, accountHolder: string) => {
    if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) return false;
    const newAccount: BankAccountConfig = {
      id: 'bank_' + Date.now(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim().toUpperCase(),
      status: 'Đang sử dụng',
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.fullName || 'Chủ nhà'
    };
    setBankAccounts(prev => [
      newAccount,
      ...prev.map(b => ({ ...b, status: 'Lịch sử' as const }))
    ]);
    logSecurity('CONFIG_BANK_UPDATED', `New active bank account: ${bankName} - ${accountNumber}`);
    return true;
  };

  // ==================== ROOM METHODS (QT01: UC-PH-01 -> UC-PH-15) ====================
  // UC-PH-02: Thêm phòng mới
  const addRoom = (roomCode: string, floor: number, area: number, note?: string) => {
    // Kiểm tra phiên đăng nhập và quyền (EF-03)
    if (!currentUser || !currentSession || currentSession.expiresAt < Date.now()) {
      return { success: false, message: 'Phiên đăng nhập đã hết hiệu lực. Vui lòng đăng nhập lại.', code: 'EF-03' };
    }
    if (currentUser.role !== 'Chủ nhà' && currentUser.role !== 'Quản lý') {
      return { success: false, message: 'Chức năng chỉ dành cho User có vai trò Quản lý hoặc Chủ nhà.', code: 'EF-03' };
    }

    // BR-UC.PH.02-01: Mã phòng sau khi bỏ khoảng trắng đầu/cuối phải có nội dung và duy nhất
    const code = (roomCode || '').trim();
    if (!code) {
      return { success: false, message: 'Mã phòng không hợp lệ hoặc đã tồn tại', field: 'roomCode', code: 'EF-02' };
    }
    if (rooms.some(r => r.roomCode.toLowerCase() === code.toLowerCase())) {
      return { success: false, message: 'Mã phòng không hợp lệ hoặc đã tồn tại', field: 'roomCode', code: 'EF-02' };
    }

    // BR-UC.PH.02-02 & EF-01: Tầng là số nguyên từ 0 trở lên
    if (floor === undefined || isNaN(floor) || floor < 0 || !Number.isInteger(floor)) {
      return { success: false, message: 'Tầng trống hoặc sai định dạng (phải là số nguyên từ 0 trở lên).', field: 'floor', code: 'EF-01' };
    }

    // BR-UC.PH.02-02 & EF-01: Diện tích là số dương > 0
    if (area === undefined || isNaN(area) || area <= 0) {
      return { success: false, message: 'Diện tích trống hoặc không lớn hơn 0 (phải là số dương).', field: 'area', code: 'EF-01' };
    }

    // BR-UC.PH.02-02 & EF-02: Ghi chú không bắt buộc và không quá 500 ký tự
    const trimmedNote = (note || '').trim();
    if (trimmedNote.length > 500) {
      return { success: false, message: 'Ghi chú vượt 500 ký tự. Vui lòng sửa trước khi lưu.', field: 'note', code: 'EF-02' };
    }

    const now = new Date().toISOString();
    const user = currentUser?.fullName || 'Chủ nhà';

    // BR-UC.PH.02-03 & BR-UC.PH.02-04: Khởi tạo phòng trạng thái Trống, không tự có khách thuê, hợp đồng, cọc hoặc ngày dự kiến trả
    const newRoom: Room = {
      id: 'rm_' + Date.now(),
      roomCode: code,
      floor,
      area,
      status: 'Trống',
      hasDeposit: false,
      firstMonthRentPaid: false,
      firstMonthPeriod: '',
      totalOccupants: 0,
      note: trimmedNote
    };

    // BR-UC.PH.02-05: Tạo phòng phải lưu trọn vẹn, ghi vết khởi tạo cùng giao dịch
    const initLog: RoomHistoryLog = {
      id: 'rl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      roomCode: code,
      field: 'Khởi tạo phòng',
      oldValue: '—',
      newValue: `Khởi tạo phòng mới: Tầng ${floor}, ${area} m² (Trạng thái: Trống)`,
      changedBy: user,
      changedAt: now
    };

    setRooms(prev => [...prev, newRoom]);
    setRoomHistory(prev => [initLog, ...prev]);
    logSecurity('ROOM_CREATED', `Tạo phòng ${code} - Tầng ${floor}, ${area}m² bởi ${user}`);

    return { success: true, message: 'Thêm phòng thành công', room: newRoom };
  };

  // UC-PH-02: Cập nhật thông tin phòng đã có
  const updateRoom = (roomCode: string, floor: number, area: number, note?: string) => {
    // Kiểm tra phiên đăng nhập và quyền (EF-03)
    if (!currentUser || !currentSession || currentSession.expiresAt < Date.now()) {
      return { success: false, message: 'Phiên đăng nhập đã hết hiệu lực. Vui lòng đăng nhập lại.', code: 'EF-03' };
    }
    if (currentUser.role !== 'Chủ nhà' && currentUser.role !== 'Quản lý') {
      return { success: false, message: 'Chức năng chỉ dành cho User có vai trò Quản lý hoặc Chủ nhà.', code: 'EF-03' };
    }

    const room = rooms.find(r => r.roomCode === roomCode);
    if (!room) {
      return { success: false, message: 'Không tìm thấy phòng tương ứng.', code: 'NOT_FOUND' };
    }

    // BR-UC.PH.02-02 & EF-01: Tầng là số nguyên từ 0 trở lên
    if (floor === undefined || isNaN(floor) || floor < 0 || !Number.isInteger(floor)) {
      return { success: false, message: 'Tầng trống hoặc sai định dạng (phải là số nguyên từ 0 trở lên).', field: 'floor', code: 'EF-01' };
    }

    // BR-UC.PH.02-02 & EF-01: Diện tích là số dương > 0
    if (area === undefined || isNaN(area) || area <= 0) {
      return { success: false, message: 'Diện tích trống hoặc không lớn hơn 0 (phải là số dương).', field: 'area', code: 'EF-01' };
    }

    // BR-UC.PH.02-02 & EF-02: Ghi chú không bắt buộc và không quá 500 ký tự
    const trimmedNote = (note !== undefined ? note : (room.note || '')).trim();
    if (trimmedNote.length > 500) {
      return { success: false, message: 'Ghi chú vượt 500 ký tự. Vui lòng sửa trước khi lưu.', field: 'note', code: 'EF-02' };
    }

    // BR-UC.PH.02-05: Cập nhật phòng và lưu vết thay đổi phải diễn ra cùng giao dịch
    const logs: RoomHistoryLog[] = [];
    const now = new Date().toISOString();
    const user = currentUser?.fullName || 'Chủ nhà';

    if (room.floor !== floor) {
      logs.push({
        id: 'rl_' + Date.now() + '_fl',
        roomCode,
        field: 'Tầng',
        oldValue: `Tầng ${room.floor}`,
        newValue: `Tầng ${floor}`,
        changedBy: user,
        changedAt: now
      });
    }
    if (room.area !== area) {
      logs.push({
        id: 'rl_' + Date.now() + '_ar',
        roomCode,
        field: 'Diện tích',
        oldValue: `${room.area} m²`,
        newValue: `${area} m²`,
        changedBy: user,
        changedAt: now
      });
    }
    const currentNoteTrimmed = (room.note || '').trim();
    if (currentNoteTrimmed !== trimmedNote) {
      logs.push({
        id: 'rl_' + Date.now() + '_nt',
        roomCode,
        field: 'Ghi chú',
        oldValue: currentNoteTrimmed || '(Trống)',
        newValue: trimmedNote || '(Trống)',
        changedBy: user,
        changedAt: now
      });
    }

    const updatedRoom: Room = {
      ...room,
      floor,
      area,
      note: trimmedNote
    };

    setRooms(prev => prev.map(r => r.roomCode === roomCode ? updatedRoom : r));
    if (logs.length > 0) {
      setRoomHistory(prev => [...logs, ...prev]);
    }

    logSecurity('ROOM_UPDATED', `Cập nhật phòng ${roomCode}: Tầng ${floor}, ${area}m² bởi ${user}`);
    return { success: true, message: 'Cập nhật thông tin phòng thành công', room: updatedRoom };
  };

  // UC-PH-07: Ghi nhận hoàn tất một tháng tiền cọc và một tháng tiền thuê đầu
  const recordInitialPaymentPH07 = (params: {
    roomCode: string;
    leaseId: string;
    contractId: string;
    depositAmount: number;
    firstMonthRentAmount: number;
    actualAmount: number;
    receivedDate: string;
    transactionCode: string;
    bankAccountReceived: string;
    proofFile?: string;
  }) => {
    // BR-UC.PH.07-04: Hợp đồng gia hạn không thu cọc mới
    const targetContract = contracts.find(c => c.id === params.contractId);
    if (targetContract && targetContract.contractType === 'Hợp đồng nối tiếp') {
      return { success: false, message: 'Hợp đồng nối tiếp kế thừa cọc gốc từ hợp đồng đầu, không thu cọc ban đầu mới (BR-UC.PH.07-04).' };
    }

    // BR-UC.PH.07-01: Đúng đủ 1 tháng cọc + 1 tháng thuê đầu
    const totalRequired = params.depositAmount + params.firstMonthRentAmount;
    if (params.actualAmount !== totalRequired) {
      return {
        success: false,
        message: `EF-01: Số tiền thực nhận (${params.actualAmount.toLocaleString('vi-VN')} đ) không khớp tổng 1 tháng cọc + 1 tháng tiền thuê (${totalRequired.toLocaleString('vi-VN')} đ). Không xác nhận và không cho nhận phòng.`
      };
    }

    // Check duplicate transaction code
    if (initialPaymentRecords.some(p => p.transactionCode === params.transactionCode)) {
      return { success: false, message: 'Mã giao dịch đã tồn tại trên hệ thống. Vui lòng kiểm tra lại để tránh ghi trùng (AF-02).' };
    }

    const depositCode = 'COC-' + params.roomCode.replace(/[^0-9a-zA-Z]/g, '') + '-L1';
    const rentPeriodNote = targetContract?.batchCode ? `Kỳ thuê đầu (${targetContract.batchCode})` : 'Kỳ thuê đầu';

    const newPaymentRecord: InitialPaymentRecord = {
      id: 'pay07_' + Date.now(),
      contractId: params.contractId,
      roomCode: params.roomCode,
      leaseId: params.leaseId,
      depositAmount: params.depositAmount,
      firstMonthRentAmount: params.firstMonthRentAmount,
      actualAmount: params.actualAmount,
      receivedDate: params.receivedDate,
      transactionCode: params.transactionCode,
      bankAccountReceived: params.bankAccountReceived,
      proofFile: params.proofFile,
      depositCode,
      rentPeriodNote,
      confirmedBy: currentUser?.fullName || 'Chủ nhà',
      confirmedAt: new Date().toISOString()
    };

    setInitialPaymentRecords(prev => [newPaymentRecord, ...prev]);

    // Cập nhật hợp đồng
    setContracts(prev => prev.map(c => c.id === params.contractId ? {
      ...c,
      firstMonthRentPaid: true,
      initialDepositCode: depositCode
    } : c));

    // Cập nhật phòng
    setRooms(prev => prev.map(r => r.roomCode === params.roomCode ? {
      ...r,
      hasDeposit: true,
      firstMonthRentPaid: true,
      firstMonthPeriod: rentPeriodNote
    } : r));

    logSecurity('PH07_PAYMENT_RECORDED', `Room ${params.roomCode} recorded deposit (${params.depositAmount}) & 1st rent (${params.firstMonthRentAmount}) via txn ${params.transactionCode}`);
    return { success: true, message: 'Ghi nhận hoàn tất một tháng tiền cọc và một tháng tiền thuê đầu thành công! Đã lưu 2 dòng riêng biệt.' };
  };

  // UC-PH-07 AF-03: Đính chính thông tin chứng cứ chuyển khoản có lịch sử
  const correctInitialPaymentPH07 = (id: string, reason: string, updatedFields: Partial<InitialPaymentRecord>) => {
    if (!reason.trim()) {
      return { success: false, message: 'Vui lòng nhập lý do đính chính thông tin.' };
    }
    const record = initialPaymentRecords.find(p => p.id === id);
    if (!record) return { success: false, message: 'Không tìm thấy bản ghi thanh toán.' };

    const correctionHistory = record.correctionHistory || [];
    const now = new Date().toISOString();
    const user = currentUser?.fullName || 'Chủ nhà';

    const historyItems = Object.entries(updatedFields).map(([k, v]) => ({
      field: k,
      oldVal: String((record as any)[k] || ''),
      newVal: String(v || ''),
      reason,
      correctedBy: user,
      correctedAt: now
    }));

    setInitialPaymentRecords(prev => prev.map(p => p.id === id ? {
      ...p,
      ...updatedFields,
      // Không cho sửa đổi số tiền cọc gốc tùy tiện theo BR-UC.PH.07-06
      depositAmount: record.depositAmount,
      correctionHistory: [...correctionHistory, ...historyItems]
    } : p));

    logSecurity('PH07_CORRECTION', `Payment ${id} corrected by ${user}: ${reason}`);
    return { success: true, message: 'Đính chính thông tin chứng từ thành công! Lịch sử đã được ghi nhận.' };
  };

  // UC-PH-05: Kiểm tra điều kiện nhận phòng & xác nhận hoàn tất nhận phòng
  const confirmCheckInPH05 = (roomCode: string, leaseId: string, actualCheckInDate: string, handoverReportId?: string, handoverVersion?: string) => {
    const room = rooms.find(r => r.roomCode === roomCode);
    const contract = contracts.find(c => c.leaseId === leaseId) || contracts.find(c => c.roomCode === roomCode && (c.status === 'Hiệu lực' || c.status === 'Đã ký' || c.status === 'Chờ hiệu lực'));
    const report = handoverReports.find(h => (h.leaseId === leaseId || h.roomCode === roomCode) && h.status === 'Đã xác nhận');

    // Tiêu chí 1: Hợp đồng đã ký
    if (!contract || (!contract.isSignedPaper && contract.status !== 'Hiệu lực' && contract.status !== 'Đã ký' && contract.status !== 'Chờ hiệu lực')) {
      return { success: false, message: 'Tiêu chí 1 Chưa đạt: Hợp đồng chưa ký hoặc chưa có hiệu lực (EF-02).' };
    }

    // Tiêu chí 2 & 3: Cọc 1 tháng & Thuê đầu 1 tháng tại UC-PH-07
    if (!contract.firstMonthRentPaid || !room?.firstMonthRentPaid || !room?.hasDeposit) {
      return { success: false, message: 'Tiêu chí 2 & 3 Chưa đạt: Chưa thu đủ 1 tháng tiền cọc và 1 tháng tiền thuê đầu tại UC-PH-07 (EF-01). Không cho nhận phòng trước rồi nộp bù.' };
    }

    // Tiêu chí 4: Bàn giao nhận thực tế hoàn tất & UC-BG03 Đã xác nhận (hai bên đã ký tay)
    if (!report) {
      return { success: false, message: 'Tiêu chí 4 Chưa đạt: Biên bản nhận phòng UC-BG03 chưa ở trạng thái Đã xác nhận (chưa có chữ ký tay hai bên).' };
    }

    // Lưu ngày nhận phòng thực tế, chuyển trạng thái Đang thuê theo UC-PH-04
    setRooms(prev => prev.map(r => r.roomCode === roomCode ? {
      ...r,
      status: 'Đang thuê',
      currentTenantId: contract.tenantId,
      currentTenantName: contract.tenantName,
      contractStartDate: actualCheckInDate,
      contractEndDate: contract.endDate,
      currentContractId: contract.id,
      currentLeaseId: contract.leaseId,
      totalOccupants: Math.max(1, r.totalOccupants),
      firstMonthPeriod: `Từ ${actualCheckInDate} đến cuối kỳ`
    } : r));

    setContracts(prev => prev.map(c => c.id === contract.id ? {
      ...c,
      status: 'Hiệu lực',
      actualCheckInDate
    } : c));

    // Phát sự kiện Bắt đầu lần thuê cho HSKT-02 để kiểm tra người ở cùng Dự kiến (không tự chuyển sang Đang cư trú)
    const newEvent: LeaseStartEvent = {
      eventId: 'evt_ls_' + Date.now(),
      roomCode,
      contractId: contract.id,
      leaseId: contract.leaseId,
      checkInDate: actualCheckInDate,
      handoverReportId: report.id,
      handoverVersion: handoverVersion || 'v1.0',
      emittedAt: new Date().toISOString(),
      coTenantsChecked: true,
      syncStatus: 'Đã gửi HSKT-02'
    };
    setLeaseStartEvents(prev => [newEvent, ...prev]);

    // Ghi lịch sử phòng
    const checkInLog: RoomHistoryLog = {
      id: 'rl_' + Date.now() + '_checkin',
      roomCode,
      field: 'Tiếp nhận phòng (UC-PH-05)',
      oldValue: `Trạng thái: ${room?.status || 'Trống'}`,
      newValue: `Đang thuê (Ngày nhận thực tế: ${actualCheckInDate}, Khách: ${contract.tenantName})`,
      changedBy: currentUser?.fullName || 'Chủ nhà',
      changedAt: new Date().toISOString()
    };
    setRoomHistory(prev => [checkInLog, ...prev]);

    logSecurity('PH05_CHECKIN_CONFIRMED', `Room ${roomCode} check-in confirmed on ${actualCheckInDate}. Status -> Đang thuê. Event ${newEvent.eventId} emitted to HSKT-02`);
    return { success: true, message: `Xác nhận nhận phòng hoàn tất! Phòng ${roomCode} đã chuyển sang Đang thuê. Kỳ thuê đầu được chốt từ ngày ${actualCheckInDate}. Sự kiện Bắt đầu lần thuê đã phát tới HSKT-02.` };
  };

  // UC-PH-06: Ghi nhận điều kiện còn thiếu
  const saveMissingConditionPH06 = (params: {
    roomCode: string;
    contractId: string;
    leaseId: string;
    missingContractEffect: boolean;
    missingHandover: boolean;
    notes: string;
    isTenantStoppedProcedure?: boolean;
    tenantStopReason?: string;
    tenantStopContent?: string;
  }) => {
    // BR-UC.PH.06-01 & BR-UC.PH.06-02: Bắt buộc hai khoản thanh toán đã Đạt
    const room = rooms.find(r => r.roomCode === params.roomCode);
    const contract = contracts.find(c => c.id === params.contractId);
    if (!room?.hasDeposit || !room?.firstMonthRentPaid || !contract?.firstMonthRentPaid) {
      return {
        success: false,
        message: 'Khóa chức năng UC-PH-06: Hai khoản tiền cọc 1 tháng và tiền thuê đầu 1 tháng chưa được xác minh Đạt. Vui lòng tra soát tại UC-PH-07 (BR-UC.PH.06-01/02).'
      };
    }

    if (!params.notes.trim() && !params.isTenantStoppedProcedure) {
      return { success: false, message: 'EF-01: Vui lòng nhập nội dung ghi chú điều kiện còn thiếu.' };
    }

    const newLog: MissingConditionLog = {
      id: 'mc_' + Date.now(),
      roomCode: params.roomCode,
      contractId: params.contractId,
      leaseId: params.leaseId,
      missingContractEffect: params.missingContractEffect,
      missingHandover: params.missingHandover,
      notes: params.notes,
      isTenantStoppedProcedure: params.isTenantStoppedProcedure,
      tenantStopReason: params.tenantStopReason,
      tenantStopContent: params.tenantStopContent,
      loggedBy: currentUser?.fullName || 'Chủ nhà',
      loggedAt: new Date().toISOString(),
      status: params.isTenantStoppedProcedure ? 'Khách dừng thủ tục' : 'Đang theo dõi'
    };

    setMissingConditionLogs(prev => [newLog, ...prev]);

    // BR-UC.PH.06-05: Khách dừng thủ tục không đồng nghĩa hợp đồng bị hủy, tiền được hoàn hay phòng đổi trạng thái
    logSecurity('PH06_MISSING_CONDITION_SAVED', `Room ${params.roomCode} recorded missing condition. Status: ${newLog.status}`);
    return {
      success: true,
      message: params.isTenantStoppedProcedure
        ? 'Đã ghi nhận khách chủ động dừng làm thủ tục. Hợp đồng và phòng được giữ nguyên theo BR-UC.PH.06-05.'
        : 'Đã lưu ghi nhận điều kiện còn thiếu thành công! Phòng giữ nguyên trạng thái để theo dõi.'
    };
  };

  const updateExpectedReturnDatePH11_12 = (params: {
    roomCode: string;
    leaseId: string;
    expectedDate: string;
    confirmSource: 'trực tiếp' | 'điện thoại' | 'tin nhắn' | 'khác';
    confirmedAt: string;
    exchangeContent: string;
    reason?: string;
  }) => {
    const room = rooms.find(r => r.roomCode === params.roomCode);
    if (!room) return { success: false, message: 'Không tìm thấy phòng.' };

    const expDate = new Date(params.expectedDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Threshold 15 days rule (BR-UC.PH.04-05, BR-UC.PH.11-03)
    const newStatus = diffDays <= 15 ? 'Sắp trả' : 'Đang thuê';

    setRooms(prev => prev.map(r => r.roomCode === params.roomCode ? {
      ...r,
      expectedReturnDate: params.expectedDate,
      status: newStatus
    } : r));

    const newLog: ReturnPlanLog = {
      id: 'rp_' + Date.now(),
      roomCode: params.roomCode,
      leaseId: params.leaseId,
      expectedDate: params.expectedDate,
      oldDate: room.expectedReturnDate,
      reason: params.reason,
      confirmSource: params.confirmSource,
      confirmedAt: params.confirmedAt,
      exchangeContent: params.exchangeContent,
      loggedBy: currentUser?.fullName || 'Chủ nhà',
      loggedAt: new Date().toISOString(),
      status: 'Còn theo dõi'
    };

    setReturnPlans(prev => [newLog, ...prev]);
    logSecurity('RETURN_DATE_RECORDED', `Room ${params.roomCode} return date: ${params.expectedDate} (diff: ${diffDays}d -> ${newStatus})`);
    return { success: true, message: `Đã lưu ngày dự kiến trả phòng. Trạng thái phòng hiện tại: ${newStatus}` };
  };

  const recordTenantContactPH13 = (params: {
    roomCode: string;
    leaseId: string;
    contactTimeActual: string;
    contactSource: 'trực tiếp' | 'điện thoại' | 'tin nhắn' | 'khác';
    contactResult: 'Chưa phản hồi' | 'Không tiếp tục thuê – Chưa xác nhận ngày dự kiến trả' | 'Chờ đối chiếu' | 'Đồng ý tiếp tục thuê';
    content: string;
    nextContactDate?: string;
    isAppointmentOnly?: boolean;
    contactChannelSource?: 'UC-PH-13' | 'UC-BG09' | 'UC-PH-09';
  }) => {
    // BR-UC.PH.13-14 & EF-04 / AF-07: Kiểm tra mâu thuẫn căn cứ ASIS-04 Tiếp tục thuê
    const activeRenewal = contracts.find(c => c.roomCode === params.roomCode && c.contractType === 'Hợp đồng nối tiếp' && (c.status === 'Hiệu lực' || c.status === 'Chờ hiệu lực'));
    let effectiveResult = params.contactResult;
    let isConflict = false;
    let hdt06Ref: string | undefined = undefined;

    if (params.contactResult === 'Không tiếp tục thuê – Chưa xác nhận ngày dự kiến trả' && activeRenewal) {
      effectiveResult = 'Chờ đối chiếu';
      isConflict = true;
      hdt06Ref = 'EVT-CONFLICT-HDT06-' + Date.now().toString().slice(-6);
    }

    const newLog: TenantContactLog = {
      id: 'tc_' + Date.now(),
      roomCode: params.roomCode,
      leaseId: params.leaseId,
      contactTimeActual: params.contactTimeActual,
      systemInputTime: new Date().toISOString(),
      contactSource: params.contactSource,
      contactResult: effectiveResult,
      content: params.content,
      nextContactDate: params.nextContactDate,
      loggedBy: currentUser?.fullName || 'Chủ nhà',
      conflictFlag: isConflict,
      hdt06Reference: hdt06Ref,
      contactChannelSource: params.contactChannelSource || 'UC-PH-13',
      isAppointmentOnly: params.isAppointmentOnly
    };

    setContactLogs(prev => [newLog, ...prev]);

    if (isConflict) {
      logSecurity('PH13_CONFLICT_DETECTED', `Room ${params.roomCode} feedback conflict with ASIS-04. Logged as Chờ đối chiếu (${hdt06Ref})`);
      return {
        success: true,
        logId: newLog.id,
        isConflict: true,
        message: `Phản hồi thực tế mâu thuẫn với hợp đồng nối tiếp ASIS-04 (${activeRenewal?.id}). Đã lưu sự kiện Chờ đối chiếu (${hdt06Ref}) và gửi tham chiếu sang UC-HDT-06 theo BR-UC.PH.13-14. Không đổi nhãn tiếp tục thuê hiện hành.`
      };
    }

    logSecurity('PH13_CONTACT_LOGGED', `Room ${params.roomCode} contact logged: ${params.contactResult} via ${params.contactSource}`);
    return {
      success: true,
      logId: newLog.id,
      isConflict: false,
      message: params.isAppointmentOnly
        ? 'Đã lưu lịch hẹn liên hệ tiếp theo riêng vào nhật ký (Trường hợp 09).'
        : 'Đã lưu ghi nhận kết quả liên hệ khách thuê thành công!'
    };
  };

  // UC-PH-14: Hủy kế hoạch trả phòng tự động khi hợp đồng tiếp tục thuê có hiệu lực
  const autoCancelReturnPlanPH14 = (roomCode: string, renewalContractId?: string) => {
    const room = rooms.find(r => r.roomCode === roomCode);
    if (!room) return { success: false, message: 'Không tìm thấy thông tin phòng.' };

    const renewal = renewalContractId
      ? contracts.find(c => c.id === renewalContractId)
      : contracts.find(c => c.roomCode === roomCode && c.contractType === 'Hợp đồng nối tiếp' && c.status === 'Hiệu lực');

    if (!renewal || renewal.status !== 'Hiệu lực') {
      return { success: false, message: 'EF-01: Chưa có hợp đồng nối tiếp mới đã ký và có hiệu lực theo UC-HDT-07. Giữ nguyên kế hoạch trả và trạng thái phòng.' };
    }

    // Tự đánh dấu kế hoạch cũ Đã hủy do gia hạn
    setRooms(prev => prev.map(r => r.roomCode === roomCode ? {
      ...r,
      status: 'Đang thuê', // BR-UC.PH.14-03
      expectedReturnDate: undefined,
      returnPlanCancelled: true,
      returnPlanCancelReason: `Đã hủy do gia hạn (Hợp đồng: ${renewal.id})`
    } : r));

    setReturnPlans(prev => prev.map(p => (p.roomCode === roomCode && p.status === 'Còn theo dõi') ? {
      ...p,
      status: 'Đã hủy',
      reason: `Đã hủy do gia hạn hợp đồng nối tiếp ${renewal.id}`
    } : p));

    // Lịch sử phòng
    const cancelLog: RoomHistoryLog = {
      id: 'rl_' + Date.now() + '_cancel_plan',
      roomCode,
      field: 'Hủy kế hoạch trả phòng tự động (UC-PH-14)',
      oldValue: `Kế hoạch trả ngày ${room.expectedReturnDate || 'đang theo dõi'}`,
      newValue: `Đã hủy do gia hạn (Hợp đồng mới có hiệu lực: ${renewal.id}, Phòng giữ Đang thuê)`,
      changedBy: 'Hệ thống tự động (UC-PH-14)',
      changedAt: new Date().toISOString()
    };
    setRoomHistory(prev => [cancelLog, ...prev]);

    logSecurity('PH14_PLAN_AUTO_CANCELLED', `Room ${roomCode} return plan auto-cancelled due to renewal ${renewal.id}. Status -> Đang thuê.`);
    return {
      success: true,
      message: `Hệ thống đã tự động hủy kế hoạch trả cũ do hợp đồng nối tiếp ${renewal.id} đã có hiệu lực (BR-UC.PH.14-02). Phòng giữ trạng thái Đang thuê.`
    };
  };

  // UC-PH-15: Kiểm tra kết quả tiếp tục thuê
  const checkExtensionResultPH15 = (roomCode: string) => {
    const activeContract = contracts.find(c => c.roomCode === roomCode && (c.status === 'Hiệu lực' || c.contractType === 'Hợp đồng lần đầu'));
    const renewalContract = contracts.find(c => c.roomCode === roomCode && c.contractType === 'Hợp đồng nối tiếp');

    if (!renewalContract) {
      return {
        result: 'Chưa có căn cứ' as const,
        caseType: 'Trường hợp 02' as const,
        reason: 'Chưa có hợp đồng mới được lập trên hệ thống. Khách chưa có bằng chứng hợp lệ về việc tiếp tục thuê.',
        activeContract,
        renewalContract: undefined
      };
    }

    if (renewalContract.status === 'Hiệu lực') {
      return {
        result: 'Có bằng chứng hợp lệ về việc tiếp tục thuê' as const,
        caseType: 'Trường hợp 03' as const,
        reason: `Hợp đồng nối tiếp ${renewalContract.id} đã ký và đang có hiệu lực pháp lý (ngày ký: ${renewalContract.signedDate || 'Đã ký'}). Kế hoạch trả cũ đã tự hủy, phòng duy trì trạng thái Đang thuê và kế thừa cọc gốc ${renewalContract.depositAmount.toLocaleString('vi-VN')} đ (BR-UC.PH.15-03).`,
        activeContract,
        renewalContract
      };
    }

    // Trường hợp 01: Nháp hoặc Chờ hiệu lực
    return {
      result: 'Chưa có căn cứ' as const,
      caseType: 'Trường hợp 01' as const,
      reason: `Hợp đồng nối tiếp ${renewalContract.id} hiện ở trạng thái "${renewalContract.status}" (chưa có hiệu lực hoặc chưa đến ngày bắt đầu ${renewalContract.startDate}). Tiếp tục theo dõi kế hoạch trả hiện tại, không tự hủy kế hoạch.`,
      activeContract,
      renewalContract
    };
  };

  // UC-PH-08: Kiểm tra kết quả trả phòng & cập nhật trạng thái Trống
  const confirmReturnStep305AndVacantPH08 = (roomCode: string, leaseId: string, actualReturnDate?: string) => {
    const inspection = returnInspections.find(i => (i.roomCode === roomCode && i.leaseId === leaseId) || (i.roomCode === roomCode && i.step304Status === 'Đã nhận lại'));
    if (!inspection || inspection.step304Status !== 'Đã nhận lại') {
      return { success: false, message: 'EF-01: Chưa có kết quả nhận lại thực tế tại ASIS-02 bước 3.04 (3.04 != Đã nhận lại). Giữ trạng thái phòng hiện tại.' };
    }
    if (!inspection.step305Confirmed) {
      return { success: false, message: 'EF-01: Kết quả 3.04 = Đã nhận lại nhưng chưa có xác nhận độc lập tại bước 3.05 của Chủ nhà (người xác nhận và thời điểm/bằng chứng). Vui lòng xác nhận 3.05 tại ASIS-02 trước khi cập nhật Trống (BR-UC.PH.08-01).' };
    }

    const returnDate = actualReturnDate || inspection.inspectionDate || new Date().toISOString().split('T')[0];
    const room = rooms.find(r => r.roomCode === roomCode);

    setRooms(prev => prev.map(r => r.roomCode === roomCode ? {
      ...r,
      status: 'Trống',
      hasDeposit: false,
      firstMonthRentPaid: false,
      firstMonthPeriod: '',
      currentTenantId: undefined,
      currentTenantName: undefined,
      contractStartDate: undefined,
      contractEndDate: undefined,
      currentContractId: undefined,
      currentLeaseId: undefined,
      expectedReturnDate: undefined,
      totalOccupants: 0
    } : r));

    // Kết thúc kế hoạch trả nếu có
    setReturnPlans(prev => prev.map(p => (p.roomCode === roomCode && p.status === 'Còn theo dõi') ? {
      ...p,
      status: 'Đã kết thúc'
    } : p));

    // BR-UC.PH.08-03: Tự lưu liên kết hợp đồng, khách thuê, người ở cùng và biên bản vào lịch sử lần thuê
    const vacateLog: RoomHistoryLog = {
      id: 'rl_' + Date.now() + '_vacate',
      roomCode,
      field: 'Kết thúc lần thuê thực tế (UC-PH-08)',
      oldValue: `Trạng thái: ${room?.status || 'Đang thuê'} (Khách: ${room?.currentTenantName || '—'})`,
      newValue: `Trạng thái: Trống (Ngày nhận lại thực tế: ${returnDate}, Biên bản: ${inspection.id}, Xác nhận 3.05 bởi ${inspection.step305ConfirmedBy || 'Chủ nhà'})`,
      changedBy: currentUser?.fullName || 'Chủ nhà',
      changedAt: new Date().toISOString()
    };
    setRoomHistory(prev => [vacateLog, ...prev]);

    logSecurity('PH08_ROOM_VACATED', `Room ${roomCode} marked Trống following 3.05 handover confirmation on ${returnDate}.`);
    return {
      success: true,
      message: `Cập nhật trạng thái Trống thành công! Ngày kết thúc lần thuê thực tế (${returnDate}) đã được ghi nhận. Không cần chờ quyết toán tiền cọc theo BR-UC.PH.08-02.`
    };
  };

  // UC-PH-09: Ghi nhận chưa bàn giao xong
  const saveUnfinishedHandoverPH09 = (params: {
    roomCode: string;
    leaseId: string;
    contractId: string;
    handoverVersion: string;
    reason: string;
    obstacleContent: string;
    existingId?: string;
  }) => {
    // EF-02: Lý do hoặc nội dung bị bỏ trống
    if (!params.reason.trim()) {
      return { success: false, message: 'EF-02: Lý do khách chưa thể tiếp tục bàn giao là bắt buộc.' };
    }
    if (!params.obstacleContent.trim()) {
      return { success: false, message: 'EF-02: Nội dung vướng mắc thực tế là bắt buộc.' };
    }

    // BR-UC.PH.09-01 & EF-01: Chỉ tạo mới hoặc cập nhật khi kết quả thực tế vẫn là Chưa nhận lại
    const inspection = returnInspections.find(i => (i.roomCode === params.roomCode && i.leaseId === params.leaseId) || i.roomCode === params.roomCode);
    if (inspection && inspection.step304Status === 'Đã nhận lại') {
      return {
        success: false,
        message: 'EF-01: Kết quả bàn giao của phòng đã chuyển thành Đã nhận lại thực tế. Không cho phép tạo/cập nhật ghi nhận chưa bàn giao xong (BR-UC.PH.09-01).'
      };
    }

    const now = new Date().toISOString();
    const user = currentUser?.fullName || 'Chủ nhà';

    // AF-01: Cập nhật nội dung có lưu lịch sử
    if (params.existingId) {
      const existing = unfinishedHandoverLogs.find(u => u.id === params.existingId);
      if (existing) {
        const hist = existing.history || [];
        const newHistItem = {
          reason: existing.reason,
          obstacleContent: existing.obstacleContent,
          changedBy: user,
          changedAt: now
        };

        setUnfinishedHandoverLogs(prev => prev.map(u => u.id === params.existingId ? {
          ...u,
          reason: params.reason.trim(),
          obstacleContent: params.obstacleContent.trim(),
          updatedAt: now,
          updatedBy: user,
          history: [...hist, newHistItem]
        } : u));

        logSecurity('PH09_UPDATED', `Room ${params.roomCode} unfinished handover updated by ${user}`);
        return {
          success: true,
          message: 'Cập nhật nội dung vướng mắc bàn giao thành công! Lịch sử đã được lưu lại (AF-01).'
        };
      }
    }

    // Tạo mới
    const newRecord: UnfinishedHandoverLog = {
      id: 'ufh_' + Date.now(),
      roomCode: params.roomCode,
      leaseId: params.leaseId,
      contractId: params.contractId,
      handoverVersion: params.handoverVersion || 'v1.0',
      step304Status: 'Chưa nhận lại',
      notFinishedIndicator: 'Chưa kết thúc thuê', // BR-UC.PH.09-03
      reason: params.reason.trim(),
      obstacleContent: params.obstacleContent.trim(),
      loggedBy: user,
      loggedAt: now
    };

    setUnfinishedHandoverLogs(prev => [newRecord, ...prev]);

    // BR-UC.PH.09-03: Ghi nhận này không phải trạng thái sử dụng phòng và không làm phòng chuyển Trống
    logSecurity('PH09_CREATED', `Room ${params.roomCode} recorded unfinished handover: ${params.reason}`);
    return {
      success: true,
      message: 'Ghi nhận chưa bàn giao xong thành công! Phòng giữ nguyên trạng thái sử dụng và gắn chỉ báo Chưa kết thúc thuê theo BR-UC.PH.09-03.'
    };
  };

  // ==================== HANDOVER & ASSETS METHODS (QT02) ====================
  const saveInventoryBG01 = (record: InventoryRecord) => {
    setInventoryRecords(prev => {
      const idx = prev.findIndex(r => r.roomCode === record.roomCode && r.expectedBatchCode === record.expectedBatchCode);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = record;
        return updated;
      }
      return [record, ...prev];
    });
    logSecurity('INVENTORY_SAVED', `Room ${record.roomCode} inventory saved. Status: ${record.inventoryStatus}`);
  };

  const saveHandoverConditionBG02 = (condition: HandoverCondition) => {
    setHandoverConditions(prev => {
      const idx = prev.findIndex(c => c.id === condition.id || (c.roomCode === condition.roomCode && c.scope === condition.scope && c.assetName === condition.assetName));
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = condition;
        return updated;
      }
      return [condition, ...prev];
    });
    logSecurity('BG02_CONDITION_SAVED', `Room ${condition.roomCode} condition saved: ${condition.scope}`);
    return { success: true, message: 'Đã lưu hiện trạng bàn giao thành công (UC-BG02)!' };
  };

  const saveHandoverReportBG03 = (report: HandoverReport) => {
    setHandoverReports(prev => {
      const idx = prev.findIndex(r => r.id === report.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = report;
        return updated;
      }
      return [report, ...prev];
    });
  };

  const confirmHandoverSignaturesBG03 = (reportId: string, tenantSigned: boolean, ownerSigned: boolean, paperLocation?: string) => {
    setHandoverReports(prev => prev.map(r => {
      if (r.id !== reportId) return r;
      const bothSigned = tenantSigned && ownerSigned;
      return {
        ...r,
        tenantSignedPaper: tenantSigned ? 'Đã ký giấy' : 'Chưa ký',
        ownerSignedPaper: ownerSigned ? 'Đã ký giấy' : 'Chưa ký',
        status: bothSigned ? 'Đã xác nhận' : r.status,
        paperLocation: paperLocation || r.paperLocation,
        confirmedAt: bothSigned ? new Date().toISOString() : r.confirmedAt
      };
    }));
  };

  const recordIncidentBG04 = (incident: AssetIncident) => {
    setIncidents(prev => {
      const idx = prev.findIndex(i => i.id === incident.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = incident;
        return updated;
      }
      return [incident, ...prev];
    });
  };

  const recordReturnInspectionBG09 = (inspection: ReturnInspection) => {
    setReturnInspections(prev => {
      const idx = prev.findIndex(i => i.id === inspection.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = inspection;
        return updated;
      }
      return [inspection, ...prev];
    });
  };

  const confirmReturnInspectionStep305 = (roomCode: string, leaseId: string, evidence: string) => {
    setReturnInspections(prev => prev.map(i => {
      if (i.roomCode === roomCode && i.leaseId === leaseId) {
        return {
          ...i,
          step304Status: 'Đã nhận lại',
          step305Confirmed: true,
          step305ConfirmedAt: new Date().toISOString(),
          step305ConfirmedBy: currentUser?.fullName || 'Chủ nhà',
          step305Evidence: evidence
        };
      }
      return i;
    }));
    logSecurity('BG09_STEP305_CONFIRMED', `Handover return confirmed 3.05 for room ${roomCode}`);
  };

  const saveAssetComparisonResultBG07 = (result: AssetComparisonResult) => {
    setAssetComparisonResults(prev => {
      const idx = prev.findIndex(r => r.id === result.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = result;
        return updated;
      }
      return [result, ...prev];
    });
  };

  const saveHandoverReturnReportBG11 = (report: HandoverReturnReport) => {
    setHandoverReturnReports(prev => {
      const idx = prev.findIndex(r => r.id === report.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = report;
        return updated;
      }
      return [report, ...prev];
    });
  };

  const confirmFinalReturnReportBG11 = (reportId: string, tenantSignedStatus: 'Khách đã ký' | 'Khách không ký', notSignReason?: string) => {
    setHandoverReturnReports(prev => prev.map(r => {
      if (r.id !== reportId) return r;
      return {
        ...r,
        tenantSignedPaper: tenantSignedStatus,
        tenantNotSignReason: notSignReason,
        ownerSignedPaper: 'Đã ký',
        status: 'Đã xác nhận',
        confirmedAt: new Date().toISOString()
      };
    }));
  };

  // ==================== TENANTS METHODS (QT03) ====================
  const addTenantHSKT01 = (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'createdBy'>) => {
    // Check duplicates
    if (tenantData.idNumber && tenants.some(t => t.idNumber && t.idNumber === tenantData.idNumber)) {
      return { success: false, message: 'Số định danh CCCD đã tồn tại trong hệ thống.' };
    }
    const newTenant: Tenant = {
      ...tenantData,
      id: 'ten_' + Date.now(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.fullName || 'Chủ nhà'
    };
    setTenants(prev => [...prev, newTenant]);
    logSecurity('TENANT_CREATED', `Created tenant ${newTenant.fullName}`);
    return { success: true, tenantId: newTenant.id, message: 'Tạo hồ sơ khách thuê thành công!' };
  };

  const addCoTenantHSKT02 = (coTenant: Omit<CoTenant, 'id'>) => {
    const newCoTenant: CoTenant = {
      ...coTenant,
      id: 'coten_' + Date.now()
    };
    setCoTenants(prev => [...prev, newCoTenant]);
  };

  const updateCoTenantStatusHSKT02 = (coTenantId: string, status: 'Đang cư trú' | 'Đã kết thúc', actualDate?: string, evidence?: string) => {
    setCoTenants(prev => prev.map(c => {
      if (c.id !== coTenantId) return c;
      if (status === 'Đang cư trú') {
        return {
          ...c,
          status,
          actualArrivalDate: actualDate || new Date().toISOString().split('T')[0],
          arrivalVerificationEvidence: evidence || c.arrivalVerificationEvidence
        };
      }
      return {
        ...c,
        status,
        departureDate: actualDate || new Date().toISOString().split('T')[0]
      };
    }));
  };

  const verifyTenantProposalHSKT03 = (proposal: TenantChangeProposal) => {
    setTenantProposals(prev => [proposal, ...prev]);
  };

  const applyTenantUpdateHSKT04 = (tenantId: string, updatedFields: Partial<Tenant>) => {
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, ...updatedFields } : t));
    setTenantHistory(prev => [{
      id: 'th_' + Date.now(),
      tenantId,
      action: 'Cập nhật thông tin khách thuê',
      timestamp: new Date().toISOString(),
      performedBy: currentUser?.fullName || 'Chủ nhà',
      newValues: JSON.stringify(updatedFields)
    }, ...prev]);
  };

  // ==================== CONTRACTS (QT04) ====================
  const addBatchSchedule = (batch: BatchSchedule) => {
    setBatchSchedules(prev => {
      const idx = prev.findIndex(b => b.batchCode === batch.batchCode);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = batch;
        return u;
      }
      return [...prev, batch];
    });
  };

  const createContractDraftHDT02 = (contractData: Omit<Contract, 'id' | 'status' | 'isSignedPaper' | 'version'>) => {
    const contractId = 'HD-' + contractData.roomCode.replace(/\D/g, '') + '-' + Date.now().toString().slice(-4);
    const newContract: Contract = {
      ...contractData,
      id: contractId,
      status: 'Nháp',
      isSignedPaper: false,
      version: 1
    };
    setContracts(prev => [...prev, newContract]);
    logSecurity('CONTRACT_DRAFT_CREATED', `Contract draft ${contractId} created for room ${contractData.roomCode}`);
    return { success: true, contractId, message: 'Lập hợp đồng dự thảo thành công!' };
  };

  const confirmContractSignedHDT04 = (contractId: string, signedDate: string, proofFiles: string[]) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return { success: false, message: 'Không tìm thấy hợp đồng.' };

    const startDate = new Date(contract.startDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const hasEffective = now >= startDate;

    setContracts(prev => prev.map(c => c.id === contractId ? {
      ...c,
      status: hasEffective ? 'Hiệu lực' : 'Chờ hiệu lực',
      isSignedPaper: true,
      signedDate,
      signedProofFiles: proofFiles
    } : c));

    logSecurity('CONTRACT_SIGNED_HDT04', `Contract ${contractId} signed. Effective: ${hasEffective}`);
    return { success: true, message: 'Ghi nhận hợp đồng đã ký thành công!' };
  };

  const createRenewalContractHDT06 = (params: {
    previousContractId: string;
    roomCode: string;
    tenantId: string;
    tenantName: string;
    batchCode: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    terms: string;
  }) => {
    const prevContract = contracts.find(c => c.id === params.previousContractId);
    if (!prevContract) return { success: false, message: 'Không tìm thấy hợp đồng cũ.' };

    const newId = 'HD-' + params.roomCode.replace(/\D/g, '') + '-GIAHAN-' + Date.now().toString().slice(-4);
    const renewalContract: Contract = {
      id: newId,
      contractType: 'Hợp đồng nối tiếp',
      leaseId: prevContract.leaseId, // Cùng chuỗi lần thuê
      roomCode: params.roomCode,
      tenantId: params.tenantId,
      tenantName: params.tenantName,
      batchCode: params.batchCode,
      startDate: params.startDate,
      endDate: params.endDate,
      monthlyRent: params.monthlyRent,
      depositAmount: prevContract.depositAmount, // Kế thừa cọc gốc
      firstMonthRentAmount: params.monthlyRent,
      firstMonthRentPaid: true, // Không thu lại cọc hay tiền thuê kỳ đầu
      paymentMethod: 'Chuyển khoản',
      terms: params.terms,
      status: 'Nháp',
      isSignedPaper: false,
      previousContractId: prevContract.id,
      initialDepositCode: prevContract.initialDepositCode || 'COC-' + params.roomCode,
      version: 1
    };

    setContracts(prev => [...prev, renewalContract]);
    logSecurity('RENEWAL_CONTRACT_CREATED', `Renewal contract ${newId} created for room ${params.roomCode}`);
    return { success: true, contractId: newId, message: 'Lập hợp đồng nối tiếp thành công (kế thừa cọc gốc)!' };
  };

  const activateRenewalContractHDT07 = (contractId: string, signedDate: string, proofFiles: string[]) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract || !contract.previousContractId) {
      return { success: false, message: 'Hợp đồng không hợp lệ.' };
    }

    // Terminate old contract
    setContracts(prev => prev.map(c => {
      if (c.id === contract.previousContractId) {
        return { ...c, status: 'Kết thúc' };
      }
      if (c.id === contractId) {
        return {
          ...c,
          status: 'Hiệu lực',
          isSignedPaper: true,
          signedDate,
          signedProofFiles: proofFiles
        };
      }
      return c;
    }));

    // Auto-cancel old return plan (BR-UC.PH.14-01)
    setRooms(prev => prev.map(r => r.roomCode === contract.roomCode ? {
      ...r,
      status: 'Đang thuê',
      expectedReturnDate: undefined,
      returnPlanCancelled: true,
      returnPlanCancelReason: 'Đã hủy do gia hạn'
    } : r));

    logSecurity('RENEWAL_ACTIVATED_HDT07', `Renewal contract ${contractId} activated. Old contract closed, return plan cancelled.`);
    return { success: true, message: 'Kích hoạt hợp đồng nối tiếp thành công! Kế hoạch trả cũ đã tự hủy do gia hạn.' };
  };

  // ==================== DEPOSIT SETTLEMENT (QT05) ====================
  const saveSettlementSlipQTC01 = (slip: DepositSettlementSlip) => {
    setSettlementSlips(prev => {
      const idx = prev.findIndex(s => s.id === slip.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = slip;
        return u;
      }
      return [slip, ...prev];
    });
  };

  const updateSettlementFeedbackQTC02 = (
    slipId: string,
    feedback: 'Đồng ý' | 'Không đồng ý' | 'Chưa phản hồi' | 'Không liên hệ được',
    reason?: string,
    deductionUpdates?: { id: string; amount: number }[]
  ) => {
    setSettlementSlips(prev => prev.map(s => {
      if (s.id !== slipId) return s;

      let deductions = s.deductions;
      if (deductionUpdates) {
        deductions = deductions.map(d => {
          const upd = deductionUpdates.find(u => u.id === d.id);
          return upd ? { ...d, amount: upd.amount } : d;
        });
      }

      const totalDed = deductions.reduce((sum, d) => sum + d.amount, 0);
      const calculated = s.initialDepositAmount - totalDed;

      let newStatus: DepositSettlementSlip['status'] = s.status;
      if (feedback === 'Đồng ý') newStatus = 'Khách đồng ý';
      else if (feedback === 'Không đồng ý') newStatus = 'Không đồng ý';
      else if (feedback === 'Không liên hệ được') newStatus = 'Không liên hệ được';

      return {
        ...s,
        tenantFeedback: feedback,
        disputeReason: reason || s.disputeReason,
        deductions,
        calculatedResult: calculated,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const confirmSettlementTransferReceiptQTC03 = (
    slipId: string,
    receipt: DepositSettlementSlip['transferReceipt']
  ) => {
    const slip = settlementSlips.find(s => s.id === slipId);
    if (!slip) return { success: false, message: 'Không tìm thấy phiếu quyết toán.' };
    if (slip.status !== 'Khách đồng ý') {
      return { success: false, message: 'Chỉ ghi nhận kết quả khi khách đã đồng ý phương án quyết toán.' };
    }

    setSettlementSlips(prev => prev.map(s => s.id === slipId ? {
      ...s,
      transferReceipt: receipt,
      status: 'Đã có 5.8 – chờ ký biên bản',
      step58Published: true,
      step58PublishedAt: new Date().toISOString()
    } : s));

    logSecurity('SETTLEMENT_CONFIRMED_QTC03', `Settlement ${slipId} confirmed. Published 5.8.`);
    return { success: true, message: 'Ghi nhận kết quả quyết toán cọc thành công! Đã phát hành kết quả 5.8.' };
  };

  // ==================== BILLING (QT06) ====================
  const saveMeterReadingTT01 = (reading: MeterReading) => {
    setMeterReadings(prev => {
      const idx = prev.findIndex(m => m.id === reading.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = reading;
        return u;
      }
      return [reading, ...prev];
    });
  };

  const updateMeterReadingTT02 = (readingId: string, updates: Partial<MeterReading>, reason: string) => {
    setMeterReadings(prev => prev.map(m => m.id === readingId ? {
      ...m,
      ...updates,
      status: 'Nháp – điều chỉnh',
      needsRecalculateFlag: true
    } : m));
    logSecurity('METER_READING_UPDATED_TT02', `Reading ${readingId} updated: ${reason}`);
  };

  const generatePeriodBillTT03 = (roomCode: string, periodCode: string) => {
    const room = rooms.find(r => r.roomCode === roomCode);
    if (!room) return { success: false, message: 'Không tìm thấy phòng.' };

    const reading = meterReadings.find(m => m.roomCode === roomCode && m.periodCode === periodCode);
    if (!reading) {
      return { success: false, message: `Chưa có chỉ số điện nước cho ${periodCode}.` };
    }
    if (reading.pendingVerificationFlag) {
      return { success: false, message: 'Chỉ số điện nước đang chờ xác minh bất thường (UC-TT-01 AF-02). Chưa thể tính tiền.' };
    }

    const price = priceHistory[0] || INITIAL_PRICE_HISTORY[0];

    const elecUsage = reading.verifiedElectricKwh !== undefined ? reading.verifiedElectricKwh : Math.max(0, reading.finalElectricKwh - reading.initialElectricKwh);
    const waterUsage = reading.verifiedWaterM3 !== undefined ? reading.verifiedWaterM3 : Math.max(0, reading.finalWaterM3 - reading.initialWaterM3);

    const elecAmount = elecUsage * price.electricityPrice;
    const waterAmount = waterUsage * price.waterPrice;

    const srvFees = price.services.filter(s => s.status === 'Đang áp dụng').map(s => ({
      name: s.name,
      amount: s.amount
    }));

    const totalSrv = srvFees.reduce((sum, s) => sum + s.amount, 0);

    // Tiền thuê kỳ tiếp theo
    const contract = contracts.find(c => c.roomCode === roomCode && c.status === 'Hiệu lực');
    const nextRent = room.status === 'Trống' ? 0 : (contract?.monthlyRent || 3500000);

    const totalAmount = nextRent + elecAmount + waterAmount + totalSrv;

    const newBill: PeriodBill = {
      id: 'bill_' + roomCode.replace(/\D/g, '') + '_' + Date.now().toString().slice(-4),
      roomCode,
      leaseId: room.currentLeaseId || 'THUE-' + roomCode,
      periodCode,
      servicePeriodFrom: '2026-09-01',
      servicePeriodTo: '2026-09-30',
      nextRentPeriodFrom: '2026-10-01',
      nextRentPeriodTo: '2026-10-31',
      isRentPeriodEnded: room.status === 'Trống',
      nextMonthRentAmount: nextRent,
      electricityUsage: elecUsage,
      electricityRate: price.electricityPrice,
      electricityAmount: elecAmount,
      waterUsage: waterUsage,
      waterRate: price.waterPrice,
      waterAmount: waterAmount,
      serviceFees: srvFees,
      totalAmount,
      isConfirmed: false,
      version: 1
    };

    setPeriodBills(prev => [newBill, ...prev]);
    return { success: true, billId: newBill.id, message: 'Tính tiền kỳ thành công (Bản nháp)!' };
  };

  const confirmPeriodBillTT03 = (billId: string) => {
    const bill = periodBills.find(b => b.id === billId);
    if (!bill) return { success: false, message: 'EF-01: Không tìm thấy bảng tính tiền.' };

    // Kiểm tra cờ Chờ xác minh của chỉ số điện nước theo UC-TT-01 Bước 6
    const reading = meterReadings.find(m => m.roomCode === bill.roomCode && m.periodCode === bill.periodCode);
    if (reading && reading.pendingVerificationFlag) {
      return {
        success: false,
        message: 'UC-TT-01 Bước 6: Chỉ số điện nước của phòng đang gắn cờ "Chờ xác minh" bất thường (AF-02). Chưa thể xác nhận bảng tính tiền TT-03 cho đến khi kiểm tra và xác minh xong.'
      };
    }

    setPeriodBills(prev => prev.map(b => b.id === billId ? {
      ...b,
      isConfirmed: true,
      confirmedAt: new Date().toISOString()
    } : b));
    return { success: true, message: 'Đã xác nhận bảng tính tiền thành công (UC-TT-03)!' };
  };

  // ==================== PAYMENT NOTICES (QT07: UC07.1 -> UC07.3) ====================
  const performReconciliationUC07_1 = (billId: string) => {
    const bill = periodBills.find(b => b.id === billId);
    if (!bill) {
      return { success: false, message: 'EF-01: Không tìm thấy bảng tính tiền nguồn (UC-TT-03).' };
    }
    if (!bill.isConfirmed) {
      return { success: false, message: 'EF-01: Bảng tính tiền chưa được xác nhận tại UC-TT-03. Vui lòng xác nhận trước khi đối chiếu.' };
    }

    const room = rooms.find(r => r.roomCode === bill.roomCode);
    const contract = contracts.find(c => c.leaseId === bill.leaseId);

    // BR-UC07.1-03, BR-UC07.1-06: Xử lý tiền thuê kỳ đầu đã thu tại PH-07
    // Nếu hợp đồng bắt đầu cùng kỳ này và đã thanh toán cọc + thuê tháng đầu
    const isFirstMonthPrepaid: boolean = Boolean(
      contract?.firstMonthRentPaid === true &&
      contract?.startDate &&
      bill.servicePeriodFrom &&
      (contract.startDate.startsWith(bill.servicePeriodFrom.slice(0, 7)) ||
       contract.startDate.startsWith(bill.nextRentPeriodFrom.slice(0, 7)))
    );

    // BR-UC07.1-04, BR-UC07.1-07: Xử lý kỳ cuối sau trả phòng
    // Không tự sinh tiền thuê tháng mới sau khi phòng đã được nhận lại thực tế
    const isRentEnded = Boolean(bill.isRentPeriodEnded || room?.status === 'Trống');

    const nextRentAmount = isRentEnded ? 0 : (isFirstMonthPrepaid ? 0 : bill.nextMonthRentAmount);
    const nextRentStatus: ReceivableReconciliation['nextRentStatus'] = isRentEnded
      ? 'Không phát sinh'
      : (isFirstMonthPrepaid ? 'Đã thu' : 'Chưa thu');

    // Nhóm 2: Tiền điện, nước, phí dịch vụ của kỳ vừa sử dụng (trả sau)
    const serviceTotal = (bill.electricityAmount || 0) + (bill.waterAmount || 0) +
      (bill.serviceFees?.reduce((sum, f) => sum + f.amount, 0) || 0) + (bill.adjustmentAmount || 0);

    // BR-UC07.1-01, BR-UC07.1-05: Nợ cũ chỉ để tra cứu, không cộng dồn vào tổng kỳ mới
    const overdueDebt = paymentNotices.find(n =>
      n.roomCode === bill.roomCode &&
      n.paymentStatus === 'Chưa thu' &&
      n.status === 'Đang hiệu lực' &&
      n.periodCode !== bill.periodCode
    );

    // Tổng tiền còn phải trả thực tế sau khi loại bỏ tiền cọc, tiền thuê đã trả trước
    const netReceivable = nextRentAmount + serviceTotal;

    const recId = 'rec_' + bill.roomCode.replace(/\D/g, '') + '_' + Date.now().toString().slice(-4);
    const result: ReceivableReconciliation = {
      id: recId,
      roomCode: bill.roomCode,
      leaseId: bill.leaseId,
      periodCode: bill.periodCode,
      billId: bill.id,
      nextRentPeriodFrom: bill.nextRentPeriodFrom,
      nextRentPeriodTo: bill.nextRentPeriodTo,
      nextRentAmount,
      nextRentStatus,
      nextRentPrepaidAtPH07: isFirstMonthPrepaid,
      servicePeriodFrom: bill.servicePeriodFrom,
      servicePeriodTo: bill.servicePeriodTo,
      electricityUsage: bill.electricityUsage,
      electricityRate: bill.electricityRate,
      electricityAmount: bill.electricityAmount,
      waterUsage: bill.waterUsage,
      waterRate: bill.waterRate,
      waterAmount: bill.waterAmount,
      serviceFees: bill.serviceFees || [],
      adjustmentAmount: bill.adjustmentAmount,
      adjustmentReason: bill.adjustmentReason,
      serviceTotalAmount: serviceTotal,
      serviceStatus: 'Chưa thu',
      overdueDebtReference: overdueDebt ? {
        noticeCode: overdueDebt.noticeCode,
        amount: overdueDebt.totalAmount,
        dueDate: overdueDebt.dueDate,
        noticeId: overdueDebt.id
      } : undefined,
      netReceivableAmount: netReceivable,
      isZeroBalance: netReceivable === 0,
      zeroBalanceMessage: netReceivable === 0
        ? 'AF-01: Không có khoản còn phải thu (Tổng = 0 đ). Trạng thái: Đã thanh toán. Không tạo khoản phải thu mới và không tạo mã QR có số tiền bằng 0.'
        : undefined,
      isReconciled: false
    };

    setReconciliations(prev => [result, ...prev.filter(r => r.billId !== billId)]);

    if (netReceivable === 0) {
      return {
        success: true,
        result,
        message: 'AF-01: Tổng số tiền còn phải thu bằng 0 đ (Đã thanh toán trước/Không phát sinh). Trạng thái Đã thanh toán, không tạo mã QR 0 đ.'
      };
    }

    return {
      success: true,
      result,
      message: 'Đối chiếu thành công! Dữ liệu 2 nhóm tiền và công nợ cũ đã được phân tách rõ ràng.'
    };
  };

  const confirmReconciliationUC07_1 = (reconciliationId: string) => {
    const rec = reconciliations.find(r => r.id === reconciliationId);
    if (!rec) return { success: false, message: 'EF-01: Không tìm thấy hồ sơ đối chiếu.' };

    setReconciliations(prev => prev.map(r => r.id === reconciliationId ? {
      ...r,
      isReconciled: true,
      reconciledAt: new Date().toISOString(),
      reconciledBy: currentUser?.fullName || 'Chủ nhà'
    } : r));

    logSecurity('RECONCILIATION_CONFIRMED_07_1', `Reconciliation ${reconciliationId} for room ${rec.roomCode} confirmed.`);
    return { success: true, message: 'Đã xác nhận đối chiếu thành công (UC07.1)! Chuyển sang lập thông báo thanh toán.' };
  };

  const generatePaymentNotice07_2 = (billId: string, dueDate: string, reconciliationId?: string) => {
    const bill = periodBills.find(b => b.id === billId);
    if (!bill || !bill.isConfirmed) {
      return { success: false, message: 'EF-01: Bảng tính tiền chưa được xác nhận tại UC-TT-03.' };
    }

    // BR-UC07.2-05: Khi lập thông báo mới, User phải chọn hạn thanh toán không trước ngày phát hành
    const todayStr = new Date().toISOString().split('T')[0];
    if (dueDate < todayStr) {
      return { success: false, message: `BR-UC07.2-05: Hạn thanh toán (${dueDate}) không được trước ngày phát hành (${todayStr}).` };
    }

    // BR-UC07.2-09: Phải có tài khoản ngân hàng nhận tiền
    const bank = activeBankAccount || INITIAL_BANK_ACCOUNTS[0];
    if (!bank) {
      return { success: false, message: 'EF-01 / BR-UC07.2-09: Chưa thiết lập tài khoản ngân hàng nhận tiền tại Cài đặt (UC-CH-02). Không thể tạo mã QR.' };
    }

    const rec = reconciliations.find(r => r.id === reconciliationId || r.billId === billId);
    const room = rooms.find(r => r.roomCode === bill.roomCode);
    const contract = contracts.find(c => c.leaseId === bill.leaseId);

    // Tính toán số tiền theo 2 nhóm (BR-UC07.2-02, BR-UC07.1-02)
    const isRentEnded = Boolean(bill.isRentPeriodEnded || room?.status === 'Trống');
    const isFirstMonthPrepaid: boolean = Boolean(
      contract?.firstMonthRentPaid === true &&
      contract?.startDate &&
      bill.servicePeriodFrom &&
      (contract.startDate.startsWith(bill.servicePeriodFrom.slice(0, 7)) ||
       contract.startDate.startsWith(bill.nextRentPeriodFrom.slice(0, 7)))
    );

    const nextRentAmount = isRentEnded ? 0 : (isFirstMonthPrepaid ? 0 : bill.nextMonthRentAmount);
    const serviceTotal = (bill.electricityAmount || 0) + (bill.waterAmount || 0) +
      (bill.serviceFees?.reduce((s, f) => s + f.amount, 0) || 0) + (bill.adjustmentAmount || 0);

    const totalAmount = nextRentAmount + serviceTotal;

    // AF-02: Không có khoản phải thu
    if (totalAmount <= 0) {
      return { success: false, message: 'AF-02: Tổng số tiền còn phải thu bằng 0 đ. Không tạo thông báo và không tạo mã QR có số tiền bằng 0.' };
    }

    // Kiểm tra thông báo đang hiệu lực (BR-UC07.2-01)
    const existingActive = paymentNotices.find(n => n.roomCode === bill.roomCode && n.periodCode === bill.periodCode && n.status === 'Đang hiệu lực');
    if (existingActive) {
      return {
        success: false,
        message: `BR-UC07.2-01: Phòng ${bill.roomCode} đã có thông báo ${existingActive.noticeCode} đang hiệu lực. Hãy dùng chức năng Thay thế thông báo (AF-01) nếu cần cập nhật.`
      };
    }

    // Overdue debt reference (chỉ tra cứu, không cộng dồn - BR-UC07.2-02)
    const overdueDebt = paymentNotices.find(n =>
      n.roomCode === bill.roomCode &&
      n.paymentStatus === 'Chưa thu' &&
      n.status === 'Đang hiệu lực' &&
      n.periodCode !== bill.periodCode
    );

    const noticeId = 'not_' + bill.roomCode.replace(/\D/g, '') + '_' + Date.now().toString().slice(-4);
    const noticeCode = 'TB-' + bill.roomCode.replace(/\D/g, '') + '-' + bill.periodCode.replace(/\D/g, '');

    const notice: PaymentNotice = {
      id: noticeId,
      noticeCode,
      roomCode: bill.roomCode,
      leaseId: bill.leaseId,
      periodCode: bill.periodCode,
      servicePeriod: `${bill.servicePeriodFrom} - ${bill.servicePeriodTo}`,
      nextRentPeriod: isRentEnded ? 'Không phát sinh (Đã trả phòng)' : `${bill.nextRentPeriodFrom} - ${bill.nextRentPeriodTo}`,
      dueDate,
      originalDueDate: dueDate,
      totalAmount,
      status: 'Đang hiệu lực',
      paymentStatus: 'Chưa thu',
      reconciliationId: rec?.id,
      breakdown: {
        nextRentAmount,
        nextRentPeriodFrom: bill.nextRentPeriodFrom,
        nextRentPeriodTo: bill.nextRentPeriodTo,
        isRentEnded,
        nextRentPrepaid: isFirstMonthPrepaid,
        electricityAmount: bill.electricityAmount,
        electricityUsage: bill.electricityUsage,
        electricityRate: bill.electricityRate,
        waterAmount: bill.waterAmount,
        waterUsage: bill.waterUsage,
        waterRate: bill.waterRate,
        serviceFees: bill.serviceFees || [],
        adjustmentAmount: bill.adjustmentAmount,
        adjustmentReason: bill.adjustmentReason
      },
      priorDebtReference: overdueDebt ? {
        noticeCode: overdueDebt.noticeCode,
        amount: overdueDebt.totalAmount,
        dueDate: overdueDebt.dueDate,
        noticeId: overdueDebt.id
      } : undefined,
      qrBankSnapshot: {
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
        accountHolder: bank.accountHolder,
        transferContent: `${bill.roomCode.replace(/\D/g, '')} ${bill.periodCode.replace(/\s+/g, '')}`,
        amount: totalAmount
      },
      createdAt: new Date().toISOString()
    };

    setPaymentNotices(prev => [notice, ...prev]);
    logSecurity('PAYMENT_NOTICE_CREATED_07_2', `Notice ${noticeCode} created with QR fixed amount ${totalAmount} đ`);
    return { success: true, noticeId, message: 'Lập thông báo thanh toán và mã QR thành công (UC07.2)!' };
  };

  const replacePaymentNotice07_2 = (oldNoticeId: string, reason?: string) => {
    const oldNotice = paymentNotices.find(n => n.id === oldNoticeId);
    if (!oldNotice) return { success: false, message: 'EF-01: Không tìm thấy thông báo cũ.' };

    // AF-03 / BR-UC07.2-06: Không thay thế thông báo Đã thu
    if (oldNotice.paymentStatus === 'Đã thu') {
      return { success: false, message: 'AF-03 / BR-UC07.2-06: Thông báo đã ở trạng thái Đã thu, không được thay thế để ghi đè thực nhận.' };
    }

    const bank = activeBankAccount || INITIAL_BANK_ACCOUNTS[0];
    if (!bank) {
      return { success: false, message: 'EF-01: Chưa thiết lập tài khoản ngân hàng nhận tiền tại Cài đặt.' };
    }

    const newId = 'not_' + Date.now().toString().slice(-6);
    const newCode = oldNotice.noticeCode.includes('-R')
      ? oldNotice.noticeCode + '1'
      : oldNotice.noticeCode + '-R';

    // BR-UC07.2-05: Khi thay thế thông báo chưa thu, hệ thống GIỮ NGUYÊN HẠN THANH TOÁN BAN ĐẦU (kể cả khi đã quá hạn)
    const newNotice: PaymentNotice = {
      ...oldNotice,
      id: newId,
      noticeCode: newCode,
      dueDate: oldNotice.originalDueDate, // Giữ nguyên hạn gốc ban đầu
      originalDueDate: oldNotice.originalDueDate,
      replacedNoticeId: oldNoticeId,
      status: 'Đang hiệu lực',
      qrBankSnapshot: {
        ...oldNotice.qrBankSnapshot,
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
        accountHolder: bank.accountHolder
      },
      createdAt: new Date().toISOString()
    };

    // Đánh dấu thông báo cũ là Đã thay thế và vô hiệu hóa QR cũ
    setPaymentNotices(prev => [
      newNotice,
      ...prev.map(n => n.id === oldNoticeId ? {
        ...n,
        status: 'Đã thay thế' as const,
        replacedByNoticeId: newId
      } : n)
    ]);

    logSecurity('PAYMENT_NOTICE_REPLACED_07_2', `Replaced notice ${oldNotice.noticeCode} with ${newCode}. Kept original due date ${oldNotice.originalDueDate}. Reason: ${reason || 'Cập nhật'}`);
    return { success: true, noticeId: newId, message: `Đã phát hành thông báo thay thế (${newCode})! Giữ nguyên hạn gốc ${oldNotice.originalDueDate} và vô hiệu hóa mã QR cũ.` };
  };

  // ==================== PAYMENT RECEIPTS (QT08: UC08.1 -> UC08.2) ====================
  const confirmPaymentReceipt08_2 = (
    noticeId: string,
    amount: number,
    receivedDate: string,
    transactionCode: string,
    bankAccountReceived: string,
    proofFile?: string
  ) => {
    const notice = paymentNotices.find(n => n.id === noticeId);
    if (!notice) return { success: false, message: 'EF-01: Không tìm thấy thông báo thanh toán.' };

    if (notice.status !== 'Đang hiệu lực') {
      return { success: false, message: 'BR-UC08.1-05: Không được xác nhận thu bằng thông báo hoặc mã QR đã thay thế.' };
    }

    if (notice.paymentStatus === 'Đã thu') {
      return { success: false, message: 'AF-04 / EF-02: Thông báo này đã được xác nhận thu đủ trước đó.' };
    }

    // BR-UC08.2-03: Chỉ xác nhận khi tiền thực vào tài khoản đúng đủ số của QR
    if (amount !== notice.totalAmount) {
      return {
        success: false,
        message: `BR-UC08.2-03: Số tiền thực nhận (${amount.toLocaleString('vi-VN')} đ) phải đúng đủ 100% tổng tiền trên thông báo QR (${notice.totalAmount.toLocaleString('vi-VN')} đ). Không hỗ trợ thu thiếu, chuyển thừa hoặc thanh toán một phần.`
      };
    }

    // EF-02: Kiểm tra chống trùng mã giao dịch
    const isDuplicateTxn = paymentReceipts.some(r => r.transactionCode === transactionCode && r.status === 'Đang hiệu lực');
    if (isDuplicateTxn) {
      return {
        success: false,
        message: `EF-02: Mã giao dịch "${transactionCode}" đã tồn tại trong hệ thống. Vui lòng kiểm tra lại để tránh ghi nhận trùng.`
      };
    }

    const receiptId = 'rcp_' + Date.now().toString().slice(-6);
    const actor = currentUser?.fullName || 'Chủ nhà';
    const nowIso = new Date().toISOString();
    const receipt: PaymentReceipt = {
      id: receiptId,
      noticeId,
      roomCode: notice.roomCode,
      leaseId: notice.leaseId,
      periodCode: notice.periodCode,
      amountReceived: amount,
      receivedDate,
      transactionCode: transactionCode.trim(),
      bankAccountReceived,
      paymentMethod: 'Chuyển khoản ngân hàng',
      proofFile,
      status: 'Đang hiệu lực',
      confirmedBy: actor,
      confirmedAt: nowIso,
      auditHistory: [
        {
          action: 'Tạo chứng từ thu tiền (UC08.2)',
          timestamp: nowIso,
          user: actor,
          transactionCode: transactionCode.trim(),
          amount,
          newStatus: 'Đang hiệu lực',
          details: `Xác nhận thu đủ ${amount.toLocaleString('vi-VN')} đ vào ${bankAccountReceived} qua mã giao dịch ${transactionCode.trim()}`
        }
      ]
    };

    setPaymentReceipts(prev => [receipt, ...prev]);
    setPaymentNotices(prev => prev.map(n => n.id === noticeId ? {
      ...n,
      paymentStatus: 'Đã thu'
    } : n));

    logSecurity('PAYMENT_CONFIRMED_08_2', `Notice ${notice.noticeCode} confirmed collected ${amount.toLocaleString('vi-VN')} đ via txn ${transactionCode}`);
    return { success: true, message: 'Xác nhận thu đủ thành công (UC08.2)! Tiền thuê kỳ sau đã trả trước và dịch vụ đã thu.' };
  };

  const revertPaymentReceipt08_2 = (receiptId: string, reason: string) => {
    const receipt = paymentReceipts.find(r => r.id === receiptId);
    if (!receipt) return { success: false, message: 'EF-01: Không tìm thấy chứng từ thu tiền.' };

    const trimmedReason = reason?.trim();
    if (!trimmedReason) {
      return { success: false, message: 'EF-04 / BR-UC08.2-06: Lý do sửa xác nhận thu nhầm là trường bắt buộc.' };
    }

    const nowIso = new Date().toISOString();
    const actor = currentUser?.fullName || 'Chủ nhà';

    // BR-UC08.2-06 & 10: Không xóa giao dịch nguồn, bảo toàn số liệu cho đối soát
    const newAuditEntry = {
      action: 'Sửa xác nhận thu nhầm (AF-03)',
      timestamp: nowIso,
      user: actor,
      reason: trimmedReason,
      previousStatus: receipt.status,
      newStatus: 'Không còn hiệu lực',
      transactionCode: receipt.transactionCode,
      amount: receipt.amountReceived,
      details: `Hủy hiệu lực xác nhận thu tiền. Giữ nguyên giao dịch nguồn ${receipt.transactionCode} để bảo toàn lịch sử kế toán.`
    };

    setPaymentReceipts(prev => prev.map(r => r.id === receiptId ? {
      ...r,
      status: 'Không còn hiệu lực' as const,
      invalidatedReason: trimmedReason,
      invalidatedAt: nowIso,
      invalidatedBy: actor,
      auditHistory: [...(r.auditHistory || []), newAuditEntry]
    } : r));

    // Hoàn tác trạng thái thông báo thanh toán tương ứng về Chưa thu
    setPaymentNotices(prev => prev.map(n => n.id === receipt.noticeId ? {
      ...n,
      paymentStatus: 'Chưa thu'
    } : n));

    logSecurity('PAYMENT_REVERTED_08_2', `Receipt ${receipt.transactionCode} invalidated: ${trimmedReason}. Source txn preserved.`);
    return { success: true, message: 'Đã sửa xác nhận thu nhầm (AF-03)! Giao dịch nguồn được bảo toàn trong lịch sử kiểm toán và thông báo thanh toán đã quay lại trạng thái Chưa thu.' };
  };

  // ==================== DEBTS (QT09) ====================
  const recordDebtReminder09_2 = (reminder: Omit<DebtHistoryReminder, 'id' | 'loggedAt' | 'loggedBy'>): { success: boolean; message: string; record?: DebtHistoryReminder } => {
    if (!reminder.contactDate || !reminder.channel || !reminder.result?.trim()) {
      return { success: false, message: 'Lỗi EF-02: Thiếu ngày liên hệ, kênh hoặc kết quả trao đổi bắt buộc.' };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (!reminder.isRetrospective && reminder.contactDate > todayStr) {
      return { success: false, message: 'Lỗi EF-03: Ngày liên hệ không thể ở tương lai.' };
    }

    // Check duplicate key (EF-05): noticeId + contactDate + channel
    const duplicate = debtReminders.find(r =>
      r.noticeId === reminder.noticeId &&
      r.contactDate === reminder.contactDate &&
      r.channel === reminder.channel
    );
    if (duplicate) {
      return {
        success: false,
        message: 'Lỗi EF-05: Bản ghi nhắc nợ cùng kênh và ngày liên hệ này đã tồn tại trong lịch sử.',
        record: duplicate
      };
    }

    const newRem: DebtHistoryReminder = {
      ...reminder,
      id: 'drm_' + Date.now(),
      loggedAt: new Date().toISOString(),
      loggedBy: currentUser?.fullName || 'Quản lý / Chủ nhà'
    };

    setDebtReminders(prev => [newRem, ...prev]);
    logSecurity('DEBT_REMINDER_LOGGED_09_2', `Reminded notice ${reminder.noticeId} (Room ${reminder.roomCode}) via ${reminder.channel}`);
    return { success: true, message: 'Ghi nhận lịch sử nhắc nợ thành công (UC-CN-02)!', record: newRem };
  };

  const recordDebtPromise09_3 = (promise: Omit<DebtPromise, 'id' | 'loggedAt' | 'loggedBy'>): { success: boolean; message: string; record?: DebtPromise } => {
    if (!promise.content?.trim()) {
      return { success: false, message: 'Lỗi EF-02: Nội dung phản hồi là trường bắt buộc.' };
    }

    if (promise.hasPromiseDate && !promise.promisedDate) {
      return { success: false, message: 'Lỗi EF-03: Vui lòng nhập ngày hẹn thanh toán khi chọn có hẹn.' };
    }

    const newProm: DebtPromise = {
      ...promise,
      id: 'dpr_' + Date.now(),
      loggedAt: new Date().toISOString(),
      loggedBy: currentUser?.fullName || 'Quản lý / Chủ nhà'
    };

    setDebtPromises(prev => [newProm, ...prev]);
    logSecurity('DEBT_PROMISE_LOGGED_09_3', `Recorded promise for notice ${promise.noticeId} (Room ${promise.roomCode})`);
    return { success: true, message: 'Ghi nhận phản hồi và ngày hẹn thanh toán thành công (UC-CN-03)!', record: newProm };
  };

  const resetAllToSeedData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setCurrentSession({
      sessionId: 'sess_init_' + Date.now(),
      userId: INITIAL_USERS[0].id,
      username: INITIAL_USERS[0].username,
      role: INITIAL_USERS[0].role,
      type: 'admin',
      expiresAt: Date.now() + 30 * 60 * 1000,
      createdAt: Date.now()
    });
    setServices(INITIAL_SERVICES);
    setPriceHistory(INITIAL_PRICE_HISTORY);
    setBankAccounts(INITIAL_BANK_ACCOUNTS);
    setBatchSchedules(INITIAL_BATCH_SCHEDULES);
    setRooms(INITIAL_ROOMS);
    setRoomHistory([]);
    setReturnPlans([]);
    setContactLogs([]);
    setInventoryRecords(INITIAL_INVENTORY_RECORDS);
    setHandoverReports(INITIAL_HANDOVER_REPORTS);
    setIncidents(INITIAL_INCIDENTS);
    setReturnInspections(INITIAL_RETURN_INSPECTIONS);
    setAssetComparisonResults([]);
    setHandoverReturnReports([]);
    setTenants(INITIAL_TENANTS);
    setCoTenants(INITIAL_CO_TENANTS);
    setTenantProposals([]);
    setTenantHistory([]);
    setContracts(INITIAL_CONTRACTS);
    setSettlementSlips(INITIAL_SETTLEMENT_SLIPS);
    setMeterReadings(INITIAL_METER_READINGS);
    setPeriodBills(INITIAL_PERIOD_BILLS);
    setPaymentNotices(INITIAL_PAYMENT_NOTICES);
    setPaymentReceipts(INITIAL_PAYMENT_RECEIPTS);
    setDebtReminders(INITIAL_DEBT_REMINDERS);
    setDebtPromises(INITIAL_DEBT_PROMISES);
    setSecurityLogs([]);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      currentSession,
      authNotification,
      setAuthNotification,
      login,
      changePasswordFirstLogin,
      logout,
      changePasswordFromProfile,
      requestPasswordResetEmail,
      resetPasswordWithToken,
      resetTokens,

      services,
      priceHistory,
      bankAccounts,
      activeBankAccount,
      updateUtilityPrices,
      updateBankAccount,

      rooms,
      roomHistory,
      returnPlans,
      contactLogs,
      initialPaymentRecords,
      missingConditionLogs,
      unfinishedHandoverLogs,
      leaseStartEvents,
      addRoom,
      updateRoom,
      recordInitialPaymentPH07,
      correctInitialPaymentPH07,
      confirmCheckInPH05,
      saveMissingConditionPH06,
      updateExpectedReturnDatePH11_12,
      recordTenantContactPH13,
      autoCancelReturnPlanPH14,
      checkExtensionResultPH15,
      confirmReturnStep305AndVacantPH08,
      saveUnfinishedHandoverPH09,

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

      tenants,
      coTenants,
      tenantProposals,
      tenantHistory,
      addTenantHSKT01,
      addCoTenantHSKT02,
      updateCoTenantStatusHSKT02,
      verifyTenantProposalHSKT03,
      applyTenantUpdateHSKT04,

      contracts,
      batchSchedules,
      addBatchSchedule,
      createContractDraftHDT02,
      confirmContractSignedHDT04,
      createRenewalContractHDT06,
      activateRenewalContractHDT07,

      settlementSlips,
      saveSettlementSlipQTC01,
      updateSettlementFeedbackQTC02,
      confirmSettlementTransferReceiptQTC03,

      meterReadings,
      periodBills,
      saveMeterReadingTT01,
      updateMeterReadingTT02,
      generatePeriodBillTT03,
      confirmPeriodBillTT03,

      reconciliations,
      performReconciliationUC07_1,
      confirmReconciliationUC07_1,
      paymentNotices,
      generatePaymentNotice07_2,
      replacePaymentNotice07_2,

      paymentReceipts,
      confirmPaymentReceipt08_2,
      revertPaymentReceipt08_2,

      debtReminders,
      debtPromises,
      recordDebtReminder09_2,
      recordDebtPromise09_3,

      securityLogs,
      logSecurity,

      // Management Reports (QT10)
      reportSnapshots,
      saveReportSnapshot: (snapshot: ManagementReportSnapshot) => {
        setReportSnapshots(prev => [snapshot, ...prev]);
        logSecurity('Lưu snapshot báo cáo quản trị', `Mã BC: ${snapshot.reportCode} - Kỳ: ${snapshot.periodLabel}`);
      },

      resetAllToSeedData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
