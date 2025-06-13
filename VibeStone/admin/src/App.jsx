import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Edit from './pages/Edit/Edit'
import Orders from './pages/Orders/Orders'
import UserManagement from './pages/Users/UserManagement'
import Feedback from './pages/Feedback/Feedback'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <div className='app'>
      <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/add" element={<Add />} />
          <Route path="/list" element={<List />} />
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </div>
    </div>
  )
}

export default App