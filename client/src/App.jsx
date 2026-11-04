import { useSelector } from 'react-redux'

function App() {
  const user = useSelector((state) => state.auth.user)

  return (
    <div className="container py-4">
      <h1 className="text-primary">CampusTalk</h1>
      <p>{user ? `Logged in as ${user.name}` : 'Not logged in'}</p>
    </div>
  )
}

export default App