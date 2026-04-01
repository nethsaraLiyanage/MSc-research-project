import { Link, Route, Routes } from "react-router-dom";
import { StudentFlow } from "./pages/StudentFlow";
import { TutorDashboard } from "./pages/TutorDashboard";

export default function App() {
  return (
    <div className="layout">
      <div className="nav-top">
        <Link to="/" className="brand">
          <img src="/logo.png" alt="" className="brand-logo" width={40} height={44} />
          <strong>Learning Strategy Lab</strong>
        </Link>
        <Link to="/tutor">Tutor / institute view</Link>
      </div>
      <Routes>
        <Route path="/" element={<StudentFlow />} />
        <Route path="/tutor" element={<TutorDashboard />} />
      </Routes>
    </div>
  );
}
