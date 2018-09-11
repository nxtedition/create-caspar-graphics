import React from 'react'
import Measure from 'react-measure'

export default class Screen extends React.Component {
  state = { scale: 1 }

  render() {
    const { scale, showControls } = this.state

    return (
      <Measure
        bounds
        onResize={contentRect => {
          const { height, width } = contentRect.bounds
          const ratio = width / height
          const scale =
            ratio >= 16 / 9
              ? height / this.props.height
              : width / this.props.width

          console.log('resize')
          this.setState({ scale })
          this.props.onSizeChange({
            height: this.props.height * scale,
            width: this.props.width * scale
          })
        }}
      >
        {({ measureRef }) => (
          <div
            ref={measureRef}
            onMouseEnter={() => {
              this.setState({ showControls: true })
            }}
            onMouseLeave={() => {
              this.setState({ showControls: false })
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: '1 0 0',
              position: 'relative'
            }}
          >
            <div
              style={{
                background: this.props.background,
                boxShadow: 'rgba(0, 0, 0, 0.5) 0px 20px 100px -20px',
                boxSizing: 'content-box',
                position: 'absolute',
                width: this.props.width,
                height: this.props.height,
                top: '50%',
                left: '50%',
                overflow: 'hidden',
                transform: `scale(${scale}) translate(-50%, -50%)`,
                transformOrigin: 'top left'
              }}
            >
              {this.props.children}
            </div>
            {/* <div style={{
              position: 'absolute',
              bottom: showControls ? 0 : -50,
              left: 0,
              height: 50,
              background: 'rgba(0, 0, 0, .3)',
              color: 'white',
              width: '100%'
            }}>
              <MdFullscreen />
            </div> */}
          </div>
        )}
      </Measure>
    )
  }
}
