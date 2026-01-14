const express = require('express')
const { randomUUID } = require('crypto')

const app = express()
app.use(express.json())

let lastEvent = null

// ===== FILTER PATTERN =====
const ignorePatterns = [
  /^.*?/,
  /^!/,
  /^\//,
  /§/,
  /ERROR/i,
  /WARN/i,
  /Exception/i,
  /Server/i,
  /INFO/i,
  /DEBUG/i,
  /Async/i,
  /Thread/i,
  /UUID/i,
  /Loading/i,
  /Loaded/i,
]

// ===== STRIP COLOR =====
function stripColors(text = '') {
  return text.replace(/§[0-9a-fk-or]/gi, '')
}

// ===== MC → WEBHOOK =====
app.post('/webhook/mc-chat', (req, res) => {
  let { username, content, event } = req.body

  if (!username || !content) {
    return res.status(400).json({ ok: false })
  }

  content = stripColors(content)
  username = stripColors(username)

  for (const pattern of ignorePatterns) {
    if (pattern.test(content) || pattern.test(username)) {
      console.log('🚫 Filtered:', content)
      return res.json({ ok: true, filtered: true })
    }
  }

  lastEvent = {
    id: randomUUID(),
    username,
    content,
    event: event || 'PlayerChat',
    timestamp: Date.now()
  }

  console.log('📥 MC:', lastEvent)
  res.json({ ok: true })
})

// ===== WA POLLING =====
app.get('/webhook/mc-chat', (req, res) => {
  res.json(lastEvent || {})
})

app.listen(5000, () => {
  console.log('🚀 MC Webhook running on :5000')
})