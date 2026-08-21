import { useState } from 'react'

export type ReminderPreference = 'sound' | 'vibration' | 'both'

interface OnboardingProps {
  onComplete: (preference: ReminderPreference) => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [preference, setPreference] = useState<ReminderPreference>('both')

  // Screen 2: Location Request
  const handleRequestLocation = () => {
    if (!('geolocation' in navigator)) {
      setStep(3)
      return
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        // Granted
        setStep(3)
      },
      () => {
        // Denied or error
        setStep(3)
      },
      { timeout: 10000 }
    )
  }

  // Screen 3: Notification Request
  const handleRequestNotifications = async () => {
    if (!('Notification' in window)) {
      setStep(4)
      return
    }

    try {
      await Notification.requestPermission()
    } catch (e) {
      console.error(e)
    } finally {
      setStep(4)
    }
  }

  // Common wrapper for screens to maintain consistent layout
  const ScreenWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[var(--color-zone-bg)] px-6 py-12 text-center font-sans text-stone-900 animate-fade-in">
      <div className="flex w-full max-w-sm flex-col items-center">
        {children}
      </div>
    </div>
  )

  if (step === 1) {
    return (
      <ScreenWrapper>
        <div className="animate-fade-up">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">ZONE</h1>
          <p className="mb-8 text-sm font-medium tracking-widest text-stone-400 uppercase">
            Remember where.
          </p>
        </div>
        
        <p className="mb-12 text-lg text-stone-600 animate-fade-up delay-100">
          ZONE reminds you when you're near the places that matter.
        </p>
        
        <button
          onClick={() => setStep(2)}
          className="w-full rounded-2xl bg-stone-900 px-6 py-4 text-base font-medium text-white transition-transform hover:scale-[1.02] active:scale-95 animate-fade-up delay-200"
        >
          Continue
        </button>
      </ScreenWrapper>
    )
  }

  if (step === 2) {
    return (
      <ScreenWrapper>
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 animate-fade-up">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        
        <h2 className="mb-4 text-2xl font-semibold tracking-tight animate-fade-up delay-100">
          Let ZONE know where you are
        </h2>
        
        <p className="mb-12 text-stone-500 leading-relaxed animate-fade-up delay-200">
          Your location helps ZONE recognize when you're near a saved place and surface the right reminder.
        </p>
        
        <button
          onClick={handleRequestLocation}
          className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-base font-medium text-white transition-transform hover:scale-[1.02] active:scale-95 animate-fade-up delay-300"
        >
          Allow location
        </button>
        <button
          onClick={() => setStep(3)}
          className="mt-4 text-sm font-medium text-stone-400 hover:text-stone-600 transition-colors animate-fade-up delay-400"
        >
          Not now
        </button>
      </ScreenWrapper>
    )
  }

  if (step === 3) {
    return (
      <ScreenWrapper>
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 animate-fade-up">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        
        <h2 className="mb-4 text-2xl font-semibold tracking-tight animate-fade-up delay-100">
          Don't miss the moment
        </h2>
        
        <p className="mb-12 text-stone-500 leading-relaxed animate-fade-up delay-200">
          ZONE can notify you when a reminder becomes relevant nearby.
        </p>
        
        <button
          onClick={handleRequestNotifications}
          className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-base font-medium text-white transition-transform hover:scale-[1.02] active:scale-95 animate-fade-up delay-300"
        >
          Turn on notifications
        </button>
        <button
          onClick={() => setStep(4)}
          className="mt-4 text-sm font-medium text-stone-400 hover:text-stone-600 transition-colors animate-fade-up delay-400"
        >
          Not now
        </button>
      </ScreenWrapper>
    )
  }

  // Step 4: Preferences
  return (
    <ScreenWrapper>
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-600 animate-fade-up">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </div>
      
      <h2 className="mb-8 text-2xl font-semibold tracking-tight animate-fade-up delay-100">
        How should ZONE remind you?
      </h2>
      
      <div className="mb-12 flex w-full flex-col gap-3 animate-fade-up delay-200">
        {(['sound', 'vibration', 'both'] as ReminderPreference[]).map((opt) => (
          <button
            key={opt}
            role="radio"
            aria-checked={preference === opt}
            onClick={() => setPreference(opt)}
            className="zone-preference-card flex items-center justify-between rounded-2xl border p-4 text-left font-medium text-stone-700"
          >
            <span className="capitalize text-base">{opt}</span>
            <div className="zone-preference-icon flex h-5 w-5 items-center justify-center rounded-full border border-current">
              {preference === opt && <div className="h-2.5 w-2.5 rounded-full bg-current" />}
            </div>
          </button>
        ))}
      </div>
      
      <button
        onClick={() => onComplete(preference)}
        className="w-full rounded-2xl bg-stone-900 px-6 py-4 text-base font-medium text-white transition-transform hover:scale-[1.02] active:scale-95 animate-fade-up delay-300"
      >
        Start using ZONE
      </button>
    </ScreenWrapper>
  )
}
