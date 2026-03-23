import type { SpringOptions } from 'motion/react'
import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

const springValues: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2,
}

interface TiltWrapperProps {
  children: React.ReactNode
  className?: string
  rotateAmplitude?: number
  scaleOnHover?: number
}

export function TiltWrapper({
  children,
  className,
  rotateAmplitude = 8,
  scaleOnHover = 1.02,
}: TiltWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(useMotionValue(0), springValues)
  const rotateY = useSpring(useMotionValue(0), springValues)
  const scale = useSpring(1, springValues)

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - rect.width / 2
    const offsetY = e.clientY - rect.top - rect.height / 2
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude)
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude)
  }

  return (
    <div style={{ perspective: '800px' }} className={className}>
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, scale, transformStyle: 'preserve-3d', height: '100%' }}
        onMouseMove={handleMouse}
        onMouseEnter={() => scale.set(scaleOnHover)}
        onMouseLeave={() => {
          scale.set(1)
          rotateX.set(0)
          rotateY.set(0)
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
