

export function SimpleTest() {
  console.log('🧪 SimpleTest component rendering...')
  
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'red',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      zIndex: 9999,
      fontSize: '16px',
      fontWeight: 'bold'
    }}>
      🧪 React is working! 
      <br />
      Timestamp: {new Date().toLocaleTimeString()}
    </div>
  )
} 