import React from 'react'
import { TimelineMax } from 'gsap'
import { getQueryData } from './utils/parse'
import { addCasparMethods, removeCasparMethods } from './utils/caspar-methods'
import { isProduction, States } from './constants'
import withTransition from './utils/with-transition'
import scaleToFit from './utils/scale-to-fit'

let timeline = new TimelineMax({ paused: true })

export default class Caspar extends React.Component {
  state = {
    isLoaded: false,
    didStart: false,
    didMount: false,
    didError: false,
    preventTimelineAutoplay: false,
    state: undefined,
    data: getQueryData()
  }

  constructor(props) {
    super()
    addCasparMethods(this)
    this.Graphic = withTransition(props.template, this.remove)
  }

  componentDidCatch(error, info) {
    this.log(error)
    this.setState({ didError: true })
  }

  onKeyDown = evt => {
    const fn = {
      F1: this.stop,
      F2: this.play,
      F3: this.load,
      F4: this.pause,
      F6: this.update,
      F7: this.preview,
      Backspace: this.stop,
      ' ': this.state.state === States.playing ? this.pause : this.play
    }[evt.key]
    fn && fn()
  }

  componentDidMount() {
    this.setState({ didMount: true })

    document.addEventListener('keydown', this.onKeyDown)

    if (this.props.autoPreview || this.state.data._autoPreview) {
      this.preview()
    }

    if (this.state.data._fit) {
      scaleToFit()
    }
  }

  componentWillUnmount() {
    removeCasparMethods(this)
    document.removeEventListener('keydown', this.onKeyDown)
    this.remove()
  }

  log = (message, ...rest) => {
    console.log(`${this.props.name || 'caspar'}${message}`)
    rest && rest.length && console.log(rest)
  }

  preview = () => {
    this.log('.preview()')
    this.setState({
      state: States.playing,
      didStart: true,
      data: {
        ...(this.props.template.previewData || {}),
        ...(getQueryData() || {})
      }
    })
  }

  play = () => {
    this.log('.play()')
    this.setState(state => ({
      didStart: true,
      state: States.playing,
      data: state.data || {}
    }))
  }

  stop = () => {
    this.log('.stop()')
    this.setState({
      state: States.stopped
    })
  }

  pause = () => {
    this.log('.pause()')
    this.setState({ state: States.paused }, () => {
      timeline.pause()
    })
  }

  load = () => {
    this.log('.load()')
    this.setState({ isLoaded: true })
  }

  update = (data = {}) => {
    this.log(`.update(${JSON.stringify(data || {}, null, 2)})`)
    this.setState({ data })
  }

  remove = () => {
    this.log('.remove()')
    timeline.clear()
    timeline.kill()
    timeline = new TimelineMax({ paused: true })
    this.setState({ didStart: false, data: getQueryData() })

    // TODO: Uncomment when caspar can handle it.
    // setTimeout(() => window.remove && window.remove(), 100)
  }

  disableAutoPlay = () => {
    this.setState({ preventTimelineAutoplay: true })
  }

  componentDidUpdate(prevProps, prevState) {
    const { preventTimelineAutoplay, state, didMount } = this.state

    if (
      didMount &&
      state === States.playing &&
      prevState.state !== States.playing &&
      preventTimelineAutoplay === false
    ) {
      timeline.play()
    }

    if (this.props.onStateChange && prevState.state !== state) {
      this.props.onStateChange(state)
    }
  }

  render() {
    const { Graphic } = this
    const { state, data, didStart } = this.state

    return (
      <div
        style={{
          background:
            data._bg != null
              ? data._bg === true
                ? '#5ebb78'
                : data._bg
              : 'none',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          height: '100%',
          width: '100%'
        }}
      >
        <Graphic
          shouldRender={state !== States.stopped}
          data={data}
          timeline={timeline}
          didStart={didStart}
          isPreview={!isProduction || data._preview === true}
          isPaused={state === States.paused}
          onRemove={this.remove}
          disableAutoPlay={this.disableAutoPlay}
        />
      </div>
    )
  }
}
