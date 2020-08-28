import React, { useRef, useState } from 'react'
import { useRect } from '@reach/rect'

export const Screen = ({ template, background, iframeRef, onLoad, image }) => {
  const containerRef = useRef()
  const containerRect = useRect(containerRef)
  const [templateSize, setTemplateSize] = useState()

  return (
    <div
      ref={containerRef}
      css={`
        display: flex;
        align-items: center;
        align-self: stretch;
        justify-self: stretch;
        position: relative;
      `}
    >
      <div
        css={`
          background: ${background};
          box-shadow: rgba(0, 0, 0, 0.5) 0px 20px 100px -20px;
          box-sizing: content-box;
          position: absolute;
          top: 50%;
          left: 50%;
          width: ${templateSize?.width || 0}px;
          height: ${templateSize?.height || 0}px;
          transform: scale(${calcScale(containerRect, templateSize)})
            translate(-50%, -50%);
          overflow: hidden;
          transform-origin: top left;
        `}
      >
        <iframe
          ref={iframeRef}
          src={`/${template}.html`}
          onLoad={() => {
            const {
              offsetWidth: width,
              offsetHeight: height
            } = iframeRef.current.contentWindow.document.body
            setTemplateSize({ width, height })
            onLoad()
          }}
          css={`
            background: transparent;
            border: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          `}
        />
        {image.src != null ? (
          <img
            src={image.src}
            css={`
              pointer-events: none;
              opacity: ${image.opacity};
              background: transparent;
              object-fit: contain;
              border: none;
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            `}
          />
        ) : null}
      </div>
    </div>
  )
}

function calcScale(container, template) {
  if (!container || !template) {
    return 1
  }

  const ratio = container.width / container.height
  return ratio >= 16 / 9
    ? container.height / template.height
    : container.width / template.width
}
