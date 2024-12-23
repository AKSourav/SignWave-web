import React, { useState } from 'react'
import { useSocket } from '../Context/SocketProvider'
import CallDashboard from '../components/VC/CallDashboard'

const Call = () => {
    const [userName, setUserName] = useState();
    const [receiverUserName, setReceiverUserName] = useState();
    const {setUserName:setUSERNAME, callUser} = useSocket();
  return (
    <div>
        <div className='flex justify-center y-6'>
            <input type='text' placeholder='Enter Your name' value={userName} onChange={(e)=>setUserName(e.target.value)}/>
            <button onClick={()=>setUSERNAME(userName)}>Submit</button>
        </div>
        <div className='flex justify-center y-6'>
            <input type='text' placeholder='Enter Senders username' value={receiverUserName} onChange={(e)=>setReceiverUserName(e.target.value)}/>
            <button onClick={()=>callUser(receiverUserName)}>Submit</button>
        </div>
        <CallDashboard/>
    </div>
  )
}

export default Call