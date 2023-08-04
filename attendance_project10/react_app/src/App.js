import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header/Header";
import Batch from './components/Batch/Batch';
import Details from './components/Details/Details';
import Course from "./components/Course/Course";
import Users from "./components/Users/Users";
import Attendance from "./components/Attendance/Attendance";
import Report from "./components/Report/Report";
import Learningpath from "./components/Learningpath/Learningpath";
import Library from "./components/Library/Library";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Login/Login";
import Error404 from "./Error404";
import Context from "./context/Context";
import './App.css';

function App() {
    const { getDataFromStorage } = useContext(Context)
    return (
        <div className="App">
            {(getDataFromStorage("role") === "admin" ||
                getDataFromStorage("role") === "trainer") && localStorage.tokenKey && <Header />}
            <Routes>
                <Route path="/" element={<Login />} />
                {(getDataFromStorage("role") === "admin" ||
                    getDataFromStorage("role") === "trainer") && localStorage.tokenKey && <React.Fragment>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/batch" element={<Batch />}>
                            <Route path='/batch/details' element={<Details />} />
                            <Route path='/batch/course' element={<Course />} />
                            <Route path='/batch/users' element={<Users />} />
                            <Route path='/batch/attendance' element={<Attendance />} />
                            <Route path='/batch/report' element={<Report />} />
                        </Route>
                        <Route path="/learningpath" element={<Learningpath />} />
                        <Route path="/library" element={<Library />} />
                        <Route path="/" element={<Navigate replace to="/batch" />} />
                        <Route path="*" element={<Error404 />} />
                    </React.Fragment>
                }
            </Routes>

        </div>
    );
}

export default App;
