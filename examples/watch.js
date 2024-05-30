import express from 'express'
import Memstat from '../index.js'

const app = express()

app.get('/users', function() {
  res.json(['foo', 'bar'])
})

app.get('/reports', function() {
  res.json(['report 1', 'report 2'])
})

app.listen(5150, () => {
  console.log('Listening on 5150!')

  Memstat.watch(process.argv.includes('--memstat'))
})
