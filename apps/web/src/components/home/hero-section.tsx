'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import TypingAnimation from '../ui/typing-animation'

type OutfitSuggestion = {
  outfit: string
  occasion: string
  description: string
  src: string
}

const suggestions: OutfitSuggestion[] = [
  {
    outfit: 'Smart Casual Ensemble',
    occasion: 'Office & After-work',
    description:
      'Navy blazer paired with beige chinos, white oxford shirt, and brown leather sneakers. Perfect blend of professional and relaxed.',
    src: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    outfit: 'Urban Street Style',
    occasion: 'City Exploring',
    description:
      'Oversized white tee with black straight-leg jeans, light jacket, and white sneakers. Comfortable and trendy for any casual occasion.',
    src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    outfit: 'Evening Sophisticate',
    occasion: 'Dinner Date',
    description:
      'Charcoal slim-fit sweater, dark jeans, chelsea boots, and a minimal watch. Effortlessly stylish for evening plans.',
    src: 'https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
]

const AnimatedSuggestions = ({
  suggestions
}: {
  suggestions: OutfitSuggestion[]
}) => {
  const [active, setActive] = useState(0)

  const handleNext = () => {
    setActive((prev) => (prev + 1) % suggestions.length)
  }

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + suggestions.length) % suggestions.length)
  }

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10
  }

  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
      <div>
        <div className="relative h-96 w-full">
          <AnimatePresence>
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.outfit}
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  rotate: randomRotateY()
                }}
                animate={{
                  opacity: active === index ? 1 : 0.7,
                  scale: active === index ? 1 : 0.95,
                  rotate: active === index ? 0 : randomRotateY(),
                  zIndex:
                    active === index ? 999 : suggestions.length + 2 - index
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  rotate: randomRotateY()
                }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="absolute inset-0 origin-bottom rounded-xl bg-gray-900"
              >
                <Image
                  src={suggestion.src}
                  alt={suggestion.outfit}
                  className="h-full w-full rounded-xl object-cover"
                  width={500}
                  height={500}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col justify-between py-4">
        <motion.div
          key={active}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-black">
            {suggestions[active]?.outfit}
          </h3>
          <p className="text-sm text-gray-500">
            {suggestions[active]?.occasion}
          </p>
          <motion.p className="mt-6 text-lg text-gray-600">
            {suggestions[active]?.description.split(' ').map((word, index) => (
              <motion.span
                key={index}
                initial={{ filter: 'blur(10px)', opacity: 0, y: 5 }}
                animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.02
                }}
                className="inline-block"
              >
                {word}&nbsp;
              </motion.span>
            ))}
          </motion.p>
        </motion.div>

        <div className="flex gap-4 pt-8">
          <button
            onClick={handlePrev}
            className="group/button flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:rotate-12" />
          </button>
          <button
            onClick={handleNext}
            className="group/button flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <ArrowRight className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:-rotate-12" />
          </button>
        </div>
      </div>
    </div>
  )
}

const Card = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="group/canvas-card relative mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col items-start justify-center border border-black/[0.2] p-4 dark:border-white/[0.2]">
      <Icon className="absolute -left-3 -top-3 h-6 w-6 text-black dark:text-white" />
      <Icon className="absolute -bottom-3 -left-3 h-6 w-6 text-black dark:text-white" />
      <Icon className="absolute -right-3 -top-3 h-6 w-6 text-black dark:text-white" />
      <Icon className="absolute -bottom-3 -right-3 h-6 w-6 text-black dark:text-white" />
      {children}
    </div>
  )
}

const Icon = ({ className, ...rest }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  )
}

export function HeroSection() {
  return (
    <div className="relative mx-auto flex items-center justify-center bg-white px-8 pt-4 dark:bg-black">
      <Card>
        <div className="relative z-20 w-full">
          {/* AI Initial Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 max-w-2xl rounded-3xl bg-slate-800 p-6 dark:bg-white/[0.05]"
          >
            <p className="text-2xl text-black dark:text-white">
              Hey 👋, I'm Fizgo your ultimate fashion assistant. How can I help
              you today?
            </p>
          </motion.div>

          {/* User Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mb-8 ml-auto max-w-md rounded-3xl bg-slate-800 p-6 dark:bg-white/[0.05]"
          >
            <TypingAnimation
              className="text-2xl text-white"
              text="What should I wear tomorrow?"
              duration={70}
            />
            {/* <p className="text-xl text-white"></p> */}
          </motion.div>

          {/* Suggestions Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.3 }}
            className="ml-4 rounded-3xl bg-white p-8 dark:bg-white"
          >
            <AnimatedSuggestions suggestions={suggestions} />
          </motion.div>
        </div>
      </Card>
    </div>
  )
}
