import "./Notify.css";
import TimeSvg from "./Svg/TimeSvg";
import React, { useContext } from "react";
import Modal from "react-bootstrap/Modal";

export default function Notify(Props) {
  return (
    <div className="notifyMainContainer">
      <Modal
        centered
        backdrop="static"
        show={Props.show}
        onHide={Props.onHide}
        aria-labelledby="contained-modal-title-vcenter"
      >
        <Modal.Body>
          <div className="modalTitle">{Props.title}</div>
          {Props.svg !== "" && Props.svg !== undefined && (
            <div className="timeSvg">{Props.svg}</div>
          )}
          <div
            className={
              Props.resultCode === 2001 ? "modalMsgForTimeLapsed" : "modalMsg"
            }
          >
            {Props.message}
          </div>
          <div
            className={
              Props.resultCode === 2001
                ? "modalButtonDivForTimeLapsed"
                : "modalButtonDiv"
            }
          >
            <button onClick={Props.onHide} className="modalButton">
              {Props.btnText !== "" && Props.btnText !== undefined
                ? Props.btnText
                : "Ok"}
            </button>
          </div>
        </Modal.Body>
      </Modal>
      {/* <Modal
        centered
        backdrop="static"
        show={Props.show}
        onHide={Props.onHide}
        aria-labelledby="contained-modal-title-vcenter"
      >
        <Modal.Body>
          <div className="modalTitle">{Props.title}</div>
          <div className="modalMsg">{Props.message}</div>
          <div className="modalButtonDiv">
            <button onClick={Props.onHide} className="modalButton">
              Ok
            </button>
          </div>
        </Modal.Body>
      </Modal> */}
    </div>
  );
}
