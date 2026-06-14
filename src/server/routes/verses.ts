import { randomUUID } from 'node:crypto'

import { Router, type Request, type Response } from 'express'

import { type Verse } from '../../features/verses/Verse'
import { seedVerses } from '../data'

const verses: Verse[] = [...seedVerses]

const router = Router()

// GET /api/verses - list all verses
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json(verses)
})

// GET /api/verses/:id - retrieve a single verse
router.get('/:id', (req: Request, res: Response) => {
  const verse = verses.find((v) => v.id === req.params.id)
  if (!verse) {
    res.status(404).json({ message: `Verse '${req.params.id}' not found` })
    return
  }

  res.json(verse)
})

// POST /api/verses - create a verse
router.post('/', (req: Request, res: Response) => {
  const { text, reference, mark } = req.body as Partial<Verse>
  if (!text || !reference) {
    res.status(400).json({ message: 'text and reference are required' })
    return
  }

  const verse: Verse = {
    id: randomUUID(),
    text,
    reference,
    ...(mark !== undefined && { mark }),
  }
  verses.push(verse)
  res.status(201).json(verse)
})

// PUT /api/verses/:id - update a verse
router.put('/:id', (req: Request, res: Response) => {
  const index = verses.findIndex((v) => v.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ message: `Verse '${req.params.id}' not found` })
    return
  }

  const updates = req.body as Partial<Verse>
  verses[index] = { ...verses[index], ...updates, id: verses[index].id }
  res.json(verses[index])
})

// DELETE /api/verses/:id - delete a verse
router.delete('/:id', (req: Request, res: Response) => {
  const index = verses.findIndex((v) => v.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ message: `Verse '${req.params.id}' not found` })
    return
  }

  const [removed] = verses.splice(index, 1)
  res.json(removed)
})

// POST /api/verses/shuffle - shuffle the verses like a deck of cards
router.post('/shuffle', (_req: Request, res: Response) => {
  for (let i = verses.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[verses[i], verses[j]] = [verses[j], verses[i]]
  }

  res.json(verses)
})

export default router
