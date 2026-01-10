import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Footer from './components/Footer';
import Auth from './components/Auth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddMedicine from './components/AddMedicine'
import Speak from './components/Speak'
import ScrollToTop from './components/ScrollToTop';
import MyMed from './components/MyMed'
import Profile from './components/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import Notification from './components/Notification'

import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";


export default function App() {
  return (
   
    <Router>
      <Navbar />
     
      <ScrollToTop />
    
      <Routes>
        {/* Home route */}
        <Route path="/" element={<Home />} />
        {/* Auth route */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/Speak" element={<Speak />} />
        <Route path="/AddMedicine" 
          element={
             <ProtectedRoute>
          <AddMedicine />
               </ProtectedRoute>
               }
          />
        <Route path="/MyMed" element={ <ProtectedRoute>
          <MyMed />
        </ProtectedRoute>
        }
        />
        <Route path="/Profile" element={ <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
        }
        />

        <Route path="/Notification" element={ <ProtectedRoute>
          <Notification />
        </ProtectedRoute>
        }
        />
        
      </Routes> 
       <ToastContainer position="top-right" autoClose={3000} />
      <Footer />
    </Router>
  );
}
