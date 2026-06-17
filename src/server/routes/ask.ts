import { Router, type Request, type Response } from 'express'

import { seedVerses } from '../data'
import type { Verse } from '../../features/verses/Verse'

const keywordMap: Record<string, string[]> = {
  fear:     ['Isaiah 41:10', 'Joshua 1:9'],
  afraid:   ['Isaiah 41:10', 'Joshua 1:9'],
  courage:  ['Joshua 1:9'],
  strong:   ['Joshua 1:9', 'Philippians 4:13'],
  strength: ['Philippians 4:13', 'Joshua 1:9'],
  love:     ['John 3:16'],
  trust:    ['Proverbs 3:5'],
  peace:    ['Jeremiah 29:11', 'Romans 8:28'],
  purpose:  ['Romans 8:28', 'Jeremiah 29:11'],
  future:   ['Jeremiah 29:11'],
  plan:     ['Jeremiah 29:11'],
  shepherd: ['Psalm 23:1'],
  good:     ['Romans 8:28'],
}

const router = Router()

// POST /api/ask - return verses relevant to a question
router.post('/', (req: Request, res: Response) => {
  const { question } = req.body as { question?: string }
  if (!question) {
    res.status(400).json({ message: 'question is required' })
    return
  }

  const words = question.toLowerCase().split(/\W+/)
  const matchedRefs = new Set<string>()
  for (const word of words) {
    keywordMap[word]?.forEach((ref) => matchedRefs.add(ref))
  }

  let results: Verse[]
  if (matchedRefs.size > 0) {
    results = seedVerses.filter((v) => matchedRefs.has(v.reference))
  } else {
    results = [...seedVerses].sort(() => Math.random() - 0.5).slice(0, 3)
  }

  setTimeout(() => res.json(results), 500)
})

export default router
