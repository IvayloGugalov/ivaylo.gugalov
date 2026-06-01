import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText as GSAPSplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP)

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  ease?: string
  splitType?: string
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  threshold?: number
  rootMargin?: string
  textAlign?: React.CSSProperties['textAlign']
  tag?: React.ElementType
  onLetterAnimationComplete?: () => void
}

const SplitText = ({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'left',
  tag = 'p',
  onLetterAnimationComplete,
}: SplitTextProps) => {
  const ref = useRef<HTMLElement>(null)
  const animationCompletedRef = useRef(false)
  const onCompleteRef = useRef(onLetterAnimationComplete)
  const [fontsLoaded, setFontsLoaded] = useState(false)

  // Read the OS reduced-motion preference once at mount (SSR-guarded). When
  // reduced, we skip the staggered tween and present the final visible state.
  const prefersReducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete
  }, [onLetterAnimationComplete])

  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true)
    } else {
      document.fonts.ready.then(() => setFontsLoaded(true))
    }
    // Failsafe: never let fonts.ready stall the reveal. If it hasn't resolved
    // within 3s, proceed anyway so the text cannot stay permanently hidden.
    const failsafe = window.setTimeout(() => setFontsLoaded(true), 3000)
    return () => window.clearTimeout(failsafe)
  }, [])

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return
      if (animationCompletedRef.current) return

      const el = ref.current as HTMLElement & {
        _rbsplitInstance?: InstanceType<typeof GSAPSplitText>
      }

      // Reduced motion: skip the split/stagger entirely and show the text in
      // its final visible state (opacity 1, no transform) right away.
      if (prefersReducedMotion) {
        gsap.set(el, { clearProps: 'all' })
        gsap.set(el, { opacity: 1, x: 0, y: 0 })
        animationCompletedRef.current = true
        onCompleteRef.current?.()
        return
      }

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert()
        } catch (_) {
          /* noop */
        }
        el._rbsplitInstance = undefined
      }

      const startPct = (1 - threshold) * 100
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin)
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px'
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`
      const start = `top ${startPct}%${sign}`

      let targets: gsap.DOMTarget

      const assignTargets = (self: InstanceType<typeof GSAPSplitText>) => {
        if (splitType.includes('chars') && self.chars?.length) targets = self.chars
        if (!targets && splitType.includes('words') && self.words?.length)
          targets = self.words
        if (!targets && splitType.includes('lines') && self.lines?.length)
          targets = self.lines
        if (!targets) targets = self.chars || self.words || self.lines || []
      }

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: (self) => {
          assignTargets(self)
          const tween = gsap.fromTo(
            targets,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              // Don't apply the invisible `from` state until the trigger fires.
              // Otherwise chars sit at opacity:0 and, if the element is never
              // scrolled into view, the text stays permanently invisible.
              immediateRender: false,
              scrollTrigger: {
                trigger: el,
                start,
                once: true,
                fastScrollEnd: true,
                anticipatePin: 0.4,
              },
              onComplete: () => {
                animationCompletedRef.current = true
                onCompleteRef.current?.()
              },
              willChange: 'transform, opacity',
              force3D: true,
            },
          )
          return tween
        },
      })

      el._rbsplitInstance = splitInstance

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === el) st.kill()
        })
        try {
          splitInstance.revert()
        } catch (_) {
          /* noop */
        }
        el._rbsplitInstance = undefined
      }
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
        prefersReducedMotion,
      ],
      scope: ref,
    },
  )

  const renderTag = () => {
    const style: React.CSSProperties = {
      textAlign,
      overflow: 'hidden',
      display: 'block',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      willChange: 'transform, opacity',
    }
    const classes = `split-parent ${className}`
    const Tag = tag || 'p'
    return (
      <Tag ref={ref} style={style} className={classes}>
        {text}
      </Tag>
    )
  }

  return renderTag()
}

export default SplitText
