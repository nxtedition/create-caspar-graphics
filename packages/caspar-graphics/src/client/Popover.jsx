import React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger
export const PopoverContent = props => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content {...props} />
    </PopoverPrimitive.Portal>
  )
}
