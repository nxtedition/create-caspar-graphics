import React from 'react'

export default function FirstChild(props) {
  const childrenArray = React.Children.toArray(props.children)
  return childrenArray[0] || null
}
