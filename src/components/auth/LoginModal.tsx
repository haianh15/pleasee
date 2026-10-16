import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, EyeOff, ShieldCheck, Mail, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen }) => {
  const {
    currentUser,
    currentSession,
    login,
    changePasswordFirstLogin,
    logout,
    requestPasswordResetEmail,
    resetPasswordWithToken
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'first_change' | 'forgot' | 'reset_token'>('login');
  
  // Login fields
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // First time change password fields (AF-01)
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showFirstPass, setShowFirstPass] = useState(false);
  const [firstChangeMsg, setFirstChangeMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Forgot password fields (UC-TK-04)
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [demoResetToken, setDemoResetToken] = useState<string | null>(null);

  // Reset with token fields
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [tokenNewPass, setTokenNewPass] = useState('');
  const [tokenConfirmPass, setTokenConfirmPass] = useState('');
  const [tokenResetMsg, setTokenResetMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isOpen) return null;

  // If already logged in with admin session, don't show login modal
  if (currentSession && currentSession.type === 'admin') {
    return null;
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = login(username, password);
    if (!res.success) {
      setLoginError(res.message || 'Đăng nhập thất bại.');
    } else if (res.requireChangePass) {
      setCurrPass(password);
      setActiveTab('first_change');
    }
  };

  const handleFirstChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFirstChangeMsg(null);
    const res = changePasswordFirstLogin(currPass, newPass, confirmPass);
    if (!res.success) {
      setFirstChangeMsg({ type: 'error', text: res.message });
    } else {
      setFirstChangeMsg({ type: 'success', text: res.message });
      // Transition to admin
      setTimeout(() => {
        setActiveTab('login');
      }, 1200);
    }
  };

  const handleCancelFirstChange = () => {
    logout();
    setActiveTab('login');
    setFirstChangeMsg(null);
    setLoginError('Đã thoát khỏi bước đổi mật khẩu. Vui lòng đăng nhập lại.');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    const res = requestPasswordResetEmail(forgotEmail);
    if (!res.success) {
      setForgotMsg({ type: 'error', text: res.message });
    } else {
      setForgotMsg({ type: 'success', text: res.message });
      if (res.generatedToken) {
        setDemoResetToken(res.generatedToken);
      }
    }
  };

  const handleResetWithTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTokenResetMsg(null);
    const res = resetPasswordWithToken(resetTokenInput, tokenNewPass, tokenConfirmPass);
    if (!res.success) {
      setTokenResetMsg({ type: 'error', text: res.message });
    } else {
      setTokenResetMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setActiveTab('login');
        setLoginError('Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold tracking-tight">Hệ thống Quản lý Chung cư Mini</h2>
          </div>
          <p className="text-xs text-slate-300">
            {activeTab === 'login' && 'Đăng nhập vào hệ thống để quản lý căn hộ'}
            {activeTab === 'first_change' && 'Bắt buộc đổi mật khẩu mới cho lần đầu đăng nhập'}
            {activeTab === 'forgot' && 'Khôi phục mật khẩu qua Email xác thực'}
            {activeTab === 'reset_token' && 'Đặt lại mật khẩu mới từ liên kết'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forgot');
                    setForgotMsg(null);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Quên mật khẩu?
                </button>
                <span className="text-slate-400 text-[11px]">Tự khóa 15 phút nếu sai 5 lần</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
              >
                Đăng nhập
              </button>

              {/* Quick credential helper */}
              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-lg">
                <div className="font-semibold text-slate-700">Tài khoản đăng nhập mẫu:</div>
                <div className="flex justify-between items-center">
                  <span>Chủ nhà: <strong>admin</strong> / <code>Admin@12345678</code></span>
                  <button
                    type="button"
                    onClick={() => { setUsername('admin'); setPassword('Admin@12345678'); }}
                    className="text-blue-600 underline text-[11px]"
                  >
                    Điền nhanh
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Quản lý: <strong>quanly01</strong> / <code>CapSan@123456</code></span>
                  <button
                    type="button"
                    onClick={() => { setUsername('quanly01'); setPassword('CapSan@123456'); }}
                    className="text-blue-600 underline text-[11px]"
                  >
                    Điền nhanh
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: FIRST TIME MANDATORY PASSWORD CHANGE (AF-01) */}
          {activeTab === 'first_change' && (
            <form onSubmit={handleFirstChangeSubmit} className="space-y-3.5">
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 mb-2">
                Tài khoản của bạn đang dùng mật khẩu được cấp. Theo chính sách bảo mật bắt buộc, bạn phải đổi mật khẩu mới (tối thiểu 12 ký tự) trước khi truy cập trang tổng quan.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu hiện tại <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={currPass}
                  onChange={(e) => setCurrPass(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="Mật khẩu được cấp"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showFirstPass ? 'text' : 'password'}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="Ít nhất 12 ký tự"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFirstPass(!showFirstPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showFirstPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Dòng hướng dẫn: Mật khẩu mới có ít nhất 12 ký tự.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              {firstChangeMsg && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${firstChangeMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {firstChangeMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                  <span>{firstChangeMsg.text}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Đổi mật khẩu
                </button>
                <button
                  type="button"
                  onClick={handleCancelFirstChange}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Thoát
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD VIA EMAIL (UC-TK-04) */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold mb-1">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Khôi phục quyền truy cập qua Email</span>
              </div>
              <p className="text-xs text-slate-600">
                Nhập địa chỉ email khôi phục đã xác minh gắn với tài khoản của bạn để nhận liên kết đặt lại mật khẩu (hiệu lực 15 phút).
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Ví dụ: chudautu@anbinh.vn"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {forgotMsg && (
                <div className={`p-3 rounded-lg text-xs ${forgotMsg.type === 'success' ? 'bg-blue-50 text-blue-900 border border-blue-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {forgotMsg.text}
                </div>
              )}

              {demoResetToken && (
                <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-slate-700">Mô phỏng liên kết trong email gửi đến:</span>
                  <div className="font-mono text-[11px] text-blue-700 break-all bg-white p-1.5 rounded border border-slate-200">
                    https://ais-dev-.../reset-password?token={demoResetToken}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResetTokenInput(demoResetToken);
                      setActiveTab('reset_token');
                    }}
                    className="text-xs text-blue-600 font-semibold underline mt-1 block"
                  >
                    Bấm vào đây để mở Biểu mẫu Đặt lại mật khẩu bằng liên kết này →
                  </button>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Gửi liên kết đặt lại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setForgotMsg(null);
                    setDemoResetToken(null);
                  }}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Quay lại Đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: RESET PASSWORD WITH TOKEN (UC-TK-04 STEP 3, 4) */}
          {activeTab === 'reset_token' && (
            <form onSubmit={handleResetWithTokenSubmit} className="space-y-3.5">
              <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>Đặt lại mật khẩu mới</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã Token từ liên kết <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={resetTokenInput}
                  onChange={(e) => setResetTokenInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono bg-slate-50"
                  placeholder="Mã token"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={tokenNewPass}
                  onChange={(e) => setTokenNewPass(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  placeholder="Tối thiểu 12 ký tự"
                />
                <p className="text-[11px] text-slate-500 mt-0.5">Dòng hướng dẫn mật khẩu mới có ít nhất 12 ký tự.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={tokenConfirmPass}
                  onChange={(e) => setTokenConfirmPass(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              {tokenResetMsg && (
                <div className={`p-3 rounded-lg text-xs ${tokenResetMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {tokenResetMsg.text}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Đặt lại mật khẩu
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Quay lại Đăng nhập
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
