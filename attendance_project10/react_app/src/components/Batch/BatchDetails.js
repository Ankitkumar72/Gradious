import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom';

const BatchDetails = ({ batchDetails }) => {
    const { pathname } = useLocation();
    return (
        <div className='bdBatchDetailSec'>
            <div className='bdNavBarSec'>
                <ul className='bdNavBar'>
                    <li className='bdNav'>
                        <Link id='bdNavLink' className={`bdNavLink ${pathname === '/batch/details' ? 'bdNavactive' : ''}`} to={`/batch/details`}>Details</Link>
                    </li>
                    <li className='bdNav'>
                        <Link id='bdNavLink' className={`bdNavLink ${pathname === '/batch/course' ? 'bdNavactive' : ''}`} to={`/batch/course`}>Course</Link>
                    </li>
                    <li className='bdNav'>
                        <Link id='bdNavLink' className={`bdNavLink ${pathname === '/batch/users' ? 'bdNavactive' : ''}`} to={`/batch/users`}>Users</Link>
                    </li>
                    <li className='bdNav'>
                        <Link id='bdNavLink' className={`bdNavLink ${pathname === '/batch/attendance' ? 'bdNavactive' : ''}`} to={`/batch/attendance`}>Attendance</Link>
                    </li>
                    <li className='bdNav'>
                        <Link id='bdNavLink' className={`bdNavLink ${pathname === '/batch/report' ? 'bdNavactive' : ''}`} to={`/batch/report`}>Report</Link>
                    </li>
                    
                    
                </ul>
            </div>
            <div style={pathname === '/batches/courses' ? { overflow: 'auto', height: "calc(100vh - 25vh)", paddingTop: '18px' } : { overflow: 'auto', height: "calc(100vh - 15vh)", paddingTop: '18px' }}>
                <Outlet />
            </div>

        </div>
    )
}

export default BatchDetails