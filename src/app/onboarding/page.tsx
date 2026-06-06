'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DatabaseService } from '@/utils/services';
import { Profile } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Personal Information
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');

  // Step 2: Health Metrics
  const [height, setHeight] = useState<number>(176);
  const [weight, setWeight] = useState<number>(88);
  const [bmi, setBmi] = useState<number>(28.4);

  // Step 3: Medical Information
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>(['Diabetes', 'Hypertension']);
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');

  // Step 4: Goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Diabetes Management', 'Weight Loss']);

  const availableDiseases = ['Diabetes', 'Hypertension', 'Heart Disease', 'Kidney Disease', 'Asthma', 'Obesity'];
  const availableGoals = ['Weight Loss', 'Weight Gain', 'Diabetes Management', 'Better Nutrition', 'Fitness'];

  useEffect(() => {
    DatabaseService.getCurrentUser().then(currUser => {
      if (!currUser) {
        router.push('/login');
      } else {
        setUser(currUser);
        setFullName(currUser.full_name || '');
        setPhone(currUser.phone || '');
        setAddress(currUser.address || '');
        setGender(currUser.gender || 'Male');
        setDob(currUser.date_of_birth || '');
        if (currUser.height) setHeight(currUser.height);
        if (currUser.weight) setWeight(currUser.weight);
      }
    });
  }, []);

  // Calculate BMI dynamically
  useEffect(() => {
    if (height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const calculatedBmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
      setBmi(calculatedBmi);
    } else {
      setBmi(0);
    }
  }, [height, weight]);

  const getBmiCategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: 'Underweight', color: 'text-blue-400', barWidth: '30%' };
    if (bmiValue < 25) return { label: 'Healthy Weight', color: 'text-primary', barWidth: '55%' };
    if (bmiValue < 30) return { label: 'Overweight', color: 'text-tertiary', barWidth: '75%' };
    return { label: 'Obese', color: 'text-error', barWidth: '95%' };
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleDiseaseToggle = (disease: string) => {
    if (selectedDiseases.includes(disease)) {
      setSelectedDiseases(selectedDiseases.filter(d => d !== disease));
    } else {
      setSelectedDiseases([...selectedDiseases, disease]);
    }
  };

  const handleGoalToggle = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await DatabaseService.saveOnboarding(
        user.id,
        { full_name: fullName, phone, address, gender, date_of_birth: dob },
        { height, weight, bmi },
        selectedDiseases,
        selectedGoals
      );
      router.push('/');
    } catch (e) {
      console.error('Failed to save onboarding:', e);
    } finally {
      setLoading(false);
    }
  };

  const bmiCat = getBmiCategory(bmi);

  return (
    <main className="flex min-h-screen flex-col md:flex-row overflow-hidden bg-background">
      {/* Left Side: Cinematic Graphic */}
      <section className="relative w-full md:w-1/2 h-64 md:h-screen overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
        <img 
          className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105" 
          alt="Atmospheric laboratory diagnostic console scene" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4hwsOQgSMJNXxs9qDo6r81a5R0neAPdqxPMohkW43KaB8tEC7mgjznMb2jozT-J6HsVSewQUSlKBRf-5FAKeoW_jXQ2PiAtvQKBeIgBeyi3cUBNtLvUPkJh44pS9qrYqu21xQvwxSsB7mltQQNoaM4wYJi7npgEtCYB3Ik-P4iw5utDqeXCFiG0lkBSMlu_6kQ5N-DVx5kxJId1l1gA26ls7h-manPBTD9PqGQZJ4dR6jVM-9Xe_gw3O9gnWTwYTlJNij0-lIsF22"
        />
        <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 md:right-12 z-20">
          <h1 className="font-sans font-bold text-3xl md:text-5xl text-white leading-tight drop-shadow-2xl">
            Tenachin AI:<br/><span className="text-primary">Your Health Guard</span>
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant max-w-md mt-2 font-medium">
            Advanced clinical intelligence providing real-time physiological monitoring and precision diagnostics.
          </p>
        </div>
      </section>

      {/* Right Side: Form Wizard */}
      <section className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-surface-dim relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="w-full max-w-xl z-10 py-8">
          <div className="glass-card rounded-2xl p-6 md:p-8 glow-emerald">
            
            {/* Wizard Stepper */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3, 4].map((stepNum) => (
                <div 
                  key={stepNum}
                  className={`flex-1 h-1 rounded-full relative transition-all ${
                    step >= stepNum ? 'bg-primary' : 'bg-surface-variant'
                  }`}
                >
                  {step === stepNum && (
                    <span className="absolute -top-6 left-0 text-[10px] font-bold uppercase tracking-wider text-primary">
                      STEP {stepNum} OF 4
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Personal Details</h2>
                  <p className="text-xs text-on-surface-variant">Please complete your basic profile identifiers.</p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jonathan Doe"
                      className="w-full h-12 bg-black/30 border border-white/10 rounded-lg px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white text-sm transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Phone Number</label>
                      <input 
                        type="text" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+251 911 123456"
                        className="w-full h-12 bg-black/30 border border-white/10 rounded-lg px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white text-sm transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Address / Region</label>
                      <input 
                        type="text" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Addis Ababa"
                        className="w-full h-12 bg-black/30 border border-white/10 rounded-lg px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white text-sm transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Gender</label>
                      <select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full h-12 bg-black/30 border border-white/10 rounded-lg px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white text-sm transition-all"
                      >
                        <option value="Male" className="bg-background">Male</option>
                        <option value="Female" className="bg-background">Female</option>
                        <option value="Other" className="bg-background">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Date of Birth</label>
                      <input 
                        type="date" 
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full h-12 bg-black/30 border border-white/10 rounded-lg px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Health Metrics & Dynamic BMI Widget */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Biometric Profile</h2>
                  <p className="text-xs text-on-surface-variant">Enter your physical measurements for automated calculations.</p>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">WEIGHT (KG)</label>
                      <input 
                        type="number" 
                        value={weight || ''}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full h-12 bg-black/30 border border-white/10 rounded-lg px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white text-sm font-mono transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">HEIGHT (CM)</label>
                      <input 
                        type="number" 
                        value={height || ''}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-full h-12 bg-black/30 border border-white/10 rounded-lg px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white text-sm font-mono transition-all"
                      />
                    </div>
                  </div>

                  {/* Reactive BMI Widget (from Figma) */}
                  {bmi > 0 && (
                    <div className="glass-card p-4 rounded-xl border-tertiary-container/30 glow-error transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-tertiary mb-1 block">CALCULATED METRIC</span>
                          <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold text-white">BMI: {bmi}</h3>
                            <span className={`text-base font-semibold ${bmiCat.color}`}>- {bmiCat.label}</span>
                          </div>
                        </div>
                        <div className="bg-tertiary/10 p-2 rounded-lg">
                          <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {bmi >= 25 ? 'warning' : 'verified'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 w-full bg-surface-variant/30 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary via-yellow-400 to-tertiary transition-all duration-500" 
                          style={{ width: bmiCat.barWidth }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Medical Information */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Medical Record</h2>
                  <p className="text-xs text-on-surface-variant">Select pre-existing conditions and register current details.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">CONFIRMED DIAGNOSES</label>
                    <div className="flex flex-wrap gap-2">
                      {availableDiseases.map((disease) => {
                        const isSelected = selectedDiseases.includes(disease);
                        return (
                          <button
                            key={disease}
                            type="button"
                            onClick={() => handleDiseaseToggle(disease)}
                            className={`px-4 py-2 rounded-full border transition-all text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                              isSelected 
                                ? 'bg-primary/10 border-primary/40 text-primary' 
                                : 'bg-surface-container-highest/50 border-white/5 text-on-surface-variant hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            {disease}
                            {isSelected ? (
                              <span className="material-symbols-outlined text-sm">close</span>
                            ) : (
                              <span className="material-symbols-outlined text-sm">add</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">ALLERGIES (IF ANY)</label>
                    <input 
                      type="text" 
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="e.g. Peanuts, Penicillin"
                      className="w-full h-12 bg-black/30 border border-white/10 rounded-lg px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">MEDICATIONS (IF ANY)</label>
                    <input 
                      type="text" 
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      placeholder="e.g. Metformin 500mg"
                      className="w-full h-12 bg-black/30 border border-white/10 rounded-lg px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white text-sm transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Goals Selection */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Health & Fitness Goals</h2>
                  <p className="text-xs text-on-surface-variant">Select targets for customized nutrition recommendations.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">PRIMARY TARGETS</label>
                    <div className="flex flex-col gap-2">
                      {availableGoals.map((goal) => {
                        const isSelected = selectedGoals.includes(goal);
                        return (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => handleGoalToggle(goal)}
                            className={`w-full p-4 rounded-xl border transition-all text-left flex justify-between items-center cursor-pointer ${
                              isSelected 
                                ? 'bg-primary/10 border-primary/40 text-primary' 
                                : 'bg-surface-container-highest/30 border-white/5 text-on-surface-variant hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span className="text-sm font-semibold">{goal}</span>
                            <span className="material-symbols-outlined">
                              {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button 
                  type="button"
                  onClick={handleBack}
                  className="flex-1 h-14 border border-white/10 hover:bg-white/5 rounded-xl text-base font-semibold text-white transition-all active:scale-95 cursor-pointer"
                >
                  Back
                </button>
              )}
              {step < 4 ? (
                <button 
                  type="button"
                  onClick={handleNext}
                  className="flex-[2] h-14 bg-primary text-on-primary font-semibold text-base rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Continue
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-[2] h-14 bg-primary text-on-primary font-semibold text-base rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Saving Profile...' : 'Finalize Steps'}
                  <span className="material-symbols-outlined">check</span>
                </button>
              )}
            </div>

          </div>

          <div className="mt-8 flex justify-center gap-6">
            <a className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Protocol</a>
            <a className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors" href="#">Clinical Compliance</a>
            <a className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors" href="#">Support Center</a>
          </div>

        </div>
      </section>
    </main>
  );
}
