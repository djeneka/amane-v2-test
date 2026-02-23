'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Edit, Lock, Trash2, User, Mail, Phone, X, Save, CheckCircle, Eye, EyeOff, ArrowRight, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { updateUser } from '@/services/user';
import { uploadProfileImage, dataUrlToFile } from '@/lib/upload';
import { changePassword } from '@/services/auth';

const defaultUserData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

export default function ProfilPage() {
  const t = useTranslations('profil');
  const { user, logout, refreshUser, accessToken } = useAuth();
  const router = useRouter();
  const [userLoading, setUserLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [otpCode, setOtpCode] = useState(['', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showAccountDeletedModal, setShowAccountDeletedModal] = useState(false);
  const [userData, setUserData] = useState(defaultUserData);
  const [originalData, setOriginalData] = useState(defaultUserData);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  // Charger les infos à jour via le service user (GET /api/users/me)
  useEffect(() => {
    if (!user) {
      setUserLoading(false);
      return;
    }
    let cancelled = false;
    setUserLoading(true);
    refreshUser()
      .then(() => {
        if (!cancelled) setUserLoading(false);
      })
      .catch(() => {
        if (!cancelled) setUserLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Afficher les infos du user connecté (source: service user / API)
  useEffect(() => {
    if (!user) return;
    const parts = (user.name || '').trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    const data = {
      firstName,
      lastName,
      email: user.email || '',
      phone: user.phoneNumber || '',
    };
    setUserData(data);
    setOriginalData(data);
    setAvatar(user.profilePicture || '');
  }, [user]);

  const handleEditPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleDeletePhoto = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeletePhoto = () => {
    setAvatar('/default-avatar.png'); // ou une image par défaut
    setShowDeleteConfirm(false);
  };

  const cancelDeletePhoto = () => {
    setShowDeleteConfirm(false);
  };

  const handleChangePasswordClick = () => {
    setShowChangePassword(true);
    setCurrentStep(1);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleClosePasswordModal = () => {
    setShowChangePassword(false);
    setCurrentStep(1);
    setPasswordData({ current: '', new: '', confirm: '' });
    setOtpCode(['', '', '', '', '']);
    setResendTimer(59);
    setCanResend(false);
    setShowSuccessScreen(false);
    setChangePasswordError(null);
    setChangePasswordLoading(false);
  };

  const handleNextStep = async () => {
    if (currentStep !== 1 || !accessToken) return;
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) return;
    if (passwordData.new !== passwordData.confirm) return;

    setChangePasswordError(null);
    setChangePasswordLoading(true);
    try {
      await changePassword(
        {
          oldPassword: passwordData.current,
          newPassword: passwordData.new,
          confirmPassword: passwordData.confirm,
        },
        accessToken
      );
      setCurrentStep(2);
      setShowSuccessScreen(true);
    } catch (err) {
      setChangePasswordError(err instanceof Error ? err.message : t('changePasswordError'));
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Ne permettre que les chiffres
    if (value && !/^\d$/.test(value)) {
      return;
    }
    
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus sur le champ suivant
    if (value && index < 4) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permettre la suppression et navigation
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = () => {
    const code = otpCode.join('');
    if (code.length === 5) {
      // Ici, vous pouvez ajouter la logique de vérification
      console.log('Code OTP:', code);
      // Afficher l'écran de succès dans le modal
      setShowSuccessScreen(true);
    }
  };

  const handleSuccessOk = () => {
    // Fermer le modal et afficher le toast
    handleClosePasswordModal();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleResendCode = () => {
    if (canResend) {
      // Logique pour renvoyer le code
      setResendTimer(59);
      setCanResend(false);
      setOtpCode(['', '', '', '', '']);
      // Démarrer le timer
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleEdit = () => {
    setSaveError(null);
    setOriginalData(userData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user || !accessToken) return;
    setSaveError(null);
    setSaving(true);
    try {
      let profilePictureUrl = avatar;
      if (avatar.startsWith('data:')) {
        const file = dataUrlToFile(avatar, 'avatar.jpg');
        profilePictureUrl = await uploadProfileImage(file);
      }
      const payload = {
        name: `${userData.firstName} ${userData.lastName}`.trim() || user.name,
        email: userData.email || user.email,
        phoneNumber: userData.phone || user.phoneNumber || '',
        profilePicture: profilePictureUrl || user.profilePicture || '',
      };
      await updateUser(user.id, payload, accessToken);
      await refreshUser();
      setAvatar(profilePictureUrl);
      setIsEditing(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveError(error instanceof Error ? error.message : t('saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSaveError(null);
    setUserData(originalData);
    setIsEditing(false);
  };

  if (userLoading && user) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#00644D] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
            {/* Profile Section */}
            <div className="mb-8">
              <div className="flex items-start space-x-4 sm:space-x-6 mb-6 flex-wrap sm:flex-nowrap">
                <div className="relative flex-shrink-0">
                  <img
                    src={avatar || '/images/no-image.png'}
                    alt={user?.name || 'Profil'}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#00644D]"
                  />
                  <button 
                    onClick={handleEditPhoto}
                    className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-[#00644D] rounded-lg flex items-center justify-center z-10 hover:bg-[#00644D]/80 transition-colors cursor-pointer"
                    title={t('editPhotoAria')}
                    aria-label={t('editPhotoAria')}
                  >
                    <Edit size={12} className="sm:w-[14px] sm:h-[14px] text-white" />
                  </button>
                  <button 
                    onClick={handleDeletePhoto}
                    className="absolute top-5 -right-3.5 w-7 h-7 sm:w-8 sm:h-8 bg-[#00644D] rounded-lg flex items-center justify-center z-10 hover:bg-red-500 transition-colors cursor-pointer"
                    title={t('deletePhotoAria')}
                    aria-label={t('deletePhotoAria')}
                  >
                    <Trash2 size={12} className="sm:w-[14px] sm:h-[14px] text-white" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-base sm:text-lg leading-relaxed mt-3">
                    <span className="block lg:block">{t('pageSubtitleLine1')}</span>
                    <span className="block lg:block">{t('pageSubtitleLine2')}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6 max-w-4xl">
              {/* First Row: Last Name and First Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <User size={20} className="text-white/50" />
                </div>
                <input
                  type="text"
                  value={userData.lastName}
                  onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 bg-[#101919]/50 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#00644D] disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder={t('lastNamePlaceholder')}
                />
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <User size={20} className="text-white/50" />
                </div>
                <input
                  type="text"
                  value={userData.firstName}
                  onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 bg-[#101919]/50 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#00644D] disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder={t('firstNamePlaceholder')}
                />
              </div>
            </div>

              {/* Second Row: Email and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Mail size={20} className="text-white/50" />
                </div>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 bg-[#101919]/50 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#00644D] disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
                      placeholder={t('emailPlaceholder')}
                />
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Phone size={20} className="text-white/50" />
                </div>
                <input
                  type="tel"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 bg-[#101919]/50 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#00644D] disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder={t('phonePlaceholder')}
                />
              </div>
            </div>

              {saveError && (
                <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                  <AlertTriangle size={18} className="flex-shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-between items-start sm:items-center">
                <div className="flex gap-4">
                  {!isEditing ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleEdit}
                      className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-[#00644D] text-white rounded-3xl hover:bg-[#00644D]/90 transition-colors text-sm sm:text-base"
                    >
                      <Edit size={20} />
                      <span>{t('edit')}</span>
                    </motion.button>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-[#8FC99E] to-[#20B6B3] text-white rounded-3xl hover:opacity-90 transition-colors text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save size={20} />
                        )}
                        <span>{saving ? t('saving') : t('save')}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCancel}
                        className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 border border-white/20 text-white rounded-3xl hover:bg-white/10 transition-colors text-sm sm:text-base"
                      >
                        <X size={20} />
                        <span>{t('cancel')}</span>
                      </motion.button>
                    </>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleChangePasswordClick}
                    className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-[#8FC99E] to-[#20B6B3] text-white rounded-3xl hover:opacity-90 transition-colors text-sm sm:text-base"
                  >
                    <Lock size={20} />
                    <span>{t('changePassword')}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteAccountModal(true)}
                    className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 border border-red-500 text-red-500 rounded-3xl hover:bg-red-500/10 transition-colors text-sm sm:text-base"
                  >
                    <User size={20} />
                    <span>{t('deleteAccount')}</span>
                  </motion.button>
                </div>
              </div>
            </div>

      {/* Confirmation Modal for Photo Deletion */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#101919] rounded-2xl p-6 max-w-md w-full border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-4">{t('confirmDeletePhotoTitle')}</h3>
            <p className="text-white/80 mb-6">
              {t('confirmDeletePhotoMessage')}
            </p>
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={cancelDeletePhoto}
                className="flex-1 px-4 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                {t('cancel')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmDeletePhoto}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                {t('delete')}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Change Password Modal */}
      <AnimatePresence>
        {showChangePassword && (
          <div className="fixed inset-0 bg-[#101919]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-[#1a2a29] rounded-2xl max-w-4xl w-full overflow-hidden relative"
            >
              {/* Close Button */}
              <button
                onClick={handleClosePasswordModal}
                className="absolute top-4 right-4 w-10 h-10 bg-[#00C48C] rounded-full flex items-center justify-center z-10 hover:bg-[#00C48C]/80 transition-colors"
                aria-label={t('closeAria')}
              >
                <X size={20} className="text-white" />
              </button>

              <div className="flex flex-col lg:flex-row">
                {/* Left Column - Progress Indicator */}
                <div className="bg-[#00644D]/10 p-8 lg:w-64 flex-shrink-0">
                  <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                        currentStep >= 1 
                          ? 'bg-[#00C48C] text-white' 
                          : 'bg-[#4a4a4a] border border-[#888888] text-[#888888]'
                      }`}>
                        {currentStep > 1 ? (
                          <CheckCircle size={20} className="text-white" />
                        ) : (
                          '1'
                        )}
                      </div>
                      <span className={`font-medium ${
                        currentStep >= 1 ? 'text-white' : 'text-[#888888]'
                      }`}>
                        {t('passwordStepLabel')}
                      </span>
                    </div>

                    {/* Dashed Line */}
                    <div className="flex items-center pl-5">
                      <div className="h-12 border-l-2 border-dashed border-[#888888]"></div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                        currentStep >= 2 
                          ? 'bg-[#00C48C] text-white' 
                          : 'bg-[#4a4a4a] border border-[#888888] text-[#888888]'
                      }`}>
                        2
                      </div>
                      <span className={`font-medium ${
                        currentStep >= 2 ? 'text-white' : 'text-[#888888]'
                      }`}>
                        {t('verificationStepLabel')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Form */}
                <div className="flex-1 p-8 bg-[#101919] rounded-lg">
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">{t('passwordTitle')}</h2>
                        <p className="text-white text-lg mb-1">{t('changePasswordSubtitle')}</p>
                        <p className="text-[#888888] text-sm">{t('fillFormHint')}</p>
                      </div>

                      <div className="space-y-4 bg-[#00644D]/10 rounded-lg p-4">
                        {/* Current Password */}
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <Lock size={20} className="text-white" />
                          </div>
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                            placeholder={t('currentPasswordPlaceholder')}
                            className="w-full pl-12 pr-12 py-4 bg-[#101919] border border-white/60 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#00C48C]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-white/80"
                          >
                            {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>

                        {/* New Password */}
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <Lock size={20} className="text-white" />
                          </div>
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                            placeholder={t('newPasswordPlaceholder')}
                            className="w-full pl-12 pr-12 py-4 bg-[#101919] border border-white/60 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#00C48C]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-white/80"
                          >
                            {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <Lock size={20} className="text-white" />
                          </div>
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            placeholder={t('confirmPasswordPlaceholder')}
                            className="w-full pl-12 pr-12 py-4 bg-[#101919] border border-white/60 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#00C48C]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-white/80"
                          >
                            {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      {changePasswordError && (
                        <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                          <AlertTriangle size={18} className="flex-shrink-0" />
                          <span>{changePasswordError}</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-4 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleClosePasswordModal}
                          disabled={changePasswordLoading}
                          className="flex-1 px-6 py-3 bg-[#00644d]/10 text-[#20b6b3] rounded-3xl hover:bg-[#00644d]/20 transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t('quit')}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => void handleNextStep()}
                          disabled={!passwordData.current || !passwordData.new || !passwordData.confirm || passwordData.new !== passwordData.confirm || changePasswordLoading}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8FC99E] to-[#20B6B3] text-white rounded-3xl hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {changePasswordLoading ? (
                            <>
                              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>{t('saving')}</span>
                            </>
                          ) : (
                            <>
                              <span>{t('next')}</span>
                              <ArrowRight size={20} />
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && !showSuccessScreen && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">{t('verificationTitle')}</h2>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-white font-bold mb-2">{t('otpLabel')}</label>
                          <p className="text-white text-sm">
                            {t('otpHint')}
                          </p>
                        </div>

                        {/* OTP Input Fields */}
                        <div className="flex justify-center space-x-3">
                          {otpCode.map((digit, index) => (
                            <input
                              key={index}
                              id={`otp-${index}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              aria-label={t('otpDigitAria', { n: index + 1 })}
                              title={t('otpDigitAria', { n: index + 1 })}
                              className="w-14 h-14 text-center text-2xl font-bold bg-[#101919] border border-[#00C48C] rounded-lg text-white focus:outline-none focus:border-[#00C48C] focus:ring-2 focus:ring-[#00C48C]/50"
                            />
                          ))}
                        </div>

                        {/* Verify Button */}
                        <div className="flex justify-center pt-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleVerify}
                            disabled={otpCode.join('').length !== 5}
                            className="px-8 py-3 bg-gradient-to-r from-[#8FC99E] to-[#20B6B3] text-white rounded-3xl text-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t('verify')}
                          </motion.button>
                        </div>

                        {/* Resend Code */}
                        <div className="text-center pt-4">
                          <p className="text-white text-sm">
                            {t('noCodeReceived')}{' '}
                            {canResend ? (
                              <button
                                onClick={handleResendCode}
                                className="text-[#00C48C] hover:text-[#00C48C]/80 font-medium underline"
                              >
                                {t('resend')}
                              </button>
                            ) : (
                              <span>
                                {t('resendIn')}{' '}
                                <span className="text-[#00C48C] font-bold">
                                  {String(Math.floor(resendTimer / 60)).padStart(2, '0')}:
                                  {String(resendTimer % 60).padStart(2, '0')}s
                                </span>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success Screen */}
                  {currentStep === 2 && showSuccessScreen && (
                    <div className="space-y-8 flex flex-col items-center justify-center min-h-[400px] py-8">
                      {/* Success Icon */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="relative"
                      >
                        {/* Outer ring */}
                        <div className="w-24 h-24 rounded-full border-4 border-[#00644D] flex items-center justify-center">
                          {/* Inner circle */}
                          <div className="w-20 h-20 rounded-full bg-[#00C48C] flex items-center justify-center">
                            {/* <CheckCircle size={48} className="text-white" strokeWidth={3} />
                             */}
                             <Image src="/icons/check.png" alt="Check" width={58} height={58} />
                          </div>
                        </div>
                      </motion.div>

                      {/* Title */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center"
                      >
                        <h2 className="text-3xl font-bold text-white mb-4">{t('successTitle')}</h2>
                        <p className="text-white text-lg">
                          {t('passwordResetSuccess')}
                        </p>
                      </motion.div>

                      {/* Ok Button */}
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSuccessOk}
                        className="px-12 py-4 bg-gradient-to-r from-[#8FC99E] to-[#20B6B3] text-white rounded-3xl hover:opacity-90 transition-colors font-medium text-lg"
                      >
                        {t('ok')}
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteAccountModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-[#101919] rounded-2xl p-8 max-w-md w-full relative"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowDeleteAccountModal(false);
                  setShowDeleteConfirmation(false);
                  setDeleteConfirmText('');
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-[#00C48C] rounded-full flex items-center justify-center z-10 hover:bg-[#00C48C]/80 transition-colors"
                aria-label={t('closeAria')}
              >
                <X size={20} className="text-white" />
              </button>

              <div className="flex flex-col items-center text-center space-y-6">
                {/* Warning Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="relative"
                >
                  {/* Outer ring */}
                  <div className="w-20 h-20 rounded-full bg-[#FF8C00]/20 flex items-center justify-center">
                    {/* Inner circle */}
                    <div className="w-16 h-16 rounded-full bg-[#FF8C00] flex items-center justify-center">
                      <AlertTriangle size={32} className="text-white" fill="white" />
                    </div>
                  </div>
                </motion.div>

                {/* Title */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">{t('deleteAccountTitle')}</h2>
                  {!showDeleteConfirmation ? (
                    <>
                      <p className="text-white text-base">{t('deleteAccountIrreversible')}</p>
                      <p className="text-white text-base">
                        {t('deleteAccountConfirm')}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-white text-base">{t('deleteAccountIrreversible')}</p>
                      <p className="text-white text-base">
                        {t('deleteAccountConfirm')}
                      </p>
                      <p className="text-white text-base mt-4">
                        {t('deleteAccountTypeConfirm')}
                      </p>
                      <div className="pt-4">
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => {
                            setDeleteConfirmText(e.target.value);
                          }}
                          placeholder={t('writeHerePlaceholder')}
                          className="w-full px-4 py-3 bg-[#101919] border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#00C48C]"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                {!showDeleteConfirmation ? (
                  <div className="flex space-x-4 w-full pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowDeleteConfirmation(true);
                      }}
                      className="flex-1 px-6 py-3 bg-[#ea4335]/20 text-white rounded-3xl hover:opacity-90 transition-colors font-medium"
                    >
                      {t('yesDelete')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowDeleteAccountModal(false);
                        setShowDeleteConfirmation(false);
                        setDeleteConfirmText('');
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8FC99E] to-[#20B6B3] text-white rounded-3xl hover:opacity-90 transition-colors font-medium"
                    >
                      {t('no')}
                    </motion.button>
                  </div>
                ) : (
                  deleteConfirmText.toLowerCase().trim() === t('deleteAccountConfirmWord') && (
                    <div className="flex space-x-4 w-full pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowDeleteAccountModal(false);
                          setShowAccountDeletedModal(true);
                          setDeleteConfirmText('');
                          setShowDeleteConfirmation(false);
                        }}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#9B4242] to-[#D65E5E] text-white rounded-3xl hover:opacity-90 transition-colors font-medium"
                      >
                        {t('delete')}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowDeleteConfirmation(false);
                          setDeleteConfirmText('');
                        }}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8FC99E] to-[#20B6B3] text-white rounded-3xl hover:opacity-90 transition-colors font-medium"
                      >
                        {t('cancel')}
                      </motion.button>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Account Deleted Modal */}
      <AnimatePresence>
        {showAccountDeletedModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-[#101919] rounded-2xl p-8 max-w-md w-full"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Sad Emoji */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="text-6xl"
                >
                  ☹️
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <h2 className="text-2xl font-bold text-white">{t('accountDeletedTitle')}</h2>
                  <p className="text-white/70 text-base">
                    {t('accountDeletedMessage')}
                  </p>
                </motion.div>

                {/* Ok Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowAccountDeletedModal(false);
                    // Ici, vous pouvez ajouter la logique de redirection ou déconnexion
                    logout();
                    router.push('/');
                  }}
                  className="px-12 py-3 bg-gradient-to-r from-[#8FC99E] to-[#20B6B3] text-white rounded-3xl hover:opacity-90 transition-colors font-medium"
                >
                  Ok
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-[#00644D] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 min-w-[300px]">
              <CheckCircle size={24} className="flex-shrink-0" />
              <div>
                <p className="font-semibold">{t('toastSuccessTitle')}</p>
                <p className="text-sm text-white/90">{t('toastSuccessMessage')}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 