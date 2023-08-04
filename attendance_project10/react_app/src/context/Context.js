import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwt_decode from "jwt-decode";

const Context = createContext()

export const ContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [googleCredentials, setGoogleCredentials] = useState("");
  const [title, setTitle] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");
  const [isAdmin, setIsAdmin] = useState(
    getDataFromStorage("role") === "learner" ? false : true
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUnAuth, setIsUnAuth] = useState(false);
  const [isBatchDetails, setIsBatchDetails] = useState(false);
  const [batchDetails, setBatchDetails] = useState({});

  const handleCloseAlert=()=>{
    setShow(false);
    setMsg("");
    setTitle("");
  }

  const handleUnAuthAlert = async () => {
    try {
      await axios.get(process.env.REACT_APP_NODE_API + "node/auth/logout", {
        headers: {
          "Content-type": "application/json"
        },
      });
    } catch (err) {
    } finally {
      setShow(false);
      setIsUnAuth(false);
      setIsBatchDetails(false);
      localStorage.clear();
      navigate("/");
    }
  };

  function getDataFromStorage(key) {
    //decoding the jwt access token comming from server
    if (window.localStorage.getItem("tokenKey")) {
      let result = jwt_decode(window.localStorage.getItem("tokenKey"));
      if (result.hasOwnProperty(key)) {
        // console.log("getDataFromStorage"+key+result[key])
        return result[key].toString();
      } else {
        return null;
      }
    }
  }

  return (
    <Context.Provider value={{ googleCredentials, setGoogleCredentials, msg, setMsg, title, setTitle, show, setShow, isAdmin, setIsAdmin, isUnAuth, setIsUnAuth, isLoaded, setIsLoaded, isBatchDetails, setIsBatchDetails, batchDetails, setBatchDetails, navigate, handleUnAuthAlert, getDataFromStorage ,handleCloseAlert}}>
      {children}
    </Context.Provider>
  )
}

export default Context;