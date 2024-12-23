import React, { useEffect, useState } from "react";
import axios from "axios";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem("token"); // Replace with your token retrieval logic
      console.log(token)

      if (!token) {
        console.error("No token found. Redirecting to login...");
        navigate("/signin");
        return;
      }
      const response = await axios.get(
        "https://signwave-api-ydf3.onrender.com/api/payment",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(11323)
      setPayments(response.data); // Assuming the response contains an array of payments
    } catch (err) {
      console.error("Error fetching payment history:", err);
      setError(err.response?.data?.message || "Failed to fetch payment history");
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  return (
    <div>
      <h2>Payment History</h2>
      {error && <p className="error">{error}</p>}
      {payments.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Payment Id</th>
              <th>Transaction Amount</th>
              <th>Transaction Date</th>
              <th>Satus Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.payment_id}</td>
                <td>{payment.transaction_amount}</td>
                <td>{payment.transaction_date}</td>
                <td>{payment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No payment history found.</p>
      )}
    </div>
  );
};

export default PaymentHistory;
