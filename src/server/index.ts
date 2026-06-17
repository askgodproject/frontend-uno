import express from 'express'
import cors from 'cors'

import versesRouter from './routes/verses'
import askRouter from './routes/ask'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/verses', versesRouter)
app.use('/api/ask', askRouter)

const port = Number(process.env.PORT ?? 4000)

app.listen(port, () => {
  console.log(`Mock API server listening on http://localhost:${port}`)
})
