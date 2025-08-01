import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * VALIDATION UTILITIES
 * Centralized validation logic for all form fields
 */
const validation = {
  validateEmail: (email) => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : 'Please enter a valid email address';
  },

  validateFullName: (name) => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return null;
  },

  validateUsername: (username) => {
    if (!username.trim()) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  },

  validatePassword: (password) => {
    if (!password.trim()) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  },

  validateTheme: (theme) => {
    if (!theme) return 'Please select a theme';
    return null;
  }
};

/**
 * CUSTOM HOOK: useOnboardingForm
 * Encapsulates all form state management and business logic
 */
const useOnboardingForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    theme: '',
    newsletter: false
  });
  
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form field and clear related errors
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Validate current step
  const validateStep = useCallback((step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        newErrors.fullName = validation.validateFullName(formData.fullName);
        newErrors.email = validation.validateEmail(formData.email);
        break;
      case 2:
        newErrors.username = validation.validateUsername(formData.username);
        newErrors.password = validation.validatePassword(formData.password);
        break;
      case 3:
        newErrors.theme = validation.validateTheme(formData.theme);
        break;
    }
    
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([, error]) => error !== null)
    );
    
    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  }, [formData]);

  // Navigation methods
  const goToNextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  }, [currentStep, validateStep]);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  }, []);

  // Form submission
  const submitForm = useCallback(async () => {
    if (!validateStep(3)) return false;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call - replace with actual submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    } catch (error) {
      console.error('Form submission failed:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateStep]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData({
      fullName: '', email: '', username: '', 
      password: '', theme: '', newsletter: false
    });
    setErrors({});
    setCurrentStep(1);
    setIsSubmitting(false);
  }, []);

  return {
    formData, errors, currentStep, isSubmitting,
    updateField, validateStep, goToNextStep, 
    goToPreviousStep, submitForm, resetForm
  };
};

/**
 * REUSABLE UI COMPONENTS
 */

// Reusable Button Component
const Button = ({ 
  children, onClick, disabled = false, variant = 'primary', 
  className = '', ariaLabel, ...props 
}) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-400',
    secondaryDark: 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500 disabled:bg-gray-700 disabled:text-gray-500'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'cursor-not-allowed' : ''} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
};

