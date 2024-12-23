/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import axios from "axios";
import './CallHistory.css'

const CallHistory = () => {


  const [callHistory, setCallHistory] = useState([]);
  const [error, setError] = useState("");

  const fetchCallHistory = async () => {
    try {
      const token = localStorage.getItem("token"); // Replace with your token retrieval logic
      const response = await axios.get(
        "https://signwave-api-ydf3.onrender.com/api/create_call",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCallHistory(response.data); // Assuming the response contains an array of callHistory
      console.log(response.data);
    } catch (err) {
      console.error("Error fetching callHistory history:", err);
      setError(err.response?.data?.message || "Failed to fetch callHistory history");
    }
  };

  useEffect(() => {
    fetchCallHistory();
  }, []);



  const [popup, setPopup] = useState(null);

  const columns = [
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'created_at', headerName: 'Time', width: 350 },
    { field: 'meetingtime', headerName: 'Meeting Time', width: 300 },
    { field: 'message', headerName: 'Message', width: 300 },
    { field: 'receiver', headerName: 'Receiver', width: 150 },
    { field: 'updated_at', headerName: 'Updated At', width: 150 },
  ];

  return (
    <div className='tour-data-body' style={{ display: 'flex', flexDirection: 'column' }}>
      <div className='tour-data-table'>
        <DataGrid
          rows={callHistory}
          columns={columns}
          onRowClick={(e) => { setPopup(e) }}
        />
      </div>
      {
        popup != null && <div className='callHistory-pop-up'>
          <div style={{ display: 'flex', justifyContent: 'end' }}><h6 style={{ textAlign: 'end', paddingRight: '10px', backgroundColor: 'red', display: 'inline', padding: '5px', borderTopRightRadius: '10px' }} onClick={() => setPopup(null)}>X</h6></div>

          <div className='call-history-popup-box'>
            <h3>Update Call Info</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
              <input type="datetime-local" id="appointment" name="appointment" required />
              <textarea placeholder='Optional Massage' style={{ maxHeight: '100px', minHeight: '100px', maxWidth: '200px', minWidth: '200px' }} />
              <button className='update-popup'>Update</button>
            </form>
          </div>
        </div>
      }
    </div>
  )
  /*
return (
  <table border="1" className='call-history-table' style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
    <thead>
      <tr>
        <th>ID</th>
        <th>Create Time</th>
        <th>Meeting Time</th>
        <th>Message</th>
        <th>Receiver</th>
      </tr>
    </thead>
    <tbody className='scrolling-tbody'>
      {callHistory.map((row) => (
        <tr key={row.id}>
          <td>{row.id}</td>
          <td>{row.created_at}</td>
          <td>{row.meetingtime}</td>
          <td>{row.message}</td>
          <td>{row.receiver}</td>
        </tr>
      ))}
    </tbody>
  </table>
)
  */
}

export default CallHistory