import React from 'react';

export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      width: '100%',
      gap: '16px',
      padding: '40px 20px'
    }}>
      <div style={{
        width: '45px',
        height: '45px',
        border: '3.5px solid #f3f3f3',
        borderTop: '3.5px solid #cd1719', // DONAUTON Brand Red
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.9rem',
        fontWeight: 600,
        color: '#555',
        letterSpacing: '0.02em'
      }}>
        Wird geladen...
      </span>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
