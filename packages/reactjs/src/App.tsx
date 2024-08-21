import Challenge from "./pages/Challenge/Challenge";
import Home from "./pages/Home/Home";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/challenge" element={<Challenge />} />
    </Routes>
  );
}

export default App;
