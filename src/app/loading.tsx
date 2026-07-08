import React from 'react';

export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      padding: '2rem',
      gap: '2rem',
      height: '100%',
      width: '100%',
    }}>
      <div style={{
        height: '60px',
        width: '300px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        animation: 'pulse 1.5s infinite ease-in-out'
      }} />
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          height: '120px',
          flex: '1 1 200px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          animation: 'pulse 1.5s infinite ease-in-out'
        }} />
        <div style={{
          height: '120px',
          flex: '1 1 200px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          animation: 'pulse 1.5s infinite ease-in-out'
        }} />
        <div style={{
          height: '120px',
          flex: '1 1 200px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          animation: 'pulse 1.5s infinite ease-in-out'
        }} />
      </div>
      <div style={{
        height: '400px',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        animation: 'pulse 1.5s infinite ease-in-out'
      }} />

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
