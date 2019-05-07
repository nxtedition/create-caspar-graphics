import React from 'react'
import { getQueryData } from './utils/parse'
import { addCasparMethods, removeCasparMethods } from './utils/caspar-methods'
import { isProduction, States } from './constants'
import scaleToFit from './utils/scale-to-fit'
import TransitionGroup from 'react-addons-transition-group'
import FirstChild from './utils/first-child'

export default class Caspar extends React.Component {
  static getDerivedStateFromProps(props, state) {
    // NOTE: This can only happen in development (from preview).
    // New data from props. Treat it as if a "normal" update() occured.
    if (props.data && props.data !== state.data) {
      const message = `.update(${JSON.stringify(props.data || {}, null, 2)})`
      console.log(`${props.name || 'caspar'}${message}`)
      return { data: props.data }
    }

    return null
  }

  constructor(props) {
    super()

    this.state = {
      state: States.loading,
      data: props.data || getQueryData(),
      didError: false,
      visibleReference: false,
      referenceImage: null
    }

    if (process.env.NODE_ENV !== 'production') {
      try {
        this.state.referenceImage = require(`${process.env.DEV_TEMPLATES_DIR}/${
          props.name
        }/reference.jpg`)
      } catch (e) {
        console.log('No reference image found')
      }
    }

    if (this.state.data._fit) {
      scaleToFit()
    }

    addCasparMethods(this)
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
      F9: this.toggleReference
    }[evt.key]
    fn && fn()
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown)

    if (this.props.autoPreview || this.state.data._autoPreview) {
      this.preview()
    }
  }

  componentWillUnmount() {
    removeCasparMethods(this)
    document.removeEventListener('keydown', this.onKeyDown)
  }

  log = (message, ...rest) => {
    console.log(`${this.props.name || 'caspar'}${message}`)
    rest && rest.length && console.log(rest)
  }

  update = (data = this.props.data || {}) => {
    this.log(`.update(${JSON.stringify(data || {}, null, 2)})`)
    this.setState({ data })
  }

  load = () => {
    this.log('.load()')
    this.setState({ state: States.loaded })
  }

  preview = () => {
    this.log('.preview()')
    this.setState({
      state: States.playing,
      data: this.props.data || {
        ...(this.props.template.previewData || {}),
        ...(getQueryData() || {})
      }
    })
  }

  play = () => {
    this.log('.play()')
    this.setState(state => ({
      state: States.playing,
      data: state.data || {}
    }))
  }

  pause = () => {
    this.log('.pause()')
    this.setState({ state: States.paused })
  }

  stop = () => {
    this.log('.stop()')
    this.setState({ state: States.stopping })
  }

  toggleReference = () => {
    if (isProduction) return

    if (!this.state.referenceImage) {
      return alert(
        `BEWARE! There\'s no reference image. Set an image findable at 'src/templates/${
          this.props.name
        }/reference.jpg' and try again.`
      )
    }

    this.setState({ visibleReference: !this.state.visibleReference })
  }

  componentDidLeave = () => {
    this.setState({ state: States.stopped })
    this.remove()
  }

  remove = () => {
    this.log('.remove()')
    // TODO: Uncomment when caspar can handle it.
    // setTimeout(() => window.remove && window.remove(), 100)
  }

  componentDidUpdate(prevProps, prevState) {
    // Notify listeners about changes in Caspar state.
    if (this.props.onStateChange && prevState.state !== this.state.state) {
      this.props.onStateChange(this.state.state)
    }

    // HACK: notify clients about the stopping state before starting
    // the unmounting process (once it's started, no prop updates will
    // propagate, but cDU is still called with old props).
    if (this.state.state === States.stopping) {
      this.setState({ state: States.willStop })
    }
  }

  render() {
    const { template: Template } = this.props
    const {
      state,
      data,
      didError,
      visibleReference,
      referenceImage
    } = this.state
    const shouldRender =
      !didError && state !== States.willStop && state !== States.stopped

    const mode = process.env.MODE
    const is720 = mode && mode.startsWith('720')
    const modeWidth = is720 ? 1280 : 1920

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
        <TransitionGroup component={FirstChild}>
          {shouldRender && <Template data={data} state={state} />}
        </TransitionGroup>

        {!isProduction &&
          referenceImage && (
            <div
              style={{
                position: 'absolute',
                pointerEvents: 'none',
                display: visibleReference ? 'flex' : 'none',
                opacity: 0.5
              }}
            >
              <img src={referenceImage} width={modeWidth} height="100%" />
            </div>
          )}
      </div>
    )
  }
}
