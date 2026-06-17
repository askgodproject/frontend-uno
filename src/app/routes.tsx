import { createBrowserRouter } from 'react-router'
import App from '@/App.tsx'
import ErrorNotice from '@/ErrorNotice'

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/about", element: 
    <>
      <p>This is an About page.</p>
    </>
  },
  { path: "*", element: <ErrorNotice /> }
]);
