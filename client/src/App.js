import './App.css';
import { Fragment } from 'react';
import NavBar from './components/layout/NavBar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Alert from './components/layout/Alert';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <NavBar />
          <Alert />
          <div className="container">
            <Routes>
              <Route exact path="/" element={<Landing />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Routes>
          </div>
        </Fragment>
      </Router>
    </Provider>
  );
}

export default App;
