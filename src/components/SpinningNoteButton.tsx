'use client';

export default function SpinningNoteButton({ children, pending, className, style, actionFn, size }: any) {
  return (
    <button formAction={actionFn} disabled={pending} className={className} style={{ ...style, position: 'relative', overflow: 'hidden' }}>
      {pending && (
        <span style={{ position: 'absolute', left: size === 'large' ? '20px' : '15px', top: '50%', transform: 'translateY(-50%)', display: 'flex', color: 'inherit' }}>
          <style dangerouslySetInnerHTML={{__html: `@keyframes spinNote { 100% { transform: translateY(-50%) rotate(360deg); } }`}} />
          <svg style={{ animation: 'spinNote 1s linear infinite' }} width={size === 'large' ? '24' : '20'} height={size === 'large' ? '24' : '20'} viewBox="0 0 24 24" fill="currentColor">
             <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </span>
      )}
      <span style={{ opacity: pending ? 0.7 : 1, paddingLeft: pending ? (size === 'large' ? '36px' : '28px') : '0', display: 'inline-block', transition: 'all 0.3s' }}>
        {children}
      </span>
    </button>
  );
}
