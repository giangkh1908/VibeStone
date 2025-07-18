import React, { useState } from 'react'
import Home from './pages/Home/Home'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Cart from './pages/Cart/Cart'
import LoginPopup from './components/LoginPopup/LoginPopup'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import MyOrders from './pages/MyOrders/MyOrders'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify/Verify'
import TuViPage from './pages/TuViPage/TuViPage'
import Store from './pages/Store/Store'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';

const App = () => {

  const [showLogin,setShowLogin] = useState(false);

  return (
    <>
    <ToastContainer/>
    <ScrollToTop />
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin}/>
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path="/tuvi" element={<TuViPage />} />
          <Route path='/cart' element={<Cart />}/>
          <Route path='/order' element={<PlaceOrder />}/>
          <Route path='/myorders' element={<MyOrders />}/>
          <Route path='/verify' element={<Verify />}/>
          <Route path="/store" element={<Store />} />
          <Route path='/verify-email' element={<VerifyEmail />} />
        </Routes>
      </div>
      <Footer />
    </>
  )
}

export default App
