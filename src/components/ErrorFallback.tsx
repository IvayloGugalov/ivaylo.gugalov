interface ErrorFallbackProps {
  message: string
  onRetry: () => void
}

export function ErrorFallback({ message, onRetry }: ErrorFallbackProps) {
  return (
    <div className='flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4'>
      <p className='text-text-secondary'>Something went wrong: {message}</p>
      <button
        type='button'
        onClick={onRetry}
        className='text-sm text-accent-primary underline underline-offset-2 hover:opacity-80 transition-opacity'
      >
        Try again
      </button>
    </div>
  )
}
