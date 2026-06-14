import { randomUUID } from 'node:crypto'

import type { Verse } from '../features/verses/Verse'

export const seedVerses: Verse[] = [
  {
    id: randomUUID().toString(),
    reference: 'John 3:16',
    text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
  },
  {
    id: randomUUID().toString(),
    reference: 'Psalm 23:1',
    text: 'The LORD is my shepherd; I shall not want.',
  },
  {
    id: randomUUID().toString(),
    reference: 'Philippians 4:13',
    text: 'I can do all things through Christ which strengtheneth me.',
  },
  {
    id: randomUUID().toString(),
    reference: 'Proverbs 3:5',
    text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.',
  },
  {
    id: randomUUID().toString(),
    reference: 'Romans 8:28',
    text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
  },
  {
    id: randomUUID().toString(),
    reference: 'Joshua 1:9',
    text: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
  },
  {
    id: randomUUID().toString(),
    reference: 'Isaiah 41:10',
    text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.',
  },
  {
    id: randomUUID().toString(),
    reference: 'Jeremiah 29:11',
    text: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.',
  },
]
