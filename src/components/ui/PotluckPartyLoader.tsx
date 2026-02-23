'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Flame, Sparkles } from 'lucide-react'

type Bubble = { id: number; x: number; size: number; delay: number; duration: number }
type Sparkle = { id: number; x: number; y: number; size: number; delay: number }
type FlameParticle = { id: number; x: number; delay: number }

const DISHES = [
  { color: '#FF6B6B', name: 'Tomato', emoji: '🍅', gradient: 'from-red-400 to-orange-500' },
  { color: '#4ECDC4', name: 'Broccoli', emoji: '🥦', gradient: 'from-cyan-400 to-teal-500' },
  { color: '#FFE66D', name: 'Chicken', emoji: '🍗', gradient: 'from-yellow-400 to-amber-500' },
  { color: '#95E1D3', name: 'Carrot', emoji: '🥕', gradient: 'from-green-400 to-emerald-500' },
  { color: '#FF8B94', name: 'Onion', emoji: '🧅', gradient: 'from-pink-400 to-rose-500' },
  { color: '#DDA15E', name: 'Corn', emoji: '🌽', gradient: 'from-purple-400 to-indigo-500' },
] as const

export interface PotluckPartyLoaderProps {
  /** When true, fills parent (e.g. overlay). When false, uses min-h-screen. */
  fillContainer?: boolean
  /** Optional title override */
  title?: string
}

const CHEF_IMAGE = '/images/cooking.png'

