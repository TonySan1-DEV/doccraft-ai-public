const WebSocket = require('ws')
const http = require('http')
const url = require('url')
const Y = require('yjs')
const { setupWSConnection } = require('y-websocket/bin/utils')

const port = 1234

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('DocCraft AI Collaboration Server')
})

const wss = new WebSocket.Server({ server })

wss.on('connection', setupWSConnection)

server.listen(port, () => {
  console.log(`🚀 DocCraft AI Collaboration Server running on ws://localhost:${port}`)
  console.log('📝 Open multiple browser tabs to test real-time collaboration!')
})

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down collaboration server...')
  server.close()
  process.exit(0)
}) 