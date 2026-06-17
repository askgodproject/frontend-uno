import { NavLink } from 'react-router'

const Nav = () => (
  <nav style={{ marginBottom: '1rem' }}>
    <NavLink to="/">Ask</NavLink>
    {' | '}
    <NavLink to="/verses">Verses</NavLink>
    {' | '}
    <NavLink to="/history">History</NavLink>
  </nav>
)

export default Nav