export function PotluckPartyLoader({
  fillContainer,
  title = 'CATERING IN PROGRESS',
}: PotluckPartyLoaderProps) {
  const [activeItem, setActiveItem] = useState(0)
  const [cookingStage, setCookingStage] = useState<'prep' | 'cooking' | 'done'>('prep')
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [sparkles, setSparkles] = useState<Sparkle[]>([])
  const [flames, setFlames] = useState<FlameParticle[]>([])
  const [progress, setProgress] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [chefImageError, setChefImageError] = useState(false)

  const bgParticles = useMemo(
    () =>
      [...Array(20)].map((_, i) => ({
        key: i,
        w: 10 + Math.random() * 30,
        left: Math.random() * 100,
        top: Math.random() * 100,
        anim: 5 + Math.random() * 10,
        delay: Math.random() * 5,
      })),
    []
  )

  useEffect(() => {
    const itemInterval = setInterval(() => setActiveItem((p) => (p + 1) % DISHES.length), 2800)
    const stageInterval = setInterval(() => {
      setCookingStage((p) => (p === 'prep' ? 'cooking' : p === 'cooking' ? 'done' : 'prep'))
    }, 3000)
    const progressInterval = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 1)), 90)
    const rotationInterval = setInterval(() => setRotation((r) => r + 1), 100)
    return () => {
      clearInterval(itemInterval)
      clearInterval(stageInterval)
      clearInterval(progressInterval)
      clearInterval(rotationInterval)
    }
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setBubbles((prev) => [
        ...prev.slice(-12),
        {
          id: Date.now() + Math.random(),
          x: 30 + Math.random() * 40,
          size: 4 + Math.random() * 8,
          delay: Math.random() * 0.5,
          duration: 1.5 + Math.random() * 1,
        },
      ])
    }, 200)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setSparkles((prev) => [
        ...prev.slice(-15),
        {
          id: Date.now() + Math.random(),
          x: Math.random() * 400 - 200,
          y: Math.random() * 400 - 200,
          size: 8 + Math.random() * 16,
          delay: Math.random() * 0.3,
        },
      ])
    }, 400)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setFlames((prev) => [
        ...prev.slice(-6),
        { id: Date.now() + Math.random(), x: 30 + Math.random() * 40, delay: Math.random() * 0.3 },
      ])
    }, 300)
    return () => clearInterval(t)
  }, [])

  const containerClass = fillContainer
    ? 'flex min-h-full w-full flex-col items-center justify-center overflow-hidden relative'
    : 'flex min-h-screen flex-col items-center justify-center overflow-hidden relative'

  return (
    <div
      className={`${containerClass} bg-gradient-to-br from-gray-900 via-gray-800 to-black`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="absolute inset-0 overflow-hidden">
        {bgParticles.map((p) => (
          <div
            key={p.key}
            className="absolute rounded-full bg-white opacity-10"
            style={{
              width: `${p.w}px`,
              height: `${p.w}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animation: `potluck-float ${p.anim}s ease-in-out infinite ${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Main cooking area - compact */}
        <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 opacity-20 blur-2xl sm:blur-3xl"
            style={{ animation: 'potluck-pulse 3s ease-in-out infinite' }}
          />

          {/* STEAM WISPS */}
          <div
            className="absolute top-10 left-1/2 w-full pointer-events-none"
            style={{ transform: 'translateX(-50%)' }}
          >
            {['💨', '💭', '💨'].map((steam, idx) => (
              <div
                key={idx}
                className="absolute text-lg sm:text-xl"
                style={{
                  left: `${35 + idx * 15}%`,
                  animation: `potluck-steam-rise 3s infinite ease-out ${idx * 0.8}s`,
                }}
              >
                {steam}
              </div>
            ))}
          </div>

          {/* Flames under chef */}
          <div
            className="absolute bottom-4 left-1/2 flex h-12 w-40 items-end justify-center gap-1 sm:h-14 sm:w-44"
            style={{ transform: 'translateX(-50%)' }}
          >
            {flames.map((f) => (
              <div
                key={f.id}
                className="absolute bottom-0"
                style={{ left: `${f.x}%`, animation: `potluck-flame-rise 1.5s ease-out forwards ${f.delay}s` }}
              >
                <Flame className="h-4 w-4 text-orange-500 drop-shadow-lg sm:h-5 sm:w-5" fill="currentColor" aria-hidden />
              </div>
            ))}
          </div>

          {/* Chef - compact */}
          <div
            className="relative z-10 flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20"
            style={{ animation: 'potluck-pot-shuffle 4s infinite ease-in-out' }}
          >
            <div
              className="relative flex h-full w-full flex-col items-center justify-center rounded-xl p-1.5 shadow-xl sm:p-2"
              style={{
                background: 'linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%)',
              }}
            >
              {!chefImageError ? (
                <img
                  src={CHEF_IMAGE}
                  alt="Chef cooking"
                  className="h-full w-full object-contain"
                  onError={() => setChefImageError(true)}
                />
              ) : (
                <>
                  <div className="text-3xl leading-none sm:text-4xl">👨‍🍳</div>
                  <div className="text-2xl sm:text-3xl">🍲</div>
                </>
              )}
            </div>

            {/* Bubbles from pot */}
            <div
              className="pointer-events-none absolute top-5 left-1/2 h-10 w-10 sm:top-6 sm:h-12 sm:w-12"
              style={{ transform: 'translateX(-50%)' }}
            >
              {bubbles.map((b) => (
                <div
                  key={b.id}
                  className="absolute bottom-0 rounded-full bg-white shadow opacity-60"
                  style={{
                    left: `${b.x}%`,
                    width: `${Math.min(b.size, 6)}px`,
                    height: `${Math.min(b.size, 6)}px`,
                    animation: `potluck-rise ${b.duration}s ease-out forwards ${b.delay}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Rotating vegetables around chef - compact orbit */}
          <div
            className="absolute top-1/2 left-1/2 h-56 w-56 sm:h-64 sm:w-64"
            style={{ transform: `translate(-50%, -50%) rotate(${rotation * 0.2}deg)` }}
          >
            {DISHES.map((d, idx) => {
              const angle = (idx / DISHES.length) * 360
              const isActive = idx === activeItem
              const radius = 100
              return (
                <div
                  key={`circle-${idx}`}
                  className="absolute top-1/2 left-1/2 transition-all duration-700 ease-out"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg) scale(${isActive ? 1.3 : 0.85})`,
                    opacity: isActive ? 1 : 0.5,
                    filter: isActive ? 'drop-shadow(0 0 12px rgba(255,255,255,0.8))' : 'none',
                  }}
                >
                  <div
                    className={`relative overflow-hidden rounded-xl p-2 shadow-lg transition-all duration-700 sm:p-2.5 ${isActive ? 'animate-pulse' : ''}`}
                    style={{
                      backgroundColor: d.color,
                      animation: isActive ? 'potluck-glow 1.5s ease-in-out infinite' : 'none',
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${d.gradient} opacity-50`} />
                    <div className="relative z-10 flex items-center justify-center text-2xl sm:text-3xl">{d.emoji}</div>
                    <div
                      className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0"
                      style={{ animation: isActive ? 'potluck-shine 2s ease-in-out infinite' : 'none' }}
                    />
                  </div>
                  {isActive && (
                    <div
                      className="absolute left-1/2 whitespace-nowrap"
                      style={{ bottom: '-24px', transform: 'translateX(-50%)' }}
                    >
                      <div className="animate-[potluck-fade-in_0.3s_ease-out] rounded-full bg-white px-1.5 py-0.5 shadow sm:px-2 sm:py-1">
                        <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-[10px] font-medium text-transparent sm:text-[11px]">
                          {d.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Sparkles - scaled down */}
          {sparkles.map((s) => (
            <div
              key={s.id}
              className="absolute top-1/2 left-1/2 pointer-events-none"
              style={
                {
                  '--potluck-tx': `${s.x * 0.5}px`,
                  '--potluck-ty': `${s.y * 0.5}px`,
                  transform: `translate(${s.x * 0.5}px, ${s.y * 0.5}px)`,
                  animation: `potluck-sparkle 2s ease-out forwards ${s.delay}s`,
                } as React.CSSProperties
              }
            >
              <Sparkles
                className="text-yellow-400"
                style={{ width: Math.min(s.size, 12), height: Math.min(s.size, 12) }}
                aria-hidden
              />
            </div>
          ))}
        </div>

        {/* Progress bar - compact */}
        <div className="mx-auto mt-6 w-56 max-w-[85vw] sm:mt-8 sm:w-64">
          <div className="relative h-2 overflow-hidden rounded-full border border-gray-600 bg-gray-700 shadow-inner">
            <div
              className="relative h-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 animate-pulse bg-white opacity-30" />
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
                style={{ animation: 'potluck-slide-progress 1.5s ease-in-out infinite' }}
              />
            </div>
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] font-medium text-gray-400 sm:text-xs">
            <span>Cooking...</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Title & stage - compact */}
        <div className="mt-4 text-center sm:mt-6">
          <h2
            className="mb-2 text-lg font-bold text-white sm:text-xl"
            style={{
              animation: 'potluck-text-glow-dark 3s ease-in-out infinite',
              textShadow: '0 0 12px rgba(255,255,255,0.5), 0 0 24px rgba(255,105,180,0.3)',
              letterSpacing: '2px',
            }}
          >
            {title}
          </h2>
          <div className="mb-2 flex items-center justify-center gap-1.5 sm:mb-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow sm:h-2.5 sm:w-2.5"
                style={{ animation: `potluck-dot-pulse 1.8s ease-in-out infinite ${i * 0.2}s` }}
              />
            ))}
          </div>
          <div className="mx-auto flex max-w-xs items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800/80 p-2.5 shadow-xl backdrop-blur-sm sm:gap-2.5 sm:p-3">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 animate-spin sm:h-8 sm:w-8"
              style={{ animationDuration: '3s' }}
            >
              <span className="text-base sm:text-lg">
                {cookingStage === 'prep' && '🥄'}
                {cookingStage === 'cooking' && '🔥'}
                {cookingStage === 'done' && '✨'}
              </span>
            </div>
            <p className="text-sm font-bold capitalize text-gray-200 transition-all duration-500 sm:text-base">
              {cookingStage === 'prep' && 'Preparing ingredients with care'}
              {cookingStage === 'cooking' && 'Cooking with passion & love'}
              {cookingStage === 'done' && 'Almost ready to serve!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
