import React from 'react'
import { getQueryData } from './utils/parse'
import { addCasparMethods, removeCasparMethods } from './utils/caspar-methods'
import { isProduction, States } from './constants'
import withTransition from './utils/with-transition'
import scaleToFit from './utils/scale-to-fit'

export default class Caspar extends React.Component {
  state = {
    isLoaded: false,
    didError: false,
    state: undefined,
    data: undefined
  }

  constructor(props) {
    super()

    addCasparMethods(this)
    this.Graphic = withTransition(props.template, this.remove)
    this.state.data = props.data || getQueryData()

    if (this.state.data._fit) {
      scaleToFit()
    }
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
      F7: this.preview
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

  stop = () => {
    this.log('.stop()')
    this.setState({ state: States.stopped })
  }

  pause = () => {
    this.log('.pause()')
    this.setState({ state: States.paused })
  }

  load = () => {
    this.log('.load()')
    this.setState({ isLoaded: true })
  }

  update = (data = this.props.data || {}) => {
    this.log(`.update(${JSON.stringify(data || {}, null, 2)})`)
    this.setState({ data })
  }

  remove = () => {
    this.log('.remove()')

    // TODO: Uncomment when caspar can handle it.
    // setTimeout(() => window.remove && window.remove(), 100)
  }

  componentDidUpdate(prevProps, prevState) {
    // New data from props (i.e. from dev preview).
    if (this.props.data !== prevProps.data) {
      this.update(this.props.data)
      return
    }

    // Notify listeners about changes in Caspar state.
    if (this.props.onStateChange && prevState.state !== this.state.state) {
      this.props.onStateChange(this.state.state)
    }
  }

  render() {
    const { Graphic } = this
    const { state, data, didError } = this.state

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
          data={data}
          state={state}
          shouldRender={state !== States.stopped && !didError}
          onRemove={this.remove}
        />
      </div>
    )
  }
}
