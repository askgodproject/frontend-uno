import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { Slice } from "@/app/constants"
import type { RootState } from '@/app/store'

import { type Verse } from './Verse'

interface VersesState {
  list: Verse[],
  selected: boolean[], // mirrors `list` but only contains boolean if that verse is selected or not
  status: 'idle' | 'pending' | 'success' | 'failure'
}

const initialState: VersesState = {
  list: [],
  selected: [],
  status: 'idle'
}

export const analyzeVerses = createAsyncThunk<void, Verse[] | null, { state: RootState }>(
  'verses/analyzeVerses',
  async (verses, thunkAPI) => {
    let selectedVerses = verses

    if (!selectedVerses || selectedVerses.length === 0) {
      const { list, selected } = thunkAPI.getState().verses
      selectedVerses = list.filter((_verse, index) => selected[index])
    }

    // TODO: do something with selectedVerses, call Claude API
  }
)

export const versesSlice = createSlice({
  name: Slice.VERSES,
  initialState,
  reducers: {
    setVerses: (state: VersesState, action: PayloadAction<Verse[] | undefined>) => {
      let newVerses = action.payload
      if (newVerses) {
        state.list = newVerses
        state.selected = newVerses.map((_) => false)
      }
    },
    clear: (state: VersesState) => {
      for (let i = 0; i < state.selected.length; i++)
        state.selected[i] = false
    },
    selectToggle: (state: VersesState, action: PayloadAction<number>) => {
      let index: number = action.payload
      state.selected[index] = !(state.selected[index])
    }
  },
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(getVerses.pending, (state: VersesState) => {
  //       state.status = 'pending'
  //     })
  //     .addCase(getVerses.fulfilled, (state: VersesState, action: PayloadAction<unknown>) => {
  //       state.status = 'success'
  //       state.list = action.payload as Verse[]
  //     })
  //     .addCase(getVerses.rejected, (state: VersesState) => {
  //       state.status = 'failure'
  //     })
  // },
  selectors: {
    getSelectedCount: (state: VersesState) => state.selected.filter((flag) => flag).length,
    selectedList: (state: VersesState) => state.selected
  }
})

export const { setVerses, clear: clearVerses, selectToggle } = versesSlice.actions
export const { getSelectedCount: numSelected, selectedList } = versesSlice.selectors
export const isSelected = (index: number) => (state: VersesState) => state.selected[index]
export default versesSlice.reducer
