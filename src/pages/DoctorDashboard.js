import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Shield,
  Stethoscope,
} from "lucide-react";
import "./DoctorDashboard.css";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [patientId, setPatientId] = useState("");
  const [reason, setReason] = useState("");
  const [durationHours, setDurationHours] = useState(2);
  const [activeSessions, setActiveSessions] = useState([]);
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const [records, setRecords] = useState([]);
  const [grantedPatients, setGrantedPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedAccessType, setSelectedAccessType] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isDoctor = currentUser?.role === "doctor";

  useEffect(() => {
    if (!isDoctor) {
      navigate("/dashboard");
    }
  }, [isDoctor, navigate]);

  const canLoadRecords = useMemo(() => {
    return Boolean(selectedPatient);
  }, [selectedPatient]);

  const loadGrantedPatients = useCallback(async () => {
    try {
      const granteeId = currentUser?._id || currentUser?.id;
      if (!granteeId) return;

      const response = await fetch(
        `/api/access/grants/for?granteePatientId=${encodeURIComponent(granteeId)}`,
      );
      if (!response.ok) return;

      const grants = await response.json();
      setGrantedPatients(grants || []);
    } catch (fetchError) {
      console.error("Failed to fetch granted patients:", fetchError);
    }
  }, [currentUser?._id, currentUser?.id]);

  const loadEmergencySessions = useCallback(async () => {
    try {
      const doctorId = currentUser?._id || currentUser?.id;
      if (!doctorId) return;

      const [activeResponse, historyResponse] = await Promise.all([
        fetch(
          `/api/access/emergency/active?doctorId=${encodeURIComponent(doctorId)}`,
        ),
        fetch(
          `/api/access/emergency/history?doctorId=${encodeURIComponent(doctorId)}`,
        ),
      ]);

      const activeData = activeResponse.ok ? await activeResponse.json() : [];
      const historyData = historyResponse.ok
        ? await historyResponse.json()
        : [];

      setActiveSessions(activeData || []);
      setEmergencyHistory(historyData || []);
    } catch (fetchError) {
      console.error("Failed to fetch emergency sessions:", fetchError);
    }
  }, [currentUser?._id, currentUser?.id]);

  useEffect(() => {
    if (isDoctor) {
      loadGrantedPatients();
      loadEmergencySessions();
    }
  }, [isDoctor, loadGrantedPatients, loadEmergencySessions]);

  const fetchPatientRecords = async (
    targetPatientId,
    emergencySessionIdOverride = null,
  ) => {
    try {
      setLoading(true);
      setError("");

      const requesterId = currentUser?._id || currentUser?.id;
      const params = new URLSearchParams({
        requesterId,
        requesterRole: "doctor",
      });

      const effectiveSessionId =
        emergencySessionIdOverride ||
        activeSessions.find((session) => session.patientId === targetPatientId)
          ?._id ||
        null;

      if (effectiveSessionId) {
        params.append("sessionId", effectiveSessionId);
      }

      const response = await fetch(
        `/api/access/patients/${encodeURIComponent(
          targetPatientId,
        )}/records?${params.toString()}`,
      );

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to fetch records");
      }

      const payload = await response.json();
      setRecords(payload.records || []);
    } catch (fetchError) {
      setError(fetchError.message || "Unable to read patient records");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyStart = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");

      const requesterId = currentUser?._id || currentUser?.id;
      if (!requesterId || !patientId.trim() || !reason.trim()) {
        setError("Patient ID and emergency reason are required.");
        return;
      }

      const response = await fetch("/api/access/emergency/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: requesterId,
          patientId: patientId.trim(),
          reason: reason.trim(),
          durationHours: Number(durationHours) || 2,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Unable to start emergency access");
      }

      const session = await response.json();
      setActiveSessions((prev) => [session, ...prev]);
      setSelectedPatient(session.patientId);
      setSelectedSessionId(session._id);
      setSelectedAccessType("emergency");
      await fetchPatientRecords(session.patientId, session._id);
      await loadEmergencySessions();
    } catch (startError) {
      setError(startError.message || "Emergency access failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyEnd = async (sessionId) => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/access/emergency/end/${sessionId}`, {
        method: "POST",
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Unable to end emergency access");
      }

      if (
        selectedSessionId === sessionId &&
        selectedAccessType === "emergency"
      ) {
        setRecords([]);
        setSelectedPatient("");
        setSelectedSessionId("");
        setSelectedAccessType("");
      }
      await loadEmergencySessions();
    } catch (endError) {
      setError(endError.message || "Could not end emergency session");
    }
  };

  const handleSelectEmergencySession = async (session) => {
    setSelectedPatient(session.patientId);
    setSelectedSessionId(session._id);
    setSelectedAccessType("emergency");
    await fetchPatientRecords(session.patientId, session._id);
  };

  const handleSelectGrant = async (grant) => {
    setSelectedPatient(grant.patientId);
    setSelectedSessionId("");
    setSelectedAccessType("grant");
    await fetchPatientRecords(grant.patientId);
  };

  const openRecord = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className="doctor-dashboard-container">
      <div className="doctor-header">
        <div className="doctor-title">
          <Stethoscope size={22} />
          <div>
            <h1>Doctor Access Dashboard</h1>
            <p className="doctor-id-text">
              Doctor ID: {currentUser?.doctorPublicId || "Not assigned"}
            </p>
          </div>
        </div>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="doctor-alert error">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <section className="doctor-card">
        <h2>
          <Shield size={18} />
          Emergency Access (Max 2 Hours)
        </h2>
        <form className="doctor-form" onSubmit={handleEmergencyStart}>
          <input
            type="text"
            value={patientId}
            onChange={(event) => setPatientId(event.target.value)}
            placeholder="Enter patient ID"
            required
          />
          <input
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Emergency reason"
            required
          />
          <select
            value={durationHours}
            onChange={(event) => setDurationHours(event.target.value)}
          >
            <option value={1}>1 hour</option>
            <option value={2}>2 hours</option>
          </select>
          <button type="submit" disabled={loading}>
            Start Emergency Access
          </button>
        </form>

        {activeSessions.length === 0 ? (
          <p className="empty-text">No active emergency sessions.</p>
        ) : (
          <div className="history-list">
            {activeSessions.map((session) => (
              <div
                className={`history-item ${
                  selectedSessionId === session._id ? "selected" : ""
                }`}
                key={session._id}
              >
                <div>
                  <p>
                    Active emergency session for patient{" "}
                    <strong>{session.patientId}</strong>
                  </p>
                  <p>
                    <Clock size={14} /> Expires at{" "}
                    {new Date(session.expiresAt).toLocaleString()}
                  </p>
                </div>
                <div className="session-actions">
                  <button onClick={() => handleSelectEmergencySession(session)}>
                    View Records
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => handleEmergencyEnd(session._id)}
                  >
                    End Access
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="doctor-card">
        <h2>
          <Clock size={18} />
          Emergency Access History
        </h2>
        {emergencyHistory.length === 0 ? (
          <p className="empty-text">No emergency sessions yet.</p>
        ) : (
          <div className="history-list">
            {emergencyHistory.map((session) => (
              <div className="history-item" key={session._id}>
                <div>
                  <p>
                    Patient <strong>{session.patientId}</strong> | Reason:{" "}
                    {session.reason}
                  </p>
                  <p>
                    Started: {new Date(session.startedAt).toLocaleString()} |
                    Expires: {new Date(session.expiresAt).toLocaleString()}
                  </p>
                </div>
                <div className="session-actions">
                  {session.status === "active" && (
                    <button
                      onClick={() => handleSelectEmergencySession(session)}
                    >
                      View Records
                    </button>
                  )}
                  {session.status === "active" && (
                    <button
                      className="secondary-btn"
                      onClick={() => handleEmergencyEnd(session._id)}
                    >
                      End Access
                    </button>
                  )}
                  <span className={`history-status ${session.status}`}>
                    {session.status === "active" ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <Clock size={14} />
                    )}
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="doctor-card">
        <h2>
          <FileText size={18} />
          Normal Granted Access
        </h2>
        {grantedPatients.length === 0 ? (
          <p className="empty-text">
            No user has granted normal access to this doctor yet.
          </p>
        ) : (
          <div className="grants-list">
            {grantedPatients.map((grant) => (
              <button
                key={grant._id}
                className="grant-chip"
                onClick={() => handleSelectGrant(grant)}
              >
                {grant.patientId} ({grant.relationship})
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="doctor-card">
        <h2>
          Accessible Records
          {selectedPatient ? (
            <span className="selected-patient-pill">
              Patient {selectedPatient} | {selectedAccessType || "access"}
            </span>
          ) : null}
        </h2>
        {canLoadRecords && records.length === 0 && !loading ? (
          <p className="empty-text">
            No records available for this patient yet.
          </p>
        ) : null}
        {loading ? <p>Loading records...</p> : null}
        <div className="records-list">
          {records.map((record) => (
            <div key={record._id} className="doctor-record-card">
              <div>
                <h3>{record.fileName}</h3>
                <p>{record.recordType}</p>
                <p>{record.description || "No description"}</p>
              </div>
              <button onClick={() => openRecord(record.ipfsUrl)}>
                <ExternalLink size={14} /> View
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DoctorDashboard;
