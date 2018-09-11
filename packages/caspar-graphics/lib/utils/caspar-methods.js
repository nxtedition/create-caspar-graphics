import { parse } from './parse'
const CG_TEMPLATE_METHODS = ['load', 'play', 'pause', 'stop', 'update']

const listeners = new Map()

function emit(name, ...args) {
  const listener = listeners.get(name)

  if (!listener && name === 'error') {
    throw args[0]
  } else if (!listener) {
    return
  }

  console.log(name + ' ' + args.join(' '))

  if (name === 'update') {
    try {
      args[0] = args[0]
        ? typeof args[0] === 'string'
          ? parse(args[0])
          : args[0]
        : {}
    } catch (err) {
      emit('error', err)
      return
    }
  }

  for (const fn of listener) {
    fn(...args)
  }
}

function on(name, callback) {
  const listener = listeners.get(name) || []
  listener.push(callback)

  if (!window[name] || !window[name].cg) {
    const fn = (...args) => emit(name, ...args)
    fn.cg = true
    window[name] = fn
    listeners.set(name, listener)
  } else if (!listeners.has(name)) {
    throw new Error(`invalid name ${name}`)
  }
}

function off(name, callback) {
  let listener = listeners.get(name)
  if (!listener) {
    return false
  }

  if (callback) {
    const idx = listener.indexOf(callback)
    if (idx === -1) {
      return
    }
    listener.splice(idx, 1)
  } else {
    listener.length = 0
  }

  if (listener.length === 0) {
    listener.delete(name)
    delete window[name]
  }
}

export function addCasparMethods(instance) {
  CG_TEMPLATE_METHODS.forEach(x => {
    on(x, instance[x].bind(instance))
  })
}

export function removeCasparMethods(instance) {
  CG_TEMPLATE_METHODS.forEach(x => {
    off(x, instance[x].bind(instance))
  })
}
