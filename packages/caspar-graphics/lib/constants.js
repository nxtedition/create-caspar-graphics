export const isProduction = process.env.NODE_ENV === 'production'

export const States = {
  loading: 'LOADING',
  loaded: 'LOADED',
  playing: 'PLAYING',
  paused: 'PAUSED',
  stopping: 'STOPPING',
  stopped: 'STOPPED'
}
