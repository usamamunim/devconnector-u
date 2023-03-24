import './App.css';
import { Fragment } from 'react';
import NavBar from './components/layout/NavBar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  return (
    <Router>
      <Fragment>
        <NavBar />
        <div className="container">
          <Routes>
            <Route exact path="/" element={<Landing />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Routes>
        </div>
      </Fragment>
    </Router>
  );
}

export default App;
