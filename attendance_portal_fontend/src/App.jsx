import { Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import MainLayout from "./components/layouts/MainLayout";
import Attendance from "./pages/Attendance";
import Timetable from "./pages/Timetable";
import Dashboard from "./pages/Dashboard";
import Password from "./pages/Password";
function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route path="/attendance" element={<MainLayout><Attendance /></MainLayout>}/>
        <Route path="/timetable" element = {<MainLayout><Timetable /></MainLayout>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<Password />} />
        <Route path="/login" element={<LogIn />} />
      </Routes>
    </>
  );
}

export default App;
