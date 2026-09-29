import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import ArtworkDetail from "./pages/ArtworkDetail";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Messages from "./pages/Messages";
import ArtistRequests from "./pages/ArtistRequests";
import SellArt from "./pages/SellArt";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/artwork/:id" element={<ArtworkDetail />} />
        <Route path="/sell-art" element={<SellArt />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/artist-requests" element={<ArtistRequests />} />
        <Route path="/public-profile/:id" element={<PublicProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;