const childProcess = require('child_process')
const { TestProxy, TestServer } = require('./server.js')

const electron4 = require('electron4')
const electron5 = require('electron5')
const electron6 = require('electron6')
const electron7 = require('electron7')

const local = new TestServer()
const unauthenticatedProxy = new TestProxy({
  port: 30002
})
const authenticatedProxy = new TestProxy({
  credentials: { username: 'testuser', password: 'testpassword' },
  port: 30003
})

const test = (electronBinary, name) => {
  console.log(`Starting ${name}`)
  const cp = childProcess.spawn(electronBinary, ['./electron.js'])
  cp.stdout.on('data', (data) => console.log(`STDOUT ${name}:`, data.toString().replace(/\n$/, '')))
  cp.stderr.on('data', (data) => console.log(`STDERR ${name}:`, data.toString().replace(/\n$/, '')))
  return new Promise(resolve => cp.once('exit', resolve))
}

const main = async () => {
  await local.start()
  await unauthenticatedProxy.start()
  await authenticatedProxy.start()

  await test(electron4, 'electron4')
  await test(electron5, 'electron5')
  await test(electron6, 'electron6')
  await test(electron7, 'electron7')

  await local.stop()
  await unauthenticatedProxy.stop()
  await authenticatedProxy.stop()
}

main()
