import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar, NavTabKey, NAV_ITEMS } from './components/layout/Sidebar';
import { LoginModal } from './components/auth/LoginModal';
import { AccountProfileModal } from './components/auth/AccountProfileModal';

import { ConfigView } from './components/views/ConfigView';
import { RoomsView } from './components/views/RoomsView';
import { HandoverAssetsView } from './components/views/HandoverAssetsView';
import { TenantsView } from './components/views/TenantsView';
import { ContractsView } from './components/views/ContractsView';
import { DepositSettlementView } from './components/views/DepositSettlementView';
import { BillingView } from './components/views/BillingView';
import { PaymentNoticesView } from './components/views/PaymentNoticesView';
import { PaymentReceiptsView } from './components/views/PaymentReceiptsView';
import { DebtsView } from './components/views/DebtsView';
import { ReportsView } from './components/views/ReportsView';

const MainAppContent: React.FC = () => {
  const { currentSession, authNotification } = useApp();

  const [currentTab, setCurrentTab] = useState<NavTabKey>('rooms');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const activeNavItem = NAV_ITEMS.find(i => i.key === currentTab) || NAV_ITEMS[1];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Global Top Bar Contract */}
      <Header
        currentTabName={activeNavItem.label}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenLogin={() => setShowLoginModal(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />

        {/* Viewport Canvas */}
        <main className="flex-1 p-6 overflow-y-auto max-w-full">
          {authNotification && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
              {authNotification}
            </div>
          )}

          {currentTab === 'config' && (
            <ConfigView onNavigateToNotices={() => setCurrentTab('notices')} />
          )}
          {currentTab === 'rooms' && <RoomsView />}
          {currentTab === 'handover' && <HandoverAssetsView />}
          {currentTab === 'tenants' && <TenantsView />}
          {currentTab === 'contracts' && <ContractsView />}
          {currentTab === 'settlement' && <DepositSettlementView />}
          {currentTab === 'billing' && (
            <BillingView onNavigateToNotices={() => setCurrentTab('notices')} />
          )}
          {currentTab === 'notices' && (
            <PaymentNoticesView onNavigateToReceipts={() => setCurrentTab('receipts')} />
          )}
          {currentTab === 'receipts' && <PaymentReceiptsView />}
          {currentTab === 'debts' && <DebtsView />}
          {currentTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={!currentSession || currentSession.type === 'temp_change_password' || showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <AccountProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
