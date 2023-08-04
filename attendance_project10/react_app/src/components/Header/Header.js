import React, { useContext } from "react";
import { NavDropdown } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import Context from "../../context/Context";
import axios from "axios";
import "./Header.css";

function Header(Props) {
    const { pathname } = useLocation();
    const { setIsBatchDetails, batchDetails, setBatchDetails, navigate,setGoogleCredentials,getDataFromStorage } = useContext(Context);

    const handleClickOnLogo = () => {
        setIsBatchDetails(false);
        setBatchDetails({});
        navigate('/batch');
    }
    const userImage = (
        <img src={getDataFromStorage('picture')} alt="pic" className="logInProfile" />
    );

    const handleLogout = () => {
        axios.post(process.env.REACT_APP_NODE_API + "node/auth/logout",{userId:getDataFromStorage("learnerid")})
            .then((res) => { });
        localStorage.clear();
        setGoogleCredentials("")
        navigate("/");
    }

    return (
        <header className="Header">
            <div id="adminHeaderLogo">
                <svg
                    width="21"
                    height="21"
                    fill="none"
                    viewBox="0 0 36 34"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={handleClickOnLogo}
                >
                    <path
                        fill="#F55533"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M35 0H0V15.4412C0 23.1899 4.78063 30.1364 12.0191 32.905L17.5 35L22.9809 32.905C30.2194 30.1364 35 23.1899 35 15.4412V0ZM24.7059 12.3529C24.7059 16.3319 21.4797 19.5588 17.5 19.5588C13.5203 19.5588 10.2941 16.3319 10.2941 12.3529C10.2941 8.37402 13.5203 5.14706 17.5 5.14706H24.7059V12.3529ZM17.5 15.4412C19.2056 15.4412 20.5882 14.0579 20.5882 12.3529C20.5882 10.648 19.2056 9.26471 17.5 9.26471C15.7944 9.26471 14.4118 10.648 14.4118 12.3529C14.4118 14.0579 15.7944 15.4412 17.5 15.4412ZM10.2941 25.7353C10.2941 23.4613 12.1377 21.6176 14.4118 21.6176H24.7059C24.7059 23.8916 22.8623 25.7353 20.5882 25.7353H10.2941Z"
                    />
                </svg>
                {/* <span id="adminHeaderLogoName">Gradious</span> */}
                {(pathname.includes("/batch") && batchDetails?.batchName !== null && batchDetails.batchName !== undefined && batchDetails.batchName !== "") ?
                    <span id='adminHeaderBatchName'><span className="adminHeaderBatchNameSlash">/</span> {batchDetails.batchName}</span> : null}
            </div>
            <div className="Pages">
                <div className="Page">
                    <Link
                        id="dashboard"
                        to="/dashboard"
                        className={`dashboard ${pathname === "/dashboard" ? "active" : ""}`}
                    >
                        DASHBOARD
                    </Link>
                </div>

                <div className="Page">
                    <Link
                        id="live"
                        to="/batch"
                        onClick={handleClickOnLogo}
                        className={`live ${pathname.includes("/batch") ? "active" : ""}`}
                    >
                        Batches
                    </Link>
                </div>
                <div className="Page">
                    <Link
                        id="learningPaths"
                        to="/learningpath"
                        className={`learningPaths ${pathname === "/learningpath" ? "active" : ""}`}
                    >
                        LEARNING PATHS
                    </Link>
                </div>
                <div className="Page">
                    <Link
                        id="questions"
                        to="/questionlist"
                        className={`questions ${pathname === "/questionlist" ? "active" : ""
                            }`}
                    >
                        LIBRARY


                    </Link>
                </div>
            </div>
            <div className="adminNotificationSec">
                <svg width="15" height="20" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.50122 20C8.58886 20 9.47874 19.1 9.47874 18H5.5237C5.5237 19.1 6.40369 20 7.50122 20ZM13.4338 14V9C13.4338 5.93 11.8122 3.36 8.98436 2.68V2C8.98436 1.17 8.32189 0.5 7.50122 0.5C6.68055 0.5 6.01808 1.17 6.01808 2V2.68C3.18033 3.36 1.56865 5.92 1.56865 9V14L0.293145 15.29C-0.329775 15.92 0.10528 17 0.985278 17H14.0073C14.8873 17 15.3322 15.92 14.7093 15.29L13.4338 14Z" fill="#F2F4F7" />
                </svg>

            </div>
            <NavDropdown
                title={userImage}
                id="basic-nav-dropdown"
                style={{ float: "right" }}
            >
                <li>
                    <img src={getDataFromStorage('picture')} alt="pic" className="logInProfile1" />
                </li>
                <li className="logout_userNme">{getDataFromStorage('name')}</li>
                <hr style={{ margin: "0", padding: "0" }}></hr>
                <li className="logout" onClick={handleLogout}>
                    Logout
                </li>
            </NavDropdown>
        </header>
    );
}

export default Header;
