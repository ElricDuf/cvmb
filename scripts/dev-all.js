const { spawn } = require('child_process')
const net = require('net')

const isWindows = process.platform === 'win32'
const npmCommand = 'npm'

function startProcess(label, command, args, options = {}) {
  const child = isWindows
    ? spawn('cmd.exe', ['/d', '/s', '/c', [command, ...args].join(' ')], {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: false,
        ...options,
      })
    : spawn(command, args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: false,
        ...options,
      })

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${label}] ${chunk}`)
  })

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${label}] ${chunk}`)
  })

  return child
}

function stopProcess(child) {
  if (!child || child.killed) {
    return
  }

  if (isWindows) {
    spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
      stdio: 'ignore',
      shell: true,
    })
    return
  }

  child.kill('SIGTERM')
}

let frontendProcess = null
let backendProcess = null
let frontendStarted = false
let shuttingDown = false

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return
  }

  shuttingDown = true
  stopProcess(frontendProcess)
  stopProcess(backendProcess)
  process.exit(exitCode)
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: '127.0.0.1' })

    socket.once('connect', () => {
      socket.end()
      resolve(true)
    })

    socket.once('error', () => {
      resolve(false)
    })
  })
}

function startFrontend() {
  if (frontendStarted) {
    return
  }

  frontendStarted = true
  frontendProcess = startProcess('frontend', npmCommand, ['--prefix', 'frontend', 'run', 'dev'])

  frontendProcess.on('exit', (code) => {
    shutdown(code ?? 0)
  })
}

const prepareDbProcess = startProcess('backend-prepare', npmCommand, ['--prefix', 'backend', 'run', 'prepare-db'])

prepareDbProcess.on('exit', async (code) => {
  if ((code ?? 0) !== 0) {
    shutdown(code ?? 1)
    return
  }

  const backendAlreadyRunning = await isPortOpen(4000)

  if (backendAlreadyRunning) {
    console.log('Backend already running on http://localhost:4000, reusing it.')
    startFrontend()
    return
  }

  backendProcess = startProcess('backend', npmCommand, ['--prefix', 'backend', 'run', 'dev'])

  backendProcess.stdout.on('data', (chunk) => {
    const output = chunk.toString()
    if (output.includes('Backend listening on')) {
      startFrontend()
    }
  })

  backendProcess.stderr.on('data', (chunk) => {
    const output = chunk.toString()
    if (output.includes('Backend listening on')) {
      startFrontend()
    }
  })

  backendProcess.on('exit', (backendExitCode) => {
    shutdown(backendExitCode ?? 0)
  })
})

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

console.log('Starting backend, then frontend once the API is ready...')