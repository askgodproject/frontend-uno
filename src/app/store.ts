import { configureStore } from '@reduxjs/toolkit'

import versesReducer from '@/features/verses/versesSlice'
import { versesApi } from '@/features/verses/versesApi'

export const store = configureStore({
  reducer: {
    verses: versesReducer,
    [versesApi.reducerPath]: versesApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(versesApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
