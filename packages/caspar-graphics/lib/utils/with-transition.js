import React from 'react'
import TransitionGroup from 'react-addons-transition-group'

function FirstChild(props) {
  const childrenArray = React.Children.toArray(props.children)
  return childrenArray[0] || null
}

export default (Component, onRemove) => {
  Component.prototype.componentDidLeave = onRemove

  return React.forwardRef(({ shouldRender, ...props }, ref) => (
    <TransitionGroup component={FirstChild}>
      {shouldRender && <Component {...props} ref={ref} />}
    </TransitionGroup>
  ))
}
