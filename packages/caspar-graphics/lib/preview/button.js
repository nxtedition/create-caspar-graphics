import React from 'react'

export default ({ children, style, onClick, title }) => (
  <button
    title={title}
    onClick={onClick}
    style={{
      background: 'none',
      color: 'inherit',
      outline: 'none',
      border: 'none',
      borderRadius: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
      ...style
    }}
  >
    {children}
  </button>
)
