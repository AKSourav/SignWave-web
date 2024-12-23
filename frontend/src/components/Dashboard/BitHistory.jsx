import React, { useEffect, useState } from "react";
import axios from "axios";

const BitHistory = () => {
  const [points, setPoints] = useState([]);
  const [error, setError] = useState("");

  const fetchBitHistory = async () => {
    try {
      const token = localStorage.getItem("token"); // Replace with your token retrieval logic
      const response = await axios.get(
        "https://signwave-api-ydf3.onrender.com/api/get_point",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPoints(response.data); // Assuming the response contains an array of points
    } catch (err) {
      console.error("Error fetching points history:", err);
      setError(err.response?.data?.message || "Failed to fetch points history");
    }
  };

  useEffect(() => {
    fetchBitHistory();
  }, []);

  return (
    <div>
      <h2>Bit History</h2>
      {error && <p className="error">{error}</p>}
      {points.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Receiver</th>
              <th>Details</th>
              <th>Type Subscription</th>
              <th>Left Call</th>
              <th>Date</th>
              <th>Last Subscription Amount</th>
            </tr>
          </thead>
          <tbody>
            {points.map((points) => (
              <tr key={points.receiver}>
                <td>{points.receiver}</td>
                <td>{points.details}</td>
                <td>{points.type_subscription}</td>
                <td>{points.left_call}</td>
                <td>{points.date}</td>
                <td>{points.last_subscription_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No points history found.</p>
      )}
    </div>
  );
};

export default BitHistory;
