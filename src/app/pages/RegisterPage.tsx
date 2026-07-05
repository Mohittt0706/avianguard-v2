import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, ArrowRight, ArrowLeft, Check, Bell, MapPin, Shield, Users, Radio } from 'lucide-react';
import { citizenApi } from '@/services/citizenApi';
import { useFcm } from '@/context/FcmContext';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import gujaratLocations from '@/data/gujarat-locations.json';

const wetlandMapping: Record<string, string[]> = gujaratLocations.wetlandMapping as Record<string, string[]>;

const allWetlands = Object.keys(wetlandMapping);

function getWetlandsForDistrict(district: string): string[] {
  return allWetlands.filter((w) => wetlandMapping[w]?.includes(district));
}

const indianStates = ['Gujarat', 'Maharashtra', 'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh', 'West Bengal', 'Odisha', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh'];

const gujaratDistricts = Object.keys(gujaratLocations.Gujarat.districts);

function getDistrictsForState(state: string): string[] {
  if (state === 'Gujarat') return gujaratDistricts;
  return [];
}

function getTalukasForDistrict(state: string, district: string): string[] {
  if (state === 'Gujarat' && district) {
    const d = (gujaratLocations.Gujarat.districts as Record<string, { talukas: Record<string, string[]> }>)?.[district];
    return d ? Object.keys(d.talukas) : [];
  }
  return [];
}

function getVillagesForTaluka(state: string, district: string, taluka: string): string[] {
  if (state === 'Gujarat' && district && taluka) {
    const d = (gujaratLocations.Gujarat.districts as Record<string, { talukas: Record<string, string[]> }>)?.[district];
    if (d) {
      const villages = d.talukas?.[taluka];
      return villages || [];
    }
  }
  return [];
}

const occupations = [
  'Farmer', 'Fisherman', 'Villager', 'Forest Staff', 'Student', 'NGO Volunteer', 'Other',
];

const steps = [
  { id: 1, label: 'Personal', icon: Users },
  { id: 2, label: 'Location', icon: MapPin },
  { id: 3, label: 'Preferences', icon: Bell },
  { id: 4, label: 'Review', icon: Shield },
];

const benefits = [
  { icon: Bell, text: 'Real-time flood, fire & pollution alerts' },
  { icon: Radio, text: 'SMS and WhatsApp notifications' },
  { icon: MapPin, text: 'Local wetland-specific updates' },
  { icon: Users, text: 'Community-driven environmental protection' },
];

interface FormData {
  fullName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  state: string;
  district: string;
  taluka: string;
  village: string;
  pincode: string;
  nearbyWetland: string;
  occupation: string;
  language: string;
  alertMethod: string;
  agree: boolean;
}

const initialForm: FormData = {
  fullName: '',
  mobile: '',
  whatsapp: '',
  email: '',
  state: '',
  district: '',
  taluka: '',
  village: '',
  pincode: '',
  nearbyWetland: '',
  occupation: '',
  language: '',
  alertMethod: '',
  agree: false,
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { requestPermission, permissionStatus } = useFcm();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const districts = useMemo(() => getDistrictsForState(form.state), [form.state]);
  const talukas = useMemo(() => getTalukasForDistrict(form.state, form.district), [form.state, form.district]);
  const villages = useMemo(() => getVillagesForTaluka(form.state, form.district, form.taluka), [form.state, form.district, form.taluka]);
  const suggestedWetlands = useMemo(() => {
    if (!form.district) return [];
    return getWetlandsForDistrict(form.district);
  }, [form.district]);
  const allWetlandsList = useMemo(() => allWetlands, []);

  const update = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!form.mobile.trim()) newErrors.mobile = 'Mobile number is required';
      else if (!/^\d{10}$/.test(form.mobile)) newErrors.mobile = 'Must be exactly 10 digits';
      if (form.whatsapp && !/^\d{10}$/.test(form.whatsapp)) newErrors.whatsapp = 'Must be exactly 10 digits';
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email address';
    } else if (step === 2) {
      if (!form.state) newErrors.state = 'Please select your state';
      if (!form.district) newErrors.district = 'Please select your district';
      if (!form.taluka) newErrors.taluka = 'Please select your taluka';
      if (!form.village) newErrors.village = 'Please select your village';
      if (!form.nearbyWetland) newErrors.nearbyWetland = 'Please select a nearby wetland';
    } else if (step === 3) {
      if (!form.occupation) newErrors.occupation = 'Please select your occupation';
      if (!form.language) newErrors.language = 'Please select a language';
      if (!form.alertMethod) newErrors.alertMethod = 'Please select an alert method';
    } else if (step === 4) {
      if (!form.agree) newErrors.agree = 'You must agree to receive alerts';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === 4) {
        handleSubmit();
      } else {
        setStep(s => Math.min(s + 1, 4));
      }
    }
  };

  const handleBack = () => {
    setStep(s => Math.max(s - 1, 1));
    setErrors({});
  };

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName,
        mobile: form.mobile,
        whatsapp: form.whatsapp || undefined,
        email: form.email || undefined,
        state: form.state,
        district: form.district,
        taluka: form.taluka,
        village: form.village,
        pincode: form.pincode || undefined,
        nearbyWetland: form.nearbyWetland,
        occupation: form.occupation,
        language: form.language,
        alertMethods: form.alertMethod ? [form.alertMethod] : [],
        alertTypes: [],
        agree: form.agree,
      };

      const res = await citizenApi.publicRegister(payload);
      const citizenId = res.data?.citizen?.id;

      let fcmPermission: NotificationPermission | string = permissionStatus;
      let fcmTokenSaved = false;

      if ('Notification' in window && 'serviceWorker' in navigator) {
        try {
          const token = await requestPermission();
          if (token) {
            console.log('[Register] FCM Token:', token);
            fcmTokenSaved = true;
            fcmPermission = 'granted';
          }
        } catch (fcmErr) {
          console.warn('[Register] FCM setup failed (non-blocking):', fcmErr);
        }
      }

      const registration = {
        id: citizenId || `CIT-${Date.now().toString(36).toUpperCase()}`,
        ...form,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        fcmPermission,
        fcmTokenSaved,
      };
      const existing = JSON.parse(localStorage.getItem('avian_citizens') || '[]');
      existing.push(registration);
      localStorage.setItem('avian_citizens', JSON.stringify(existing));

      setSubmitting(false);
      navigate('/register/success', {
        state: {
          id: registration.id,
          fcmPermission,
          fcmTokenSaved,
        },
      });
    } catch (err) {
      console.error('[Register] Submission failed:', err);
      const registration = {
        id: `CIT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        ...form,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('avian_citizens') || '[]');
      existing.push(registration);
      localStorage.setItem('avian_citizens', JSON.stringify(existing));
      setTimeout(() => {
        setSubmitting(false);
        navigate('/register/success', { state: { id: registration.id } });
      }, 800);
    }
  }, [form, navigate]);

  const progress = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-black text-white font-['Inter',sans-serif] flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[180px]" style={{ backgroundColor: 'rgba(0,229,255,0.05)' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[150px]" style={{ backgroundColor: 'rgba(52,211,153,0.05)' }} />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(99,102,241,0.04)' }} />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 lg:py-12">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-8 lg:mb-10">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                <Droplets className="text-white" size={18} />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Avian<span className="text-emerald-400">Guard</span>
              </span>
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Citizen Registration</h1>
            <p className="text-sm text-gray-400 mt-1">Join the wetland protection network — get real-time environmental alerts</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Left Panel — Info */}
            <div className="hidden lg:flex lg:col-span-2 flex-col justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-8 shadow-[0_0_0_1px_rgba(0,229,255,0.03),0_8px_40px_rgba(0,0,0,0.45)] h-full"
              >
                <div className="mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
                    <Shield className="text-white" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Stay Alert, Stay Safe</h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Register to receive instant environmental alerts about floods, fires, pollution, and wildlife activity in your local wetlands.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {benefits.map((b, i) => {
                    const Icon = b.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 shrink-0">
                          <Icon size={14} className="text-emerald-400" />
                        </div>
                        <span className="text-sm text-gray-300">{b.text}</span>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    "AvianGuard has been instrumental in protecting our local wetlands. The real-time alerts help us respond to threats immediately."
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-[9px] font-bold text-white">
                      PK
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Priya Kumar</p>
                      <p className="text-[10px] text-gray-500">Forest Officer, Gujarat</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Panel — Form */}
            <div className="lg:col-span-3">
              <div className="bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] shadow-[0_0_0_1px_rgba(0,229,255,0.03),0_8px_40px_rgba(0,0,0,0.45)]">
                {/* Progress Bar */}
                <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-400">
                      Step {step} of {steps.length}
                    </span>
                    <span className="text-xs font-medium text-emerald-400">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    {steps.map((s) => {
                      const Icon = s.icon;
                      return (
                        <div key={s.id} className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                            step > s.id
                              ? 'bg-gradient-to-br from-emerald-500 to-blue-500 text-white shadow-lg shadow-emerald-500/20'
                              : step === s.id
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                              : 'bg-white/[0.04] text-gray-500 border border-white/[0.06]'
                          }`}>
                            {step > s.id ? <Check size={13} /> : <Icon size={13} />}
                          </div>
                          <span className={`text-[10px] font-medium mt-1.5 hidden sm:block ${step >= s.id ? 'text-gray-300' : 'text-gray-600'}`}>
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form Body */}
                <div className="px-6 sm:px-8 py-6 sm:py-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      {/* Step 1: Personal Information */}
                      {step === 1 && (
                        <div className="space-y-5">
                          <div>
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                              <Users size={18} className="text-emerald-400" />
                              Personal Information
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Tell us about yourself</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Full Name <span className="text-red-400">*</span></label>
                            <input
                              type="text"
                              value={form.fullName}
                              onChange={e => update('fullName', e.target.value)}
                              placeholder="e.g. Rajesh Patel"
                              className={`w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border text-white placeholder:text-gray-600 outline-none transition-all ${
                                errors.fullName ? 'border-red-500/50' : 'border-white/[0.06] focus:border-emerald-500/40'
                              } focus:bg-emerald-500/[0.03] focus:shadow-[0_0_0_1px_rgba(52,211,153,0.1)]`}
                            />
                            {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Mobile Number <span className="text-red-400">*</span></label>
                              <input
                                type="tel"
                                value={form.mobile}
                                onChange={e => update('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="9876543210"
                                className={`w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border text-white placeholder:text-gray-600 outline-none transition-all ${
                                  errors.mobile ? 'border-red-500/50' : 'border-white/[0.06] focus:border-emerald-500/40'
                                } focus:bg-emerald-500/[0.03] focus:shadow-[0_0_0_1px_rgba(52,211,153,0.1)]`}
                              />
                              {errors.mobile && <p className="text-xs text-red-400 mt-1">{errors.mobile}</p>}
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-300 mb-1.5 block">WhatsApp Number</label>
                              <input
                                type="tel"
                                value={form.whatsapp}
                                onChange={e => update('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="9876543210 (optional)"
                                className={`w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border text-white placeholder:text-gray-600 outline-none transition-all ${
                                  errors.whatsapp ? 'border-red-500/50' : 'border-white/[0.06] focus:border-emerald-500/40'
                                } focus:bg-emerald-500/[0.03] focus:shadow-[0_0_0_1px_rgba(52,211,153,0.1)]`}
                              />
                              {errors.whatsapp && <p className="text-xs text-red-400 mt-1">{errors.whatsapp}</p>}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Email <span className="text-gray-500">(Optional)</span></label>
                            <input
                              type="email"
                              value={form.email}
                              onChange={e => update('email', e.target.value)}
                              placeholder="rajesh@example.com"
                              className={`w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border text-white placeholder:text-gray-600 outline-none transition-all ${
                                errors.email ? 'border-red-500/50' : 'border-white/[0.06] focus:border-emerald-500/40'
                              } focus:bg-emerald-500/[0.03] focus:shadow-[0_0_0_1px_rgba(52,211,153,0.1)]`}
                            />
                            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                          </div>
                        </div>
                      )}

                      {/* Step 2: Location — Cascading Dropdowns */}
                      {step === 2 && (
                        <div className="space-y-5">
                          <div>
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                              <MapPin size={18} className="text-emerald-400" />
                              Location
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Where are you located? (Gujarat — complete data)</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SearchableDropdown
                              label="State"
                              options={indianStates}
                              value={form.state}
                              onChange={v => {
                                update('state', v);
                                update('district', '');
                                update('taluka', '');
                                update('village', '');
                                update('pincode', '');
                                update('nearbyWetland', '');
                              }}
                              placeholder="Select your state"
                              required
                              error={errors.state}
                            />
                            <SearchableDropdown
                              label="District"
                              options={districts}
                              value={form.district}
                              onChange={v => {
                                update('district', v);
                                update('taluka', '');
                                update('village', '');
                                update('pincode', '');
                                update('nearbyWetland', '');
                              }}
                              placeholder={form.state ? 'Select district' : 'Select a state first'}
                              required
                              error={errors.district}
                              disabled={!form.state}
                            />
                            <SearchableDropdown
                              label="Taluka"
                              options={talukas}
                              value={form.taluka}
                              onChange={v => {
                                update('taluka', v);
                                update('village', '');
                                update('pincode', '');
                              }}
                              placeholder={form.district ? 'Select taluka' : 'Select district first'}
                              required
                              error={errors.taluka}
                              disabled={!form.district}
                            />
                            <SearchableDropdown
                              label="Village / Town"
                              options={villages}
                              value={form.village}
                              onChange={v => update('village', v)}
                              placeholder={form.taluka ? 'Select village' : 'Select taluka first'}
                              required
                              error={errors.village}
                              disabled={!form.taluka}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Pincode <span className="text-gray-500">(Optional)</span></label>
                            <input
                              type="text"
                              value={form.pincode}
                              onChange={e => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="e.g. 380001"
                              className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none transition-all focus:border-emerald-500/40 focus:bg-emerald-500/[0.03] focus:shadow-[0_0_0_1px_rgba(52,211,153,0.1)]"
                            />
                          </div>
                          <SearchableDropdown
                            label="Nearby Wetland / Lake / River"
                            options={form.district ? (suggestedWetlands.length > 0 ? suggestedWetlands : allWetlandsList) : allWetlandsList}
                            value={form.nearbyWetland}
                            onChange={v => update('nearbyWetland', v)}
                            placeholder={form.district ? 'Select a wetland' : 'Select district to see suggestions'}
                            required
                            error={errors.nearbyWetland}
                            disabled={!form.district}
                          />
                          {form.district && suggestedWetlands.length > 0 && (
                            <p className="text-xs text-emerald-400/70 mt-1">
                              Suggested wetlands near {form.district}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Step 3: Alert Preferences */}
                      {step === 3 && (
                        <div className="space-y-6">
                          <div>
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                              <Bell size={18} className="text-emerald-400" />
                              Alert Preferences
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Customize how you receive alerts</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Occupation <span className="text-red-400">*</span></label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {occupations.map(occ => (
                                <button
                                  key={occ}
                                  type="button"
                                  onClick={() => update('occupation', occ)}
                                  className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
                                    form.occupation === occ
                                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_0_1px_rgba(52,211,153,0.2)]'
                                      : 'bg-white/[0.04] border-white/[0.06] text-gray-400 hover:text-white hover:border-white/[0.12]'
                                  }`}
                                >
                                  {occ}
                                </button>
                              ))}
                            </div>
                            {errors.occupation && <p className="text-xs text-red-400 mt-2">{errors.occupation}</p>}
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Preferred Language <span className="text-red-400">*</span></label>
                            <div className="grid grid-cols-3 gap-2">
                              {['English', 'Hindi', 'Gujarati'].map(lang => (
                                <button
                                  key={lang}
                                  type="button"
                                  onClick={() => update('language', lang)}
                                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                    form.language === lang
                                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_0_1px_rgba(52,211,153,0.2)]'
                                      : 'bg-white/[0.04] border-white/[0.06] text-gray-400 hover:text-white hover:border-white/[0.12]'
                                  }`}
                                >
                                  {lang}
                                </button>
                              ))}
                            </div>
                            {errors.language && <p className="text-xs text-red-400 mt-2">{errors.language}</p>}
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Alert Method <span className="text-red-400">*</span></label>
                            <div className="grid grid-cols-3 gap-2">
                              {['SMS', 'WhatsApp', 'Email'].map(method => (
                                <button
                                  key={method}
                                  type="button"
                                  onClick={() => update('alertMethod', method)}
                                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                    form.alertMethod === method
                                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_0_1px_rgba(52,211,153,0.2)]'
                                      : 'bg-white/[0.04] border-white/[0.06] text-gray-400 hover:text-white hover:border-white/[0.12]'
                                  }`}
                                >
                                  {method}
                                </button>
                              ))}
                            </div>
                            {errors.alertMethod && <p className="text-xs text-red-400 mt-2">{errors.alertMethod}</p>}
                          </div>
                        </div>
                      )}

                      {/* Step 4: Review & Submit */}
                      {step === 4 && (
                        <div className="space-y-6">
                          <div className="text-center">
                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20">
                              <Check size={24} className="text-emerald-400" />
                            </div>
                            <h2 className="text-lg font-bold text-white mt-4">Review & Confirm</h2>
                            <p className="text-sm text-gray-400 mt-1">Please verify your details before submitting</p>
                          </div>

                          <div className="bg-white/[0.04] rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                              <span className="text-xs font-medium text-gray-500">Personal Information</span>
                              <button onClick={() => setStep(1)} className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors">Edit</button>
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                              <div><span className="text-xs text-gray-500">Name</span><p className="text-white text-sm">{form.fullName}</p></div>
                              <div><span className="text-xs text-gray-500">Mobile</span><p className="text-white text-sm">{form.mobile}</p></div>
                              <div><span className="text-xs text-gray-500">WhatsApp</span><p className="text-white text-sm">{form.whatsapp || '—'}</p></div>
                              <div><span className="text-xs text-gray-500">Email</span><p className="text-white text-sm">{form.email || '—'}</p></div>
                            </div>
                          </div>

                          <div className="bg-white/[0.04] rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                              <span className="text-xs font-medium text-gray-500">Location</span>
                              <button onClick={() => setStep(2)} className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors">Edit</button>
                            </div>
                            <p className="text-sm text-white">
                              {form.village}{form.taluka ? `, ${form.taluka}` : ''}{form.district ? `, ${form.district}` : ''}{form.state ? `, ${form.state}` : ''}
                            </p>
                            {form.pincode && <p className="text-sm text-gray-400">Pincode: <span className="text-white">{form.pincode}</span></p>}
                            <p className="text-sm text-gray-400">Nearby: <span className="text-white">{form.nearbyWetland}</span></p>
                          </div>

                          <div className="bg-white/[0.04] rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                              <span className="text-xs font-medium text-gray-500">Alert Preferences</span>
                              <button onClick={() => setStep(3)} className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors">Edit</button>
                            </div>
                            <div className="grid grid-cols-3 gap-y-2 text-sm">
                              <div><span className="text-xs text-gray-500">Occupation</span><p className="text-white text-sm">{form.occupation}</p></div>
                              <div><span className="text-xs text-gray-500">Language</span><p className="text-white text-sm">{form.language}</p></div>
                              <div><span className="text-xs text-gray-500">Alerts via</span><p className="text-white text-sm">{form.alertMethod}</p></div>
                            </div>
                          </div>

                          <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={form.agree}
                              onChange={e => update('agree', e.target.checked)}
                              className="mt-0.5 w-4 h-4 rounded accent-emerald-500 bg-white/[0.04] border border-white/[0.1]"
                            />
                            <span className="text-sm text-gray-300 leading-relaxed group-hover:text-white transition-colors">
                              I agree to receive environmental alerts for my area via {form.alertMethod || 'selected channel'}.
                            </span>
                          </label>
                          {errors.agree && <p className="text-xs text-red-400">{errors.agree}</p>}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-white/[0.06] flex items-center justify-between">
                  {step > 1 ? (
                    <button
                      onClick={handleBack}
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all disabled:opacity-50"
                    >
                      <ArrowLeft size={14} />
                      Previous
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-3">
                    {step < 4 && (
                      <button
                        onClick={() => setStep(4)}
                        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        Skip to review
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center gap-2">
                        {submitting ? (
                          <>Submitting...</>
                        ) : step === 4 ? (
                          <>Register for Free Alerts <Check size={14} /></>
                        ) : (
                          <>Next <ArrowRight size={14} /></>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
