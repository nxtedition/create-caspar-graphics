import React from 'react'
import Measure from 'react-measure'

const calcScale = (containerBounds, graphicBounds) => {
  const ratio = containerBounds.width / containerBounds.height
  return ratio >= 16 / 9
    ? containerBounds.height / graphicBounds.height
    : containerBounds.width / graphicBounds.width
}

export default class Screen extends React.Component {
  state = { scale: 1, isFullscreen: false }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange)
    document.addEventListener('fullscreenchange', this.onFullscreenChange)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener(
      'webkitfullscreenchange',
      this.onFullscreenChange
    )
    document.removeEventListener('fullscreenchange ', this.onFullscreenChange)
  }

  onFullscreenChange = () => {
    this.setState({
      isFullscreen:
        (document.fullscreenElement || document.webkitFullscreenElement) != null
    })
  }

  enterFullscreen = () => {
    if (this.ref.requestFullscreen) {
      this.ref.requestFullscreen()
    } else if (this.ref.webkitRequestFullscreen) {
      this.ref.webkitRequestFullscreen()
    }
  }

  exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
  }

  onKeyDown = evt => {
    if (evt.key !== 'f' || !this.ref) {
      return
    }

    if (this.state.isFullscreen) {
      this.exitFullscreen()
    } else {
      this.enterFullscreen()
    }
  }

  render() {
    const { height, width } = this.props
    const { showControls, isFullscreen } = this.state
    let scale = !isFullscreen
      ? this.state.scale
      : calcScale(
          { height: window.screen.height, width: window.screen.width },
          { height, width }
        )

    return (
      <Measure
        bounds
        onResize={contentRect => {
          const scale = calcScale(contentRect.bounds, { width, height })
          this.setState({ scale })
          this.props.onSizeChange({
            height: height * scale,
            width: width * scale
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
              ref={ref => {
                this.ref = ref
              }}
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
