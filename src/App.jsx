import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home'; 
import History from './History'; 




function App() {
  return (
    <Router>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-200">
        <nav className="bg-white shadow-md p-4 mb-4 w-full flex justify-center"> {/* Removed gap-4 here */}
          <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded mr-8">Home</Link> {/* Added mr-8 */}
          <Link to="/history" className="px-4 py-2 bg-green-500 text-white rounded">History</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;