import "./Batch.css";
import Select from "react-select";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { Offcanvas } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Button from "react-bootstrap/Button";
import React, { useContext, useEffect, useState } from "react";
import BatchDetails from "./BatchDetails";
import DatePicker from "react-datepicker";
import { Editor } from '@tinymce/tinymce-react';
import "react-datepicker/dist/react-datepicker.css";
import Context from "../../context/Context";
import axios from 'axios';
import { getDataFromStorage } from "../../utils";
import Notify from '../Notification-Loading/Notify/Notify'
import Loading from '../Notification-Loading/Loading/Loading';
import { nanoid } from 'nanoid';

export default function Batch() {
    const { msg, setMsg, show, setShow, title, setTitle, isLoaded, setIsLoaded, isUnAuth, setIsUnAuth, handleCloseAlert, handleUnAuthAlert, isBatchDetails, setIsBatchDetails, setBatchDetails, navigate } = useContext(Context);
    const [showPopup, setShowPopup] = useState(false)
    const [batches, setBatches] = useState([]);
    // const [status, setStatus] = useState('y');
    const [selected, setSelected] = useState([]);
    const [userInput, setUserInput] = useState({
        emailBody: `<p>We are glad to invite you to share the joy of learning and educating with Gradious.</p>`,
        status: 'y', batchimage: 'data:image/png;base64,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'
    });
    const [lpOptions, setLpOptions] = useState([]);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState({ show: false, msg: '', title: "" });
    const [showDuedate, setShowDuedate] = useState(false)

    const [startDate, setStartDate] = useState("");

    const MAX_IMAGE_SIZE = 150000;

    const handleCloseSuccessAlert = () => {
        setShowPopup(false);
        setIsSuccess({ show: false, msg: '', title: "" });
        setStartDate("")
        setUserInput({
            status: 'y',
            batchimage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAAA0CAYAAAAuT6DoAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAbcSURBVGhD7ZprbBRVFMf/d2Z2KW8oz/IUhCAPBSwEQUChIBABwQhiA6KJr0TAFx/8gsQo8YNGjYLxi6AmPNQIfvBFET8IFJD3S6A8SsuzImChLW13Zq7nzNwm2+1ud3Z3llrCLyntnk525z/3nP895xYhCdymaOr7bckdcY2V21pcVEOpmD1M/dR4yFi2Clrfe9Urlztp2Vi5I66xcmvECUGfpAOBAH0F6/8y6Brhz22lzy1ZEN2saNYCokUriMyOQHP6zjdfD3ZZKeSZ45DX/lERb0Rzy/SI0w0S0wF6/6HQR06E3m8wQAK9YBUeh7luBax9+SrijVuzFdBqaX0GIjj3FQReWgI9e4xnYX7jqzhBwnR6esGnXqYVmxA3BdONf+LIBETn7jCm5kIbcL8KNiz+iWvaHNqQkZSGY1VAQSUtK8phXyiCXXgMdvFJyNKr5By2uiB9+OS5AlqHztBHPeK6ZA3SJte7DCt/I0JffYjqT5ag+vN3Yf60GvaZAnIPU12YHvwRx+7YsSv03veogIssvwEzPw+htex+22CfL4R98jBCP65BaP0XkOcK1ZXpwRdxItiEVi7Lqbtw5IViWFs3Qt4oVRGFGYJ1ZDfM/WT3aTzl8EWc1OhtqOZqwbVGG7FddEIFIqBVlaVXqPYsFXDhpI6y9SaFPyvH/1B9hePcoE5vzy1XNHRqx3ilI3XQqsL0pxZ9EcfGEJl6glZTtO9MG3rtrqEG0bYDtKwe1EsaKuLCq1knjZPEF3Gyuhry8kXIypsq4iI6dYMxbhq0Hn3clXKCJLpNe+jDH4Y+MNuN1WBZkOfPAFdKVCA1/Fu5knOwCw6ogIugOtSHjkLgiedgjJ8B44EcGGMmw5g2D4FJsyCyeqorXXjbsM+egiy7riKpEb1xnjOiTqHHQ2Q0hU43H5z/utP914Lr8WaFm27krKJVG2f7CEeyg/K2sX4VuSytXkII1TgPUq9doq6caBbhfB6QVZWw/toLc/tmStMqFVWwcfDo06kr1Vr7usLoQdqnj8Halgd5sUhFE8Axp7DmQRE9LanYE4atn2rFzPsO9s7fIW+WqV/UjyRnlKePwtz4Laxj+533SRTBjuxVnONiyUCGYJ89jdAPX8L8lUQWn4rdQ/LD4H1wxyZKxZWw9myh1C1Xv0yQJhmUHMqwwohac/xhoXWfqVdJwI5IdcVDKs926NoLWialYzDDdcQb/8K+dBaSG2laLXmRfk6hz9S69UaT196D6H63irhEFWcd2IGqZQvUqxRgkVxr1FSjJZkIHzvQSsoK6k6u/O1OB7xpp4gx/jEEZr/oHmWEEVWcLL2Gm4tmJJ8mtxIyp+DCd6APG+v0uOFEFcd1UvXBYli7/1CBBODVatkaWs++QKu2EDWbt0d4u+BxiPc8L/BqBRe/D53TP4Lo4ihk7diMqo/eVAFv8F6nDciGMXoybdBkShnNKFjXxeqDRyLz57XO1uAFY9x0GLNegEatXiTRxTHXr6Hyredpgva2oQpyLO2+EdSN0AdxYUf0jJ6gzd7M+x6hDSshr8ZfOe6AggvehjZklHN+E0ns9qtFaxg5VHdeoNXhYTUwbS60Xv2SE0bYJedhFRx0jcYD2qDhEOSU0YQxscXRDeujJkJw7cSDXZCaY61P7fYnEbjxtn7bAPvgTme7iIdo3pLSf1LUdKwhdloyZCzm9k2oXr7UaY5jwXbP5yeBGfNVxCP00bK8DLKoABZN5daRPZBUDnGhB29MeBzGzGdTEEfI8usIrf4UJj3VmJAjilaZzilzQvBH80OrKIPNqRjZk8ZAu6sfAk+/Cq3/UHLj2CUQXxy3T9RNVK1YCvvEYRVtOETrtjByF8EYmUPuTG5cD7FrTuFM1DR0BnMXOl19Q8JbTeDRXBjZY+IKY+KKc6C041kp+MwbQJt2Knhr4e5Dn/wktNFTnCbBC3HTshY0s5mH/kTo648hLxWrYPrh/cyYModMZCZEO+ofeT70QGLimFAV7FNHUb1mudPRpxvRrpOzf+oPTnIneI/CmMTFMTy2lJxzBszQpvW+dPZ1oFrnVi44fZ7jis64lGArl5w4hs9FyMKtgkPOcGof3ad+kTq8WjzG6NSjah271DmW8Ery4mpQw6d1aBdN3984jW8yRwWMaJ/ldEVO492lpzo+8J6GkaQujuG34P2wshw2/9l3yy+w9m711CMKSjee1nVyQX3wCAh2Y+5NUxBVgz/iwuE/W3FvSMLsffkwt5LQ44dohcPq0mm0u8AYkeOsFB8TuP+LgWoqwbqqD//FhUNvzeeRfIpsscjDu4BMqqeHprqnzc1b0EUk1EdB4aRXXAOTemL/bwH+AxjfsqaihqH+AAAAAElFTkSuQmCC',
            emailBody: `<p>We are glad to invite you to share the joy of learning and educating with Gradious.</p>`
        })
    }

    const handleClosePopup = () => {
        setShowPopup(false);
        setUserInput({
            status: 'y',
            batchimage: 'data:image/png;base64,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',
            emailBody: `<p>We are glad to invite you to share the joy of learning and educating with Gradious.</p>`
        })
        setStartDate("")
    }

    const customStylesForLp = {
        control: (base, state) => ({
            ...base,
            height: '38px',
            paddingLeft: '10px'
        }),
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            return {
                ...styles,
                textAlign: 'left',
                backgroundColor: isSelected ? '#ffffff' : isFocused ? '#e9ecef' : undefined,
                color: isSelected ? '#000000' : undefined,
                // height: '23px',
                fontFamily: 'Inter',
                fontWeight: '600',
                fontSize: '12px',
                lineHeight: '15px',
                padding: '8px'
            };
        },
        placeholder: base => ({
            ...base,
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: '14px',
            lineHeight: '20px',
            color: '#BDC1C6'
        }),
        menuList: base => ({
            ...base,
            height: "150px"
        })
    }

    const handleBatchCardClick = (details) => {
        setBatchDetails(details)
        navigate('/batch/attendance');
        setIsBatchDetails(true);
    }

    const hanldeAddBatch = () => {
        setShowPopup(true);
    }


    function handleInputChange(event, field) {
        if (field === 'thumbnail') {
            let reader = new FileReader();
            reader.onloadend = () => {
                let fileType = undefined;
                if (reader.result.includes("data:image/jpeg")) fileType = "image/jpeg";
                else if (reader.result.includes("data:image/jpg")) fileType = "image/jpg";
                else if (reader.result.includes("data:image/png")) fileType = "image/png";
                else {
                    setShow(true);
                    setMsg("Wrong file type - JPEG and PNG only.");
                    setTitle("Warning !")
                    event.target.value = ""
                }
                if (reader.result.length > MAX_IMAGE_SIZE) {
                    setShow(true);
                    setMsg("File size is too large.");
                    setTitle("Warning !")
                    event.target.value = ""
                }
                if (fileType !== undefined) {
                    let batchDetails = { ...userInput }
                    batchDetails.batchimage = reader.result
                    setUserInput(batchDetails)
                }
            };
            reader.readAsDataURL(event.target.files[0]);

        } else if (field === "startDate") {
            const value = new Date(event).toLocaleDateString('fr-FR');
            let splitArr = value.split('/')
            let formatedDate = splitArr[2] + '-' + splitArr[1] + "-" + splitArr[0];
            setUserInput({ ...userInput, [field]: formatedDate });

        } else if (field === 'emailBody') setUserInput({ ...userInput, [field]: event });
        else {
            let role = getDataFromStorage("role");
            let trainerid = getDataFromStorage("learnerid");
            // if(name==="name") {
            //   document.getElementById('batchNameInBatch').onkeyup = function () {
            //       document.getElementById('nameCount').innerHTML = "Characters left: " + (100 - this.value.length);
            //   };
            // }else{
            //   document.getElementById('batchDesInBatch').onkeyup = function () {
            //       document.getElementById('count').innerHTML = "Characters left: " + (300 - this.value.length);
            //   };
            // }
            if (role === "trainer") setUserInput({ ...userInput, [event.target.name]: event.target.value, "trainerid": trainerid });
            else setUserInput({ ...userInput, [event.target.name]: event.target.value });
        }
    }

    useEffect(() => {
        let temp = { ...selected }
        temp.id = temp.value
        delete temp.label
        delete temp.value
        setUserInput({ ...userInput, learningpathid: temp.id });
    }, [selected]);



    useEffect(() => {

        var role = getDataFromStorage("role");
        var learnerid = getDataFromStorage("learnerid");
        if (!isSuccess.show) {
            setIsLoaded(true)
            axios.get(role === "trainer" ? (process.env.REACT_APP_NODE_API) + "node/learner/batch/" + learnerid : (process.env.REACT_APP_NODE_API) + "node/admin/batch/get", {
                headers: { "Authorization": localStorage.getItem("tokenKey"), "Content-type": 'application/json' }
            })
                .then(response => {
                    if (role === "trainer") {
                        if (response.data.data.length > 0 && response.data.data) {
                            setBatches(response.data.data);
                        } else {
                            setBatches([])
                            setShow(true);
                            setMsg("There is no batch");
                            setTitle("Warning !");
                        }
                        setIsLoaded(false);
                    } else {
                        if (response.data.length > 0 || response.data !== null) {
                            setBatches(response.data);
                        } else {
                            setBatches([])
                            setShow(true);
                            setMsg("There is no batch");
                            setTitle("Warning !");
                        }
                        setIsLoaded(false);
                    }
                })
                .catch((error) => {
                    if (error.message.includes("403")) {
                        setIsUnAuth(true);
                        setShow(true);
                        setMsg("The session token is invalid");
                        setTitle("Error !")
                    } else {
                        setIsLoaded(false)
                        setShow(true);
                        setMsg("Network error");
                        setTitle("Error !")
                    }
                    setIsLoaded(false)
                });


        }
    }, [isSuccess, isBatchDetails]);



    const onfileChange = (file) => {
        if (!file.size) return;
        let reader = new FileReader();
        reader.onload = (e) => {
            if (!e.target.result.includes("data:text/csv")) {
                setShow(true);
                setMsg("Wrong file type - CSV only.");
                setTitle("Warning !")
                document.getElementById('uploadUser').value = ""
            }
            else if (e.target.result.length > MAX_IMAGE_SIZE) {
                setShow(true);
                setMsg("CSV is loo large.");
                setTitle("Warning !")
                document.getElementById('uploadUser').value = ""
            }
        };
        reader.readAsDataURL(file);
    }

    function handleCreateBatch(event) {
        event.preventDefault();
        event.stopPropagation();
        let found = 0;
        if (!userInput.hasOwnProperty("name") || userInput.name === "") {
            setShow(true);
            setMsg("Please give the batch name");
            setTitle("Warning !")
            found = 1;
        } else if (!userInput.hasOwnProperty("description") || userInput.description === "") {
            setShow(true);
            setMsg("Please give the description for " + userInput.name + " batch");
            setTitle("Warning !")
            found = 1;
        } else if (!userInput.hasOwnProperty("startDate") || userInput.startDate === "") {
            setShow(true);
            setMsg("Please give the start date for " + userInput.name + " batch");
            setTitle("Warning !")
            found = 1;
        }
        if (found === 0) {
            setIsModalLoading(true)
            console.log(userInput)
            let csvfile = document.getElementById('uploadUser');
            console.log(csvfile.files[0])
            const form = new FormData();
            form.append('csv', csvfile.files[0]);
            form.append("batchdata", JSON.stringify(userInput));
            form.append("from", 'addnewbatch')
            axios({
                method: "post",
                url: process.env.REACT_APP_NODE_API + "node/admin/batch/userviacsv",
                data: form,
                // responseType: "blob", // important
                headers: { "Authorization": localStorage.getItem("tokenKey"), "Content-Type": "multipart/form-data" },
            })
                .then((response) => {
                    if (response.data.resultCode === 1000) {
                        setIsSuccess({ show: true, msg: "Batch is created successfully", title: "Success" });
                    } else if (response.data.resultCode === 2050 && response.data.msg.includes("Duplicate entry")) {
                        setShow(true);
                        setMsg("This batch name  already exist please give a different name");
                        setTitle("Warning !")

                    } else if (response.data.resultCode === 2050) {
                        setShow(true);
                        setMsg(response.data.msg);
                        setTitle("Warning !")

                    } else {
                        setShow(true);
                        setMsg("Network error");
                        setTitle("Error !")
                    }
                    setIsModalLoading(false);
                    if (response.data.hasOwnProperty("filedata")) {
                        const url = window.URL.createObjectURL(new Blob([response.data.filedata]));
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute("download", `${Date.now()}.csv`);
                        document.body.appendChild(link);
                        link.click();
                    }
                })
                .catch((err) => {
                    setIsModalLoading(false)
                    if (err.message.includes("403")) {
                        setShow(true);
                        setMsg("The session token is invalid");
                        setTitle("Error !")
                        setIsUnAuth(true)
                    }
                    if (err.resultCode == 2050) {
                        setIsUnAuth(true)
                        setShow(true);
                        setMsg(err.msg);
                        setTitle("Error !")
                    }
                    if (err.data.hasOwnProperty("filedata")) {
                        const url = window.URL.createObjectURL(new Blob([err.data.filedata]));
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute("download", `${Date.now()}.csv`);
                        document.body.appendChild(link);
                        link.click();
                    }
                }).finally(()=>{
                    setIsModalLoading(false)
                });
        }
    }


    const handleBatchDetails = (batchid, batchdate) => {
        setShowDuedate(true)
        setIsLoaded(true)
        axios.get((process.env.REACT_APP_NODE_API) + "node/admin/batch/" + batchid, {
            headers: { "Authorization": localStorage.getItem("tokenKey"), "Content-type": 'application/json' }
        })
            .then((res) => {
                if (res.data.resultCode === 1000) {
                    let batchDetail = res.data.data[0];
                    setIsBatchDetails(true);
                    navigate('/batch/attendance')
                    setBatchDetails(batchDetail)
                    setIsLoaded(false);
                } else {
                    setIsLoaded(false);
                    setShow(true);
                    setMsg("Network error");
                    setTitle("Error !")
                }
            }).catch(err => {
                setIsLoaded(false);
                if (err.message.includes("403")) {
                    setShow(true);
                    setMsg("The session token is invalid");
                    setTitle("Error !")
                    setIsUnAuth(true);
                }
            })
    }



    return (
        <main>
            {!isBatchDetails ?
                (<div className="adminBatchContainer">
                    <div>
                        <div className="addBatchBtn">
                            <Button
                                variant="primary"
                                id="addBatch"
                                onClick={hanldeAddBatch}
                            >
                                Add New Batch
                            </Button>
                        </div>
                        <Offcanvas show={showPopup} onHide={() => setShowPopup(false)} placement="end" id="addBatchContainer" >
                            <div className='addBatchTitleSection'>
                                <p className='addBatchTitle'>New Batch</p>
                                <FontAwesomeIcon className='addBatchCloseIcon' icon={faXmark} onClick={() => setShowPopup(false)} />
                            </div>
                            <div className='addBatchHrLine'></div>
                            <Form
                                noValidate
                                className="form"
                                validated={false}
                            >
                                <div id="adminbatchDetailsForm">
                                    <Form.Group className="mb-3 pt-3">
                                        <Form.Label id="batchNameLabel">
                                            <b> Name </b>
                                        </Form.Label>
                                        <Form.Control
                                            required
                                            type="text"
                                            maxLength="100"
                                            name="name"
                                            id="batchNameInBatch"
                                            onChange={handleInputChange}
                                            placeholder="Enter batch name"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label id="batchDesLabel">
                                            <b>Description </b>
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            required
                                            name="description"
                                            maxLength={200}
                                            style={{ resize: 'none' }}
                                            onChange={handleInputChange}
                                            id="batchDesInBatch"
                                            placeholder="Type description here"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label id="batchStartDateLabel">
                                            <b>Start Date</b>
                                        </Form.Label>
                                        <DatePicker
                                            dateFormat="dd/mm/yyyy"
                                            name="startDate"
                                            /* selected={startDate} */
                                            minDate={new Date()}
                                            autoComplete="off"
                                            placeholderText="Pick the date"
                                            className="batchStartDate"
                                            value={startDate}
                                            onChange={(date) => {
                                                const d = new Date(date).toLocaleDateString('fr-FR');
                                                setStartDate(d);
                                                handleInputChange(date, "startDate");
                                            }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label id="batchUploadThumbnailLabel">
                                            <b>Upload Thumbnail</b><p id="batchUploadThumbnailDetail">(max size:150kb & supported format (jpeg & png))</p>
                                        </Form.Label>
                                        <Form.Control
                                            required
                                            type="file"
                                            name="thumbnail"
                                            id="batchUploadThumbnail"
                                            accept='image/*'
                                            onChange={(event) => { handleInputChange(event, 'thumbnail')/* ; onfileChange(event.target.files[0]) */ }}
                                        />
                                    </Form.Group>
                                    
                                        <Form.Group className="mb-3">
                                            <Form.Label id="addUserNameLabel">
                                                <b>Add users</b>
                                            </Form.Label>
                                            <Form.Control
                                                required
                                                type="file"
                                                name="user"
                                                id="uploadUser"
                                                onChange={(event) => { handleInputChange(event); onfileChange(event.target.files[0]) }}
                                            />
                                        </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label id="batchDesLabel">
                                            <b>Email </b>
                                        </Form.Label>
                                        <Editor
                                            id="batchEmailBody"
                                            textareaName="emailBody"
                                            onEditorChange={(event) => handleInputChange(event, 'emailBody')}
                                            value={userInput.emailBody}
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
                                                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount','autoresize'
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
                                <div className="adminAddBatchDetailsBtn">
                                    <Button
                                        id="saveBatchBtn"
                                        type="submit"
                                        onClick={handleCreateBatch}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        id="cancelBatchBtn"
                                        onClick={handleClosePopup}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                                {isModalLoading&&<Loading/>}
                            </Form>
                        </Offcanvas>
                    </div>
                    <br /> <br />
                    <div className="adminBatchCard-container" >
                        {batches.map(batch => (
                            <Card id="adminBatchCard" key={batch.id} onClick={() => handleBatchDetails(batch.id, batch.startdate)}>
                                <Card.Img variant="top" src={batch.thumbnail} id="adminBatchImg" />
                                <Card.Body className="adminBatchCardBody">
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div className="adminBatchName">{batch.name}</div>
                                        <div className="adminBatchStartDate">Start Date : {(new Date(batch.startdate).getDate() > 9 ? new Date(batch.startdate).getDate() : `0${new Date(batch.startdate).getDate()}`) + "/" +
                                            ((new Date(batch.startdate).getMonth() + 1) > 9 ? (new Date(batch.startdate).getMonth() + 1) : `0${new Date(batch.startdate).getMonth() + 1}`) +
                                            "/" +
                                            new Date(batch.startdate).getFullYear()}</div>
                                    </div>
                                    <Card.Text id="adminBatchDes">
                                        {batch.description}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                </div>)
                : (<BatchDetails setIsBatchDetails={setIsBatchDetails} />)
            }

            <Notify
                title={isSuccess.title}
                show={isSuccess.show}
                message={isSuccess.msg}
                onHide={handleCloseSuccessAlert}
            />
            <Notify
                title={title}
                show={show}
                message={msg}
                onHide={isUnAuth ? handleUnAuthAlert : handleCloseAlert}
            />
            {isLoaded && <Loading />}
        </main>
    );
}