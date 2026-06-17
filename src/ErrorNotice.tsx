import { useRouteError } from 'react-router'

const ErrorNotice = () => {
  const errorData = useRouteError()

  return (
    <div>
      <p>Oops!</p>
      { errorData ? (<p>{ JSON.stringify(errorData) }</p>) : (<p>It appears that this page doesn't exist</p>) }
    </div>
  )
}

export default ErrorNotice;
