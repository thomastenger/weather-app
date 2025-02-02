import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import Home from './Home'; 
import History from './History'; 




function App() {

  const [showInfo, setShowInfo] = useState(false);


  return (
    <Router>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-200">
      <nav className="bg-white shadow-md p-4 mb-4 w-full flex justify-center"> 
          <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded mr-8">Home</Link> {/* Added mr-8 */}
          <Link to="/history" className="px-4 py-2 bg-green-500 text-white rounded mr-8">History</Link> {/* Added mr-8 */}
          <Link to="https://www.linkedin.com/school/pmaccelerator/" className="px-4 py-2 bg-green-500 text-white rounded">PMAccelerator</Link>
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