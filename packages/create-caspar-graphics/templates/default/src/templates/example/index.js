import React from 'react'

export default class Example extends React.Component {
  static previewData = { text: 'Example Text' }

  componentDidMount() {
    this.props.timeline.from(this.el, 0.6, { opacity: 0, x: '-=30' })
  }

  componentWillLeave(callback) {
    this.props.timeline
      .eventCallback('onReverseComplete', callback)
      .timeScale(2)
      .reverse()
  }

  render() {
    const { text } = this.props.data

    return (
      <div
        ref={ref => {
          this.el = ref
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 20,
          bottom: 40,
          left: 100,
          height: 100,
          width: 600,
          background: '#673ab7',
          color: 'white',
          position: 'absolute',
          fontWeight: 'bold',
          fontSize: 44,
          borderRadius: 4
        }}
      >
        {text}
      </div>
    )
  }
}
