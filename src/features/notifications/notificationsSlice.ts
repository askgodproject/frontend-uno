import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface Notification {
  id: string
  message: string
  type: 'success' | 'error'
}

type NotificationsState = Notification[]

interface Notifications {
  list: NotificationsState
}

const initialState: Notifications = {
  list: []
}

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.list.push(action.payload)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((notification) => notification.id !== action.payload)
    }
  },
  selectors: {
    allNotifications: (state) => state.list
  }
})

export const { addNotification, removeNotification } = notificationsSlice.actions
export const { allNotifications } = notificationsSlice.selectors
export default notificationsSlice.reducer
