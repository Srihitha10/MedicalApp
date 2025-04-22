import { useState, useEffect } from "react";
import { retrieveFromIPFS } from "../../services/ipfsService";

const ViewRecords = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const storedRecords = JSON.parse(
      localStorage.getItem("medicalRecords") || "[]"
    );
    setRecords(storedRecords);
  }, []);

  const handleView = async (hash) => {
    try {
      const data = await retrieveFromIPFS(hash);
      const url = URL.createObjectURL(data);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error viewing file:", error);
    }
  };

  return (
    <div>
      <h2>Medical Records</h2>
      {records.map((record) => (
        <div key={record.id}>
          <p>Name: {record.name}</p>
          <p>Hash: {record.hash}</p>
          <button onClick={() => handleView(record.hash)}>View Document</button>
        </div>
      ))}
    </div>
  );
};
