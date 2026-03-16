interface AvatarProps {
  src: string | null | undefined
  alt: string
  size?: number
}

export function Avatar({ src, alt, size = 32 }: AvatarProps) {
  if (!src) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full bg-[var(--lagoon)] flex items-center justify-center text-white text-xs font-semibold"
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover"
    />
  )
}
