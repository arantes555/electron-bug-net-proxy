const http = require('http')
const { parse } = require('url')
const proxy = require('proxy')
const basicAuthParser = require('basic-auth-parser')
const {promisify} = require('util')

class TestServer {
  constructor ({ port = 30001 } = {}) {
    this.server = http.createServer(this.router)
    this.port = port
    this.hostname = 'localhost'
    this.server.on('error', function (err) {
      console.log(err.stack)
    })
    this.server.on('connection', function (socket) {
      socket.setTimeout(1500)
    })
  }

  async start () {
    return promisify(cb => this.server.listen(this.port, '127.0.0.1', this.hostname, cb))()
  }

  async stop () {
    return promisify(cb => this.server.close(cb))()
  }

  router (req, res) {
    let p = parse(req.url).pathname

    if (p === '/hello') {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain')
      res.end('world')
    }
  }
}

class TestProxy {
  constructor ({ credentials = null, port = 30002 } = {}) {
    this.port = port
    this.hostname = 'localhost'
    this.server = proxy(http.createServer())
    if (credentials && typeof credentials.username === 'string' && typeof credentials.password === 'string') {
      this.server.authenticate = (req, fn) => {
        const auth = req.headers['proxy-authorization']
        if (!auth) {
          return fn(null, false)
        }
        const parsed = basicAuthParser(auth)
        return fn(null, parsed.username === credentials.username && parsed.password === credentials.password)
      }
    }
    this.server.on('error', function (err) {
      console.log(err.stack)
    })
    this.server.on('connection', function (socket) {
      console.log('PROXY GOT CONNEXION')
      socket.setTimeout(1500)
    })
  }

  async start () {
    return promisify(cb => this.server.listen(this.port, '127.0.0.1', cb))()
  }

  async stop () {
    return promisify(cb => this.server.close(cb))()
  }
}

module.exports = { TestServer, TestProxy }
