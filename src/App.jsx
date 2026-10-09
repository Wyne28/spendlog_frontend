import {
  BrowserRouter, 
  Navigate,
  NavLink,
  Route,
  Routes,
} from "react-router-dom";

import Home from "./pages/Home";
import Expenses from "./pages/Expenses";

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <strong>SpendLog</strong>
        <NavLink to="/home">Home</NavLink> 
        <NavLink to="/expenses">Expenses</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}  
