import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MenuPrincipal from "./pages/MenuPrincipal";
import SelectRoom from "./screens/SelectRoom";
import RoomCreate from "./screens/RoomCreate";
import Mazos from "./pages/Mazos";
import Ajustes from "./pages/Ajustes";
import GameTable from "./screens/GameTable";
import SalaDeMesa from "./screens/SalaDeMesa";
import GameTable25D from "./screens/GameTable25D";
import "./styles/casio.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MenuPrincipal />} />
        <Route path="/menu" element={<MenuPrincipal />} />
        <Route path="/select-room" element={<SelectRoom />} />
        <Route path="/mesas" element={<SelectRoom />} />
        <Route path="/create-room" element={<RoomCreate />} />
        <Route path="/sala" element={<SalaDeMesa />} />
        <Route path="/mazos" element={<Mazos />} />
        <Route path="/ajustes" element={<Ajustes />} />
        <Route path="/table" element={<GameTable />} />
        <Route path="/table25d" element={<GameTable25D />} />
      </Routes>
    </Router>
  );
}

export default App;
