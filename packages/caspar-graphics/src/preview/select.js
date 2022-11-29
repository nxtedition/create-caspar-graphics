import React from 'react'
import {
  Listbox,
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
  ListboxOption
} from '@reach/listbox'
import '@reach/listbox/styles.css'
import { MdExpandMore } from 'react-icons/md'

export const Select = ({ children, value, onChange }) => {
  return (
    <ListboxInput
      value={value}
      onChange={onChange}
      css={`
        border: none;
        padding: 0;
      `}
    >
      <ListboxButton
        arrow={
          <MdExpandMore
            css={`
              font-size: 12px;
            `}
          />
        }
        css={`
          &[data-reach-listbox-button] {
            border: none;
            padding: 0;
            display: flex;
            align-items: center;

            & > span {
              margin-left: 3px;
            }
          }
        `}
      />
      <ListboxPopover>
        <ListboxList>{children}</ListboxList>
      </ListboxPopover>
    </ListboxInput>
  )
}

export const SelectOption = ({ children, value }) => {
  return (
    <ListboxOption
      value={value}
      css={`
        font-size: 12px;
      `}
    >
      {children}
    </ListboxOption>
  )
}
