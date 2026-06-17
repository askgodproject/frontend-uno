import { createBrowserRouter, Outlet } from 'react-router'
import App from '@/App'
import ErrorNotice from '@/ErrorNotice'
import Nav from '@/components/Nav'
import QuestionPage from '@/pages/QuestionPage'
import HistoryPage from '@/pages/HistoryPage'

const Layout = () => (
  <>
    <Nav />
    <Outlet />
  </>
)

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorNotice />,
    children: [
      { path: '/',        element: <QuestionPage /> },
      { path: '/verses',  element: <App /> },
      { path: '/history', element: <HistoryPage /> },
    ],
  },
  { path: '*', element: <ErrorNotice /> },
])
