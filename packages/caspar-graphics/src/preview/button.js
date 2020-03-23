import React from 'react'

export default ({ children, ...props }) => (
  <button
    {...props}
    css={`
      background: none;
      color: #6e6e6e;
      outline: none;
      border-radius: 4px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      transition: color 0.2s ease;

      &:hover {
        cursor: pointer;
        color: #444;
      }

      &:active {
        cursor: pointer;
        color: #6e6e6e;
      }

      &[disabled] {
        cursor: default;
        color: #999;
      }
    `}
  >
    {children}
  </button>
)