// Step Progress Indicator
const StepIndicator = ({ steps, currentStep }) => (
  <div className="flex space-x-4" role="progressbar" aria-valuemax={steps.length} aria-valuenow={currentStep}>
    {steps.map((step) => (
      <div
        key={step.number}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
          currentStep === step.number
            ? 'bg-white bg-opacity-20 border-2 border-white scale-105'
            : currentStep > step.number
            ? 'bg-green-500 bg-opacity-80'
            : 'bg-white bg-opacity-10'
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            currentStep > step.number
              ? 'bg-green-600 text-white'
              : 'bg-white text-blue-600'
          }`}
        >
          {currentStep > step.number ? '✓' : step.number}
        </div>
        <span className="text-sm font-medium">{step.title}</span>
      </div>
    ))}
  </div>
);

/**
 * STEP COMPONENTS
 */

// Step 1: Personal Information
const PersonalInfoStep = ({ data, onChange, errors, isDarkMode }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h2 className={`text-2xl font-bold mb-2 transition-colors ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Personal Information
      </h2>
      <p className={`transition-colors ${
        isDarkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        Let's start with your basic details
      </p>
    </div>
    
    <div className="space-y-4">
      {/* Full Name Input */}
      <div>
        <label htmlFor="fullName" className={`block text-sm font-medium mb-2 transition-colors ${
          isDarkMode ? 'text-gray-200' : 'text-gray-700'
        }`}>
          Full Name *
        </label>
        <input
          type="text"
          id="fullName"
          value={data.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
            errors.fullName 
              ? 'border-red-500 bg-red-50' 
              : isDarkMode 
                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                : 'border-gray-300 bg-white'
          }`}
          placeholder="Enter your full name"
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          aria-invalid={!!errors.fullName}
        />
        {errors.fullName && (
          <p id="fullName-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.fullName}
          </p>
        )}
      </div>
      
      {/* Email Input */}
      <div>
        <label htmlFor="email" className={`block text-sm font-medium mb-2 transition-colors ${
          isDarkMode ? 'text-gray-200' : 'text-gray-700'
        }`}>
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
            errors.email 
              ? 'border-red-500 bg-red-50' 
              : isDarkMode 
                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                : 'border-gray-300 bg-white'
          }`}
          placeholder="Enter your email address"
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.email}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Step 2: Account Setup
const AccountSetupStep = ({ data, onChange, errors, isDarkMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold mb-2 transition-colors ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Account Setup
        </h2>
        <p className={`transition-colors ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Create your account credentials
        </p>
      </div>
      
      <div className="space-y-4">
        {/* Username Input */}
        <div>
          <label htmlFor="username" className={`block text-sm font-medium mb-2 transition-colors ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Username *
          </label>
          <input
            type="text"
            id="username"
            value={data.username}
            onChange={(e) => onChange('username', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.username 
                ? 'border-red-500 bg-red-50' 
                : isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                  : 'border-gray-300 bg-white'
            }`}
            placeholder="Choose a username"
            aria-describedby={errors.username ? 'username-error' : undefined}
            aria-invalid={!!errors.username}
          />
          {errors.username && (
            <p id="username-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.username}
            </p>
          )}
        </div>
        
        {/* Password Input with Show/Hide */}
        <div>
          <label htmlFor="password" className={`block text-sm font-medium mb-2 transition-colors ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={data.password}
              onChange={(e) => onChange('password', e.target.value)}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.password 
                  ? 'border-red-500 bg-red-50' 
                  : isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-300 bg-white'
              }`}
              placeholder="Create a secure password"
              aria-describedby={errors.password ? 'password-error' : 'password-help'}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password ? (
            <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.password}
            </p>
          ) : (
            <p id="password-help" className={`mt-1 text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Minimum 6 characters required
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Step 3: Preferences with INNOVATIVE Theme Preview
const PreferencesStep = ({ data, onChange, errors, isDarkMode }) => {
  // Theme configuration with preview data
  const themeOptions = [
    {
      value: 'Light',
      label: 'Light',
      description: 'Clean and bright interface',
      preview: {
        bg: 'bg-white',
        bars: 'bg-gray-300',
        dots: ['bg-red-400', 'bg-yellow-400', 'bg-green-400']
      }
    },
    {
      value: 'Dark',
      label: 'Dark',
      description: 'Easy on the eyes',
      preview: {
        bg: 'bg-gray-800',
        bars: 'bg-gray-600',
        dots: ['bg-red-400', 'bg-yellow-400', 'bg-green-400']
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold mb-2 transition-colors ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Preferences
        </h2>
        <p className={`transition-colors ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Customize your experience with live preview
        </p>
      </div>
      
      <div className="space-y-6">
        {/* INNOVATIVE Interactive Theme Selection */}
        <div>
          <label className={`block text-sm font-medium mb-3 transition-colors ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Theme Selection * <span className="text-blue-500 text-xs">(Live Preview!)</span>
          </label>
          
          <div className="grid grid-cols-2 gap-4" role="radiogroup">
            {themeOptions.map((theme) => (
              <div
                key={theme.value}
                onClick={() => onChange('theme', theme.value)}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-300 hover:scale-105 ${
                  data.theme === theme.value
                    ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg transform scale-105'
                    : isDarkMode
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
                role="radio"
                aria-checked={data.theme === theme.value}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange('theme', theme.value);
                  }
                }}
              >
                {/* Theme Preview Mockup */}
                <div className={`${theme.preview.bg} rounded-md p-3 shadow-sm mb-3 border ${
                  theme.value === 'Dark' ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  {/* Window Controls */}
                  <div className="flex items-center justify-between mb-2">
                    {theme.preview.dots.map((dotColor, index) => (
                      <div key={index} className={`w-3 h-3 ${dotColor} rounded-full`}></div>
                    ))}
                  </div>
                  {/* Content Lines */}
                  <div className="space-y-1">
                    <div className={`h-2 ${theme.preview.bars} rounded w-3/4`}></div>
                    <div className={`h-2 ${theme.preview.bars} rounded w-1/2`}></div>
                    <div className={`h-2 ${theme.preview.bars} rounded w-2/3`}></div>
                  </div>
                </div>
                
                {/* Theme Label */}
                <div className="text-center">
                  <span className={`font-medium text-sm transition-colors ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {theme.label}
                  </span>
                  <p className={`text-xs mt-1 transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {theme.description}
                  </p>
                  {data.theme === theme.value && (
                    <div className="text-blue-500 text-xs mt-2 font-medium animate-pulse">
                      ✨ Selected & Applied!
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {errors.theme && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {errors.theme}
            </p>
          )}
        </div>
        
        {/* Newsletter Subscription */}
        <div>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={data.newsletter}
              onChange={(e) => onChange('newsletter', e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <div>
              <span className={`text-sm font-medium transition-colors ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Subscribe to newsletter
              </span>
              <p className={`text-xs transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Get updates, tips, and exclusive content
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

/**
 * MAIN ONBOARDING MODAL COMPONENT
 * Orchestrates the entire multi-step onboarding process
 */
export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Custom hook handles all form logic
  const {
    formData, errors, currentStep, isSubmitting,
    updateField, goToNextStep, goToPreviousStep, 
    submitForm, resetForm
  } = useOnboardingForm();

  // Step configuration - easily extensible
  const steps = useMemo(() => [
    { number: 1, title: 'Personal Info', component: PersonalInfoStep },
    { number: 2, title: 'Account Setup', component: AccountSetupStep },
    { number: 3, title: 'Preferences', component: PreferencesStep }
  ], []);

  // Theme system
  const isDarkMode = formData.theme === 'Dark';

  // Modal handlers
  const handleOpenModal = useCallback(() => {
    setIsOpen(true);
    resetForm();
  }, [resetForm]);

  const handleCloseModal = useCallback(() => {
    const hasData = Object.values(formData).some(value => 
      typeof value === 'string' ? value.trim() : value
    );
    
    if (hasData && !window.confirm('Close and lose progress?')) return;
    
    setIsOpen(false);
    resetForm();
  }, [formData, resetForm]);

  const handleSubmit = useCallback(async () => {
    const success = await submitForm();
    
    if (success) {
      alert('🎉 Welcome to Quixess! Your account has been created successfully.');
      setIsOpen(false);
      resetForm();
    } else {
      alert('❌ Something went wrong. Please try again.');
    }
  }, [submitForm, resetForm]);

  // Keyboard navigation for accessibility
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    
    if (e.key === 'Escape') handleCloseModal();
    
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      if (e.key === 'ArrowRight' && currentStep < 3) goToNextStep();
      if (e.key === 'ArrowLeft' && currentStep > 1) goToPreviousStep();
    }
  }, [isOpen, currentStep, handleCloseModal, goToNextStep, goToPreviousStep]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      
      {/* Trigger Button */}
      <Button
        onClick={handleOpenModal}
        className="shadow-lg transform hover:scale-105 text-lg"
        ariaLabel="Start the onboarding process"
      >
        🚀 Start Quixess Onboarding
      </Button>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fadeIn transition-all duration-500 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 id="modal-title" className="text-2xl font-bold">Welcome to Quixess</h1>
                <Button
                  onClick={handleCloseModal}
                  className="!p-2 !bg-transparent hover:!bg-white hover:!bg-opacity-10 text-white text-2xl"
                  ariaLabel="Close modal"
                >
                  ×
                </Button>
              </div>
              
              <p id="modal-description" className="text-blue-100 mb-4">
                Complete your profile in {steps.length} easy steps
              </p>
              
              {/* Step Indicators */}
              <StepIndicator steps={steps} currentStep={currentStep} />
            </div>

            {/* Content */}
            <div className="p-8 max-h-[calc(90vh-200px)] overflow-y-auto">
              {/* Progress Bar */}
              <div className={`w-full h-2 rounded-full mb-8 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  role="progressbar"
                  aria-valuenow={currentStep}
                  aria-valuemax={steps.length}
                />
              </div>

              {/* Dynamic Step Content */}
              <div className="min-h-[400px] transition-all duration-300" key={currentStep}>
                <CurrentStepComponent
                  data={formData}
                  onChange={updateField}
                  errors={errors}
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Navigation */}
              <div className={`flex justify-between items-center pt-8 border-t transition-colors ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <Button
                  onClick={goToPreviousStep}
                  disabled={currentStep === 1}
                  variant={isDarkMode ? 'secondaryDark' : 'secondary'}
                  ariaLabel="Go to previous step"
                >
                  ← Back
                </Button>

                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {currentStep} of {steps.length}
                  </span>

                  {currentStep < steps.length ? (
                    <Button onClick={goToNextStep} ariaLabel="Go to next step">
                      Next →
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      variant="success"
                      ariaLabel="Complete onboarding"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="inline-block animate-spin mr-2">⚪</span>
                          Submitting...
                        </>
                      ) : (
                        '✨ Complete Setup'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations & Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        /* Smooth theme transitions */
        * {
          transition-property: background-color, border-color, color;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 200ms;
        }
      `}</style>
    </div>
  );
}