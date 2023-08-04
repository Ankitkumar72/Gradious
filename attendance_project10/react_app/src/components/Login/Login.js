import React, { useContext, useEffect} from "react";
import axios from "axios";
import "./Login.css";
import jwt_decode from "jwt-decode";
import { useLocation } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import Context from "../../context/Context";
import Notify from "../Notification-Loading/Notify/Notify";
import Loading from "../Notification-Loading/Loading/Loading";

const Login = () => {
    const { msg, setMsg, title, setTitle, show, setShow, isLoaded, setIsLoaded,navigate,googleCredentials, setGoogleCredentials,handleCloseAlert,getDataFromStorage } = useContext(Context);

    const { pathname } = useLocation();

    useEffect(() => {
        if (!localStorage.tokenKey&&googleCredentials !== "" && googleCredentials.hasOwnProperty('credential')) {
            (async () => {
                setIsLoaded(true);
                try {
                    let authResponse = await axios.post(process.env.REACT_APP_NODE_API + 'node/auth/validate', JSON.stringify({ credentials: googleCredentials.credential }),
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                    if (authResponse.data.hasOwnProperty('accessToken')) {
                        localStorage.setItem('tokenKey', authResponse.data.accessToken);
                        const result = jwt_decode(authResponse.data.accessToken);
                        if (result.role === "learner") {
                                navigate("/home");
                        }
                        else if (result.role === "admin" || result.role === "trainer") {
                            navigate("/batch");
                        }else {
                            navigate("/");
                            localStorage.clear();
                        }
                    }else {
                        setShow(true);
                        setTitle("Error")
                        setMsg("Email does not exist");
                    }

                } catch (error) {
                    setShow(true);
                    setTitle("Error")
                    setMsg("Something went wrong. Please try again later");
                } finally {
                    setIsLoaded(false);
                }
            }
            )()
        }else if (localStorage.tokenKey) {
            let role = getDataFromStorage("role");
            if (role === "learner") {
              navigate('/home');
            } else if (role === "admin" || role === "trainer") {
              navigate('/batch');
            }
          } else return undefined
    }, [googleCredentials,navigate,pathname])


    return (
        <div>
            <div className="loginpg"></div>
            <form className="loginForm">
                <div className="image">
                    <img
                        className="logo1"
                        src="https://gradious.com/wp-content/uploads/2021/09/Final-Logo-2.svg"
                        alt="Gradious"
                        style={{ width: "200px" }}
                    />
                </div>
                <div className="tabs">Sign In</div>
                <div className="signInForm">
                    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID} >
                        <GoogleLogin
                            onSuccess={credentialResponse => {
                                setGoogleCredentials(credentialResponse)
                            }}
                            onError={() => {
                                console.log('Login Failed');
                            }}
                        />
                    </GoogleOAuthProvider>
                </div>
            </form>
            <Notify
                show={show}
                title={title}
                message={msg}
                onHide={handleCloseAlert}
            />
            {isLoaded && <Loading />}
        </div>
    );
};

export default Login;