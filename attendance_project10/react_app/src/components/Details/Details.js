import React, { useState, useContext } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FormData from "form-data";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { Editor } from '@tinymce/tinymce-react';
import { Offcanvas } from "react-bootstrap";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Context from '../../context/Context';
import './Details.css';

const Details = (Props) => {
    const { setMsg, setShow, setTitle, setIsLoaded, setIsUnAuth, batchDetails } = useContext(Context);
   
    const [isSuccess, setIsSuccess] = useState(false);
    const [updatedThumbnail, setUpdatedThumbnail] = useState('');

    const [checkExistEmail, setCheckExistEmail] = useState({ batchid: batchDetails.id, emailBody: '<p>We are glad to invite you to share the joy of learning and educating with Gradious.</p>' })
    const [userDetailByEmail, setUserDetailByEmail] = useState([]);
    const [isExistingUser, setIsExistingUser] = useState(false)
    const [savebtnHide, setSavebtnHide] = useState(false)

    const [showUserFormPopup, setShowUserFormPopup] = useState(false);
    const [newUserInput, setNewUserInput] = useState( /* Props.users === false ? */ {
        // status: "1",
        batchid: batchDetails.id,
        emailBody: '<p>We are glad to invite you to share the joy of learning and educating with Gradious.</p>'
    }/* : {} */);

   

    const hanldeAddUser = () => {
        // if( (Object.keys(newUserInput)).length==3){
        setShowUserFormPopup(true);
        setCheckExistEmail({ batchid: batchDetails.id, emailBody: newUserInput.emailBody })
        // }
    };


    const handleClosePopup = () => {
        setShowUserFormPopup(false);
        setIsExistingUser(false);
        setCheckExistEmail({ batchid: null, emailBody: '<p>We are glad to invite you to share the joy of learning and educating with Gradious.</p>' });
        setNewUserInput({ batchid: batchDetails.id, emailBody: '<p>We are glad to invite you to share the joy of learning and educating with Gradious.</p>' })
        setUserDetailByEmail([])
    };

    const handleUploadUserfile = (event, file) => {
        if (!file.size) return;
        let reader = new FileReader();
        reader.onload = async (e) => {
            console.log("length: ", e.target.result.includes("data:text/csv"));
            if (!e.target.result.includes("data:text/csv")) {
                setShow(true);
                setMsg("Wrong file type - CSV only.");
                setTitle("Warning !")
            } else {
                const form = new FormData();
                form.append('csv', file);
                form.append("from", "uploadusersinsidebatch")
                form.append("batchid", batchDetails.id)
                form.append('emailBody', '<p>We are glad to invite you to share the joy of learning and educating with Gradious.</p>')
                setIsLoaded(true);
                axios({
                    method: "post",
                    url: process.env.REACT_APP_NODE_API + "node/admin/batch/userviacsv",
                    data: form,
                    // responseType: "blob", // important
                    headers: { "Authorization": localStorage.getItem("tokenKey"), "Content-Type": "multipart/form-data" },
                })
                    .then((response) => {
                        console.log("upload user csv inside batch details  res", response.data)
                        setIsLoaded(false);
                        if (response.data.resultCode === 1000) {
                            setShow(true);
                            setMsg(response.data.msg);
                            setTitle("Success")
                            setIsSuccess(true);
                            setUpdatedThumbnail(batchDetails.thumbnail)
                        } else if (response.data.resultCode === 2050) {
                            setShow(true);
                            setMsg(response.data.msg);
                            setTitle("Warning !")
                            setIsSuccess(true);

                        } else {
                            setShow(true);
                            setMsg("Network error");
                            setTitle("Error !")
                        }
                        event.target.value = ""
                        if (response.data.hasOwnProperty("filedata")) {
                            console.log("88888888888888888888888888888888888888888888888888888888888888888888888");
                            const url = window.URL.createObjectURL(new Blob([response.data.filedata]));
                            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@2", url)
                            const link = document.createElement("a");
                            link.href = url;
                            link.setAttribute("download", `${new Date().toISOString().split('T')[0]}.csv`);
                            document.body.appendChild(link);
                            link.click();
                        }
                    })
                    .catch((error) => {
                        setIsLoaded(false);
                        console.log("user file upload", error);
                        if (error.message.includes("403")) {
                            setIsUnAuth(true);
                            setShow(true);
                            setMsg("The session token is invalidr");
                            setTitle("Error !")
                        }
                        if (error.data.hasOwnProperty("filedata")) {
                            console.log("88888888888888888888888888888888888888888888888888888888888888888888888");
                            const url = window.URL.createObjectURL(new Blob([error.data.filedata]));
                            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@2", url)
                            const link = document.createElement("a");
                            link.href = url;
                            link.setAttribute("download", `${new Date().toISOString().split('T')[0]}.csv`);
                            document.body.appendChild(link);
                            link.click();
                        }
                        event.target.value = ""
                    });
            }

        };
        reader.readAsDataURL(file);
    }

    const handleSelectRole = (e) => {
        var value = e.target.value;
        var name = e.target.name;
        setNewUserInput({ ...newUserInput, [name]: value });
    }

    const handleInputEmailChange = (e) => {
        var target = e.target;
        var name = target.name;
        var value = target.value;
        setCheckExistEmail({ ...checkExistEmail, [name]: value })
        setNewUserInput({ ...newUserInput, [name]: value });
    }

    const handleInputChange = (e, field) => {
        if (field === 'emailBody') setNewUserInput({ ...newUserInput, [field]: e });
        else {
            var target = e.target;
            var name = target.name;
            var value = target.value;
            setNewUserInput({ ...newUserInput, [name]: value });
        }
    };


    const handleCreateUser = (event) => {
        event.preventDefault();
        // event.stopPropagation();

        // if(userDetailByEmail.batchid !== undefined ) {
        //   setShowAlert(true);
        //   setAlertTitle("Info :-");
        //   setAlertMessage("This User already exists in the batch");
        //   handleClosePopup();
        // } else {
        var role = document.uservalidateForm.role.value;
        console.log("inside the craete user", role);
        var fname = document.uservalidateForm.firstname.value;
        var lname = document.uservalidateForm.lastname.value;
        // var role = document.uservalidateForm.role.value;
        var emailid = document.uservalidateForm.email.value;
        var num = document.uservalidateForm.mobile.value;
        // if (fname !== "") {
        if (role !== "") {
            if (/^[A-Za-z ]+$/.test(fname) || fname === "") {
                // document.uservalidateForm.lastname.focus();
                // if (lname !== ""){
                if (/^[A-Za-z ]+$/.test(lname) || lname === "") {
                    // document.uservalidateForm.email.focus();
                    if (emailid !== "") {
                        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailid)) {
                            // document.uservalidateForm.mobile.focus();
                            // if (num !== "") {
                            if (/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/.test(num) || num === "") {
                                console.log("Come here **********", newUserInput);
                                setIsLoaded(true);
                                axios.post((process.env.REACT_APP_NODE_API) + "node/admin/batch/user/add", JSON.stringify(newUserInput), {
                                    headers: { "Authorization": localStorage.getItem("tokenKey"), "Content-type": 'application/json' }
                                })
                                    .then((res) => {
                                        console.log("res", res);
                                        setIsLoaded(false);
                                        if (res.data.resultCode === 1000) {
                                            setShow(true);
                                            setTitle(<b> Success </b>);
                                            setMsg(res.data.data);

                                            handleClosePopup()
                                        } else if (res.data.resultCode === 2050 && res.data.msg.includes("Duplicate entry")) {
                                            setShow(true);
                                            setTitle("Warning !");
                                            setMsg("This email has already exists");
                                        } else {
                                            setIsLoaded(false);
                                            setShow(true);
                                            setTitle("Error !");
                                            setMsg("Network error");
                                        }
                                    })
                                    .catch((error) => {
                                        console.log("error", error);
                                        setIsLoaded(false);
                                        if (error.message.includes("403")) {
                                            setIsUnAuth(true);
                                            setShow(true);
                                            setTitle("Error !");
                                            setMsg("The session token is invalid");
                                        }
                                    });


                            } else {
                                // alert("You have entered an invalid mobile number!");
                                setShow(true);
                                setTitle("Info :-");
                                setMsg("You have entered an invalid mobile number!");
                            }
                            // } else {
                            //   // alert("mobile number can't be blank!");
                            //    Props.setShow(true);
                            //    Props.setTitle("Info :-");
                            //    Props.setMsg("mobile number can't be blank!");
                            // }
                        } else {
                            // alert("You have entered an invalid email !");
                            setShow(true);
                            setTitle("Info :-");
                            setMsg("You have entered an invalid email !");
                        }
                    } else {
                        // alert("email can't be blank!");
                        setShow(true);
                        setTitle("Info :-");
                        setMsg("email can't be blank!");
                    }
                } else {
                    setShow(true);
                    setTitle("Info :-");
                    setMsg("Invalid lastname given");
                }


                // } else {
                //      Props.setShow(true);
                //      Props.setTitle("Info :-");
                //    Props.setMsg("lastname can't be blank");
                // }
            } else {
                setShow(true);
                setTitle("Info :-");
                setMsg("Invalid firstname given");
            }
        } else {
            setShow(true);
            setTitle("Info :-");
            setMsg("Please select the role");
        }
        // } else {
        //      Props.setShow(true);
        //      Props.setTitle("Info :-");
        //    Props.setMsg("firstname can't be blank");
        // }
        // }
    }

    console.log("newUserInput ", newUserInput);
    console.log("userDetailByEmail ", userDetailByEmail);

   
    let MAX_SIZE = 150000;

    const handleChangeThumbnail = (event) => {

        let reader = new FileReader();
        reader.onloadend = async () => {

            let fileType = undefined;
            if (reader.result.includes("data:image/jpeg")) fileType = "image/jpeg";
            else if (reader.result.includes("data:image/png")) fileType = "image/png";
            else {
                setShow(true);
                setMsg("Supporting formats are JPEG and PNG.");
                setTitle("Warning !");
                event.target.value = ""
            }

            if (event.target.files[0].size > MAX_SIZE) {
                setShow(true);
                setMsg("Image size should be below 150kb ");
                setTitle("Warning !");
                event.target.value = ""
                fileType = undefined
            }
            if (fileType !== undefined) {
                setIsLoaded(true)
                axios.post((process.env.REACT_APP_NODE_API) + "node/admin/batch/updatethumbnail", JSON.stringify({ batchid: batchDetails.id, newimage: reader.result }), {
                    headers: { "Authorization": localStorage.getItem("tokenKey"), "Content-type": 'application/json' }
                })
                    .then(res => {
                        if (res.data.resultCode === 1000) {
                            setShow(true);
                            setIsSuccess(true);
                            setUpdatedThumbnail(reader.result)
                            setMsg("Thumbnail is changed");
                            setTitle('Success');
                        } else {
                            setShow(true);
                            setMsg("Network error");
                            setTitle('Error !');
                        }
                        setIsLoaded(false)
                        fileType = undefined
                        event.target.value = ""
                    })
                    .catch(err => {
                        setIsLoaded(false);
                        if (err.message.includes("403")) {
                            setIsUnAuth(true)
                            setShow(true);
                            setTitle("Error !");
                            setMsg("The session token is invalid");
                        }
                    })
            }
        };
        reader.readAsDataURL(event.target.files[0]);
    }

    const checkEmail = (event) => {
        event.preventDefault();
        if (Object.keys(checkExistEmail).length === 3) {
            setIsLoaded(true);
            axios.post((process.env.REACT_APP_NODE_API) + "node/admin/user/get", JSON.stringify(checkExistEmail), {
                headers: { "Authorization": localStorage.getItem("tokenKey"), "Content-type": 'application/json' }
            })
                .then((res) => {
                    console.log("res", res);
                    setIsLoaded(false);
                    if (res.data.resultCode === 1000 && res.data.data !== null) {
                        setIsExistingUser(true)
                        if (res.data.data.batchid === null) {
                            setSavebtnHide(true)
                            setUserDetailByEmail(res.data.data);
                            setShow(true);
                            setTitle(" Info :-");
                            setMsg("User belongs to some other batch. if you click on the save button user will be added to this batch.");
                        } else {
                            setSavebtnHide(false)
                            setUserDetailByEmail(res.data.data);
                            setShow(true);
                            setTitle(" Info :-");
                            setMsg("User Already exists in this batch");

                        }
                    } else if (res.data.resultCode === 1000 && res.data.msg.includes("no data")) {
                        setSavebtnHide(true)
                        setUserDetailByEmail([]);
                        setIsExistingUser(false)
                    } else {
                        setIsLoaded(false);
                        setShow(true);
                        setTitle("Warning :-");
                        setMsg("Network Error");
                    }
                })
                .catch((err) => {
                    console.log("error", err);
                    setIsLoaded(false);
                    if (err.message.includes("403")) {
                        setShow(true);
                        setMsg(err.message);
                        setTitle("Error !");
                        setIsUnAuth(true)
                    }
                });
        } else {
            setShow(true);
            setTitle("Info :-");
            setMsg("Please Enter email");
        }

    }

    return (
        <div>
            <div className='bdBatchDetails'>
                <div className='bdInBatchName'>{batchDetails.name}</div>
                <div className='bdInBatchDes'>{batchDetails.description}</div>
                <div style={{ display: 'flex' }}>
                    <p className='bdInBatchStartDateHead'>Start date :</p>
                    <p className='bdInBatchStartDate'>{(new Date(batchDetails.startdate).getDate() > 9 ? new Date(batchDetails.startdate).getDate() : `0${new Date(batchDetails.startdate).getDate()}`) + "/" +
                        ((new Date(batchDetails.startdate).getMonth() + 1) > 9 ? (new Date(batchDetails.startdate).getMonth() + 1) : `0${new Date(batchDetails.startdate).getMonth() + 1}`) +
                        "/" +
                        new Date(batchDetails.startdate).getFullYear()}</p>
                </div>
                <div className="bdUserHeadSecIn">
                    <div style={{ display: "inline-block", height: "34px", width: "45px" }} className="upload-btn-wrapper">
                        <button className="bdUserUploadIconBtn">
                            <FontAwesomeIcon id="bdUserUploadIcon" icon={faUpload} />
                        </button>
                        <input type="file" name="myfile" onChange={(event) => handleUploadUserfile(event, event.target.files[0])} style={{ width: "45px", height: "35px" }} />
                    </div>
                    <div style={{ display: "inline-block" }}>
                        <div className="addUserBtn">
                            <Button
                                variant="primary"
                                id="bdAddUserBtn"
                                onClick={hanldeAddUser}
                            >
                                Add User
                            </Button>
                        </div>
                        <Offcanvas
                            show={showUserFormPopup}
                            onHide={handleClosePopup}
                            placement="end"
                            id="addUserContainer"
                        >

                            <div className="addUserTitleSection">
                                <p className="addUserTitle">New User</p>
                                <FontAwesomeIcon
                                    className="addUserCloseIcon"
                                    icon={faXmark}
                                    onClick={handleClosePopup}
                                />
                            </div>
                            <div className="addUserHrLine"></div>
                            <Form
                                noValidate
                                className="addUserform"
                                name="uservalidateForm"
                            >
                                <div className="userDetails">


                                    <Form.Group className="mb-3">
                                        <Form.Label id="roleLabel">Role</Form.Label>
                                        <Form.Select onChange={handleSelectRole} defaultChecked={isExistingUser ? userDetailByEmail?.role : ""} name="role" id="roleOption">
                                            <option value="">Select the role</option>
                                            <option value="trainer" selected={isExistingUser ? userDetailByEmail?.role == "trainer" ? true : false : false}>Trainer</option>
                                            <option value="learner" selected={isExistingUser ? userDetailByEmail?.role == "learner" ? true : false : false}>Learner</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label id="userEmailLabel">
                                            <b> Email </b>
                                        </Form.Label>
                                        <Form.Control
                                            required
                                            type="email"
                                            name="email"
                                            id="userEmail"
                                            onBlur={checkEmail}
                                            onChange={handleInputEmailChange}
                                            placeholder="Enter email..."
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label id="userFirstNameLabel">
                                            <b> First Name </b>
                                        </Form.Label>
                                        <Form.Control
                                            required
                                            defaultValue={isExistingUser ? userDetailByEmail?.firstname : ""}
                                            type="text"
                                            name="firstname"
                                            id="userFirstname"
                                            onChange={(e) => handleInputChange(e)}
                                            placeholder="Enter firstname..."
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label id="userLastNameLabel">
                                            <b>Last Name </b>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            defaultValue={isExistingUser ? userDetailByEmail?.lastname : ""}
                                            required
                                            name="lastname"
                                            onChange={(e) => handleInputChange(e, "lastname")}
                                            id="userLastname"
                                            placeholder="Enter lastname..."
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label id="userPhoneLabel">
                                            <b> Phone </b>
                                        </Form.Label>
                                        <Form.Control
                                            required
                                            defaultValue={isExistingUser ? userDetailByEmail?.mobile : ""}
                                            type="tel"
                                            name="mobile"
                                            id="userPhone"
                                            onChange={handleInputChange}
                                            placeholder="Enter phone..."
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label id="batchDesLabel">
                                            <b>Email </b>
                                        </Form.Label>
                                        <Editor
                                            textareaName="emailBody"
                                            onEditorChange={(event) => handleInputChange(event, 'emailBody')}
                                            value={newUserInput.emailBody}
                                            apiKey='06cv5o301zflhjc6j4xzdg6jjdwj7fed5r1758qzq3p4c56d'
                                            init={{

                                                selector: 'textarea',
                                                height: 500,
                                                menubar: false,
                                                branding: false,
                                                statusbar: false,
                                                elementpath: false,
                                                allow_html_in_named_anchor: true,
                                                plugins: [
                                                    'advlist', 'lists', 'charmap', 'preview',
                                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                                ],
                                                toolbar: 'undo redo | blocks | ' +
                                                    'bold italic underline forecolor  | alignleft aligncenter ' +
                                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                                    'removeformat | help |',
                                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                            }}
                                        />
                                    </Form.Group>
                                </div>
                                <hr className="line" />
                                <Button
                                    id="saveBatchBtn"
                                    type="submit"
                                    disabled={!savebtnHide}
                                    onClick={handleCreateUser}
                                >
                                    Save
                                </Button>
                                <Button id="cancelBatchBtn" onClick={handleClosePopup}>
                                    Cancel
                                </Button>
                            </Form>

                        </Offcanvas>
                    </div>

                </div>
            </div>
            <div className='bdBatchThumbnailSec'>
                <div className='bdBatchThumbnailHead' >Thumbnail</div>
                <div className='bdBatchThumbnailDetail'>
                    <img src={isSuccess ? updatedThumbnail : batchDetails.thumbnail} className='bdBatchThumbnail' alt='Thumbnail' />
                    <div style={{ marginLeft: '63px' }}>
                        <div style={{ textAlign: 'left' }}>
                            <div className='bdInBatchDetails'>
                                <p className='bdModuleName'>Note </p>
                                <p className='bdTopicName'> : This image will be used to represent this batch across all your academy's landing pages.</p>
                            </div>
                            <div className='bdInBatchDetails'>
                                <p className='bdModuleName'>Allowed formats </p>
                                <p className='bdTopicName'>: JPEG or PNG</p>
                            </div>
                            <div className='bdInBatchDetails'>
                                <p className='bdModuleName'>Preferred minimum resolution </p>
                                <p className='bdTopicName'>: 480 * 270</p>
                            </div>
                            <div className='bdInBatchDetails'>
                                <p className='bdModuleName'>Maximum size </p>
                                <p className='bdTopicName'>: 150kb</p>
                            </div>
                        </div>
                        <div className='bdInBatchDetails'>
                            <input type="file" id='bdChangeThumbnail' accept='image/*' hidden onChange={(event) => handleChangeThumbnail(event)} />
                            <label htmlFor="bdChangeThumbnail" className='bdChangeThumbnailBtn'>Change Image</label>
                        </div>
                    </div>
                </div>
            </div>
            <div>
               {/*  <div className='bdCourseName'>Courses</div>
                {courseNameForExitLp.map((lp, index) => lp.lpid && lp.lpname && <div key={lp.lpid} className='bdCourseDetails' >
                    <input type='text' placeholder='Name' id={index + 1} name='coursename' value={lp.coursename === null ? "" : lp.coursename} onChange={(e) => handleCourseName(e, lp.lpid)} className='bdCourseNameInput' />
                    <Select
                        styles={customStylesForCourseLp}
                        options={courseLpOption}
                        value={[{ label: lp.lpname, value: lp.lpid }]}
                        name="learningpath"
                        id="courseLearningPathSelect"
                        placeholder='Select Learningpath'
                        isDisabled
                        components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
                    />
                    <div key={lp.lpid} style={{ display: 'flex' }}>
                        {isChangeOldDetails && courseDetails.lpid === lp.lpid && <><FontAwesomeIcon icon={faCheck} className="bdCheckIcon" onClick={handleAddCourseNametoDB} />

                        </>}
                    </div>
                </div>)}
                <div className='bdCourseDetails' >
                    <input type='text' placeholder='Name' name='newcoursename' value={newCourseDetails.newcoursename} id={courseNameForExitLp.length + 1} onChange={(e) => handleNewCourseDetails(e)} className='bdCourseNameInput' />
                    <Select
                        styles={customStylesForCourseLp}
                        options={learningPaths.map(lp => {
                            return { label: lp.name, value: lp.id }
                        }
                        )}
                        value={newCourseDetails.learningpath}
                        name="learningpath"
                        id={`courseLearningPathSelect ${courseNameForExitLp.length + 2}`}
                        placeholder='Select Learningpath'
                        required
                        onChange={(selectedLp) => handleNewCourseDetails(selectedLp, 'learningpath')}
                    />
                    {isChangeNewDetails && <>

                        <FontAwesomeIcon className='bdCheckIcon' icon={faCheck} onClick={handleAddNewCourseDetails} ></FontAwesomeIcon>
                    </>}
                </div> */}
            </div>
            <div></div>
        </div>
    )
}

export default Details;