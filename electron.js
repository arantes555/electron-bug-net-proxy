const electron = require('electron')
const {promisify} = require('util')

console.log(`ELECTRON IS RUNNING: ${process.versions.electron}\n`)

const doRequest = (path, {session} = {}) => new Promise((resolve) => {
  let done = false
  setTimeout(() => {
    if (done) return
    console.error(`/!\\ Request to ${path} TIMEOUT\n`)
    resolve()
  }, 2000)

  console.log(`Starting request to ${path} (session=${JSON.stringify(session)})`)
  const options = {
    url: `http://localhost:30001${path}`,
    session: session
  }

  const request = electron.net.request(options)
  request.on('error', (err) => {
    console.log(`Request to ${path} got error `, err)
    done = true
    resolve()
  })
  request.on('response', (response) => {
    response.on('data', (chunk) => {
      console.log(`Response: ${chunk}\n`)
    })
    response.on('end', () => {
      done = true
      resolve()
    })
    response.on('error', (err) => {
      console.log(`Response from ${path} got error `, err, '\n')
      done = true
      resolve()
    })
  })
  request.end()
})

electron.app.on('ready', async () => {
  // setup proxy sessions
  const unauthenticatedProxySession = electron.session.fromPartition('unauthenticated-proxy')
  const authenticatedProxySession = electron.session.fromPartition('authenticated-proxy')

  if (parseInt(process.versions.electron) < 6) {
    await promisify(cb => unauthenticatedProxySession.setProxy({ proxyRules: 'http=localhost:30002', proxyBypassRules: '' }, cb))()
    await promisify(cb => authenticatedProxySession.setProxy({ proxyRules: 'http=localhost:30003', proxyBypassRules: '' }, cb))()
  } else {
    await unauthenticatedProxySession.setProxy({ proxyRules: 'http=localhost:30002', proxyBypassRules: '' })
    await authenticatedProxySession.setProxy({ proxyRules: 'http=localhost:30003', proxyBypassRules: '' })
  }

  // do requests

  await doRequest('/hello')
  await doRequest('/hello', {session: unauthenticatedProxySession})
  await doRequest('/hello', {session: authenticatedProxySession})

  process.exit(0)
})
