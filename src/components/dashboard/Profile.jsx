import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import apiService from "../../services/apiService";
import Loader from "../common/Loader";
import { formatDate, truncateHash } from "../../utils/helpers";
import { USER_ROLES } from "../../utils/constants";

const Profile = () => {
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await apiService.getUserProfile(currentUser.uid);
        setProfile(response.data);
        setFormData({
          fullName: response.data.fullName || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          dateOfBirth: response.data.dateOfBirth || "",
          address: response.data.address || "",
          emergencyContact: response.data.emergencyContact || "",
        });
      } catch (err) {
        setError("Failed to load profile data. Please try again later.");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiService.updateUserProfile(currentUser.uid, formData);
      setProfile((prev) => ({
        ...prev,
        ...formData,
      }));
      setIsEditing(false);
      // Show success notification
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        {!isEditing && (
          <button className="edit-button" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="emergencyContact">Emergency Contact</label>
            <input
              type="text"
              id="emergencyContact"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button">
              Save Changes
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-details">
          <div className="profile-section">
            <div className="profile-item">
              <h3>Blockchain ID</h3>
              <p>{truncateHash(profile?.blockchainId || "")}</p>
            </div>
            <div className="profile-item">
              <h3>Role</h3>
              <p>{USER_ROLES[profile?.role] || "Patient"}</p>
            </div>
            <div className="profile-item">
              <h3>Member Since</h3>
              <p>{formatDate(profile?.createdAt || new Date())}</p>
            </div>
          </div>

          <div className="profile-section">
            <div className="profile-item">
              <h3>Full Name</h3>
              <p>{profile?.fullName || "Not provided"}</p>
            </div>
            <div className="profile-item">
              <h3>Email</h3>
              <p>{profile?.email || "Not provided"}</p>
            </div>
            <div className="profile-item">
              <h3>Phone</h3>
              <p>{profile?.phone || "Not provided"}</p>
            </div>
          </div>

          <div className="profile-section">
            <div className="profile-item">
              <h3>Date of Birth</h3>
              <p>
                {profile?.dateOfBirth
                  ? formatDate(profile.dateOfBirth)
                  : "Not provided"}
              </p>
            </div>
            <div className="profile-item">
              <h3>Address</h3>
              <p>{profile?.address || "Not provided"}</p>
            </div>
            <div className="profile-item">
              <h3>Emergency Contact</h3>
              <p>{profile?.emergencyContact || "Not provided"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
