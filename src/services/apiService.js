// Utility function to simulate API delay
const simulateApiDelay = () =>
  new Promise((resolve) => setTimeout(resolve, 500));

const API_BASE_URL = "http://localhost:5000/api"; // Your backend URL

export const saveRecord = async (recordData) => {
  try {
    console.log("Sending record data:", recordData); // Debug log
    const response = await fetch(`${API_BASE_URL}/records`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recordData),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Server response:", data); // Debug log
    return data;
  } catch (error) {
    console.error("Error saving record:", error);
    throw error;
  }
};

// Auth Service Methods
const auth = {
  // Login user
  async login(credentials) {
    try {
      await simulateApiDelay();
      return {
        data: { token: "mock-jwt-token", user: { id: 1, name: "Test User" } },
      };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      await simulateApiDelay();
      return { data: { success: true } };
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  },
};

// Continuing from where the code left off...

const notifications = {
  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await simulateApiDelay();

      // In a real app, this would mark the notification as read via API
      // return apiClient.put(`/notifications/${notificationId}/read`);

      return { data: { success: true } };
    } catch (error) {
      console.error("Mark notification as read failed:", error);
      throw error;
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      await simulateApiDelay();

      // In a real app, this would mark all notifications as read via API
      // return apiClient.put('/notifications/read-all');

      return { data: { success: true } };
    } catch (error) {
      console.error("Mark all notifications as read failed:", error);
      throw error;
    }
  },
};

// Medical Records Service Methods
const medicalRecords = {
  // Get user's medical records
  async getRecords() {
    try {
      await simulateApiDelay();

      // In a real app, this would fetch records from the API
      // return apiClient.get('/records');

      // Generate mock records data
      const records = [];
      const categories = [
        "Lab Results",
        "Imaging",
        "Prescription",
        "Diagnosis",
        "Vaccination",
      ];
      const now = new Date();

      for (let i = 0; i < 15; i++) {
        const category =
          categories[Math.floor(Math.random() * categories.length)];
        const date = new Date(now - Math.random() * 365 * 24 * 60 * 60 * 1000);

        let title, description, fileType;
        switch (category) {
          case "Lab Results":
            title = `${
              [
                "Complete Blood Count",
                "Lipid Panel",
                "Metabolic Panel",
                "Thyroid Function Test",
              ][Math.floor(Math.random() * 4)]
            }`;
            description = `Routine ${title.toLowerCase()} laboratory analysis`;
            fileType = "pdf";
            break;
          case "Imaging":
            title = `${
              ["Chest X-Ray", "Abdominal CT Scan", "Brain MRI", "Ultrasound"][
                Math.floor(Math.random() * 4)
              ]
            }`;
            description = `${title} diagnostic imaging results`;
            fileType = Math.random() > 0.5 ? "dicom" : "jpg";
            break;
          case "Prescription":
            title = `${
              ["Antibiotics", "Antihypertensive", "Pain Management", "Allergy"][
                Math.floor(Math.random() * 4)
              ]
            } Prescription`;
            description = `Medication prescription and dosage instructions`;
            fileType = "pdf";
            break;
          case "Diagnosis":
            title = `${
              [
                "Annual Check-up",
                "Specialist Consultation",
                "Emergency Visit",
                "Follow-up",
              ][Math.floor(Math.random() * 4)]
            } Report`;
            description = `Medical diagnosis and treatment recommendations`;
            fileType = "pdf";
            break;
          case "Vaccination":
            title = `${
              ["Influenza", "COVID-19", "Tetanus", "HPV"][
                Math.floor(Math.random() * 4)
              ]
            } Vaccination`;
            description = `Vaccination certificate and details`;
            fileType = "pdf";
            break;
          default:
            title = "Medical Record";
            description = "Healthcare documentation";
            fileType = "pdf";
        }

        records.push({
          id: `rec_${Date.now()}_${i}`,
          title,
          category,
          description,
          createdAt: date.toISOString(),
          fileType,
          fileSize: Math.floor(Math.random() * 10) + 1 + "MB",
          ipfsHash: `Qm${Array(44)
            .fill(0)
            .map(() => Math.floor(Math.random() * 36).toString(36))
            .join("")}`,
          blockchainTx: `0x${Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join("")}`,
          sharedWith:
            i % 4 === 0
              ? [
                  `Dr. ${
                    ["Smith", "Johnson", "Williams"][
                      Math.floor(Math.random() * 3)
                    ]
                  }`,
                ]
              : [],
        });
      }

      // Sort by date (newest first)
      records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return { data: { records } };
    } catch (error) {
      console.error("Get records failed:", error);
      throw error;
    }
  },

  // Upload a new medical record
  async uploadRecord(recordData, file) {
    try {
      await simulateApiDelay();

      // In a real app, this would upload the file to IPFS and register on blockchain
      // const formData = new FormData();
      // formData.append('file', file);
      // formData.append('metadata', JSON.stringify(recordData));
      // return apiClient.post('/records', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // });

      // Generate mock IPFS hash and blockchain transaction
      const ipfsHash = `Qm${Array(44)
        .fill(0)
        .map(() => Math.floor(Math.random() * 36).toString(36))
        .join("")}`;
      const blockchainTx = `0x${Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`;

      return {
        data: {
          record: {
            id: `rec_${Date.now()}`,
            ...recordData,
            fileSize: Math.floor(Math.random() * 10) + 1 + "MB",
            ipfsHash,
            blockchainTx,
            createdAt: new Date().toISOString(),
            sharedWith: [],
          },
        },
      };
    } catch (error) {
      console.error("Upload record failed:", error);
      throw error;
    }
  },

  // Delete a medical record (revoke access for everyone but owner)
  async deleteRecord(recordId) {
    try {
      await simulateApiDelay();

      // In a real app, this would update the blockchain to revoke all access
      // return apiClient.delete(`/records/${recordId}`);

      return { data: { success: true } };
    } catch (error) {
      console.error("Delete record failed:", error);
      throw error;
    }
  },

  // Get record details by ID
  async getRecordById(recordId) {
    try {
      await simulateApiDelay();

      // In a real app, this would fetch the record from API
      // return apiClient.get(`/records/${recordId}`);

      // Generate a mock record
      const categories = [
        "Lab Results",
        "Imaging",
        "Prescription",
        "Diagnosis",
        "Vaccination",
      ];
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const date = new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      );

      let title, description, fileType;
      switch (category) {
        case "Lab Results":
          title = `Complete Blood Count`;
          description = "Routine complete blood count laboratory analysis";
          fileType = "pdf";
          break;
        case "Imaging":
          title = "Chest X-Ray";
          description = "Chest X-Ray diagnostic imaging results";
          fileType = "dicom";
          break;
        default:
          title = "Medical Record";
          description = "Healthcare documentation";
          fileType = "pdf";
      }

      return {
        data: {
          record: {
            id: recordId,
            title,
            category,
            description,
            createdAt: date.toISOString(),
            fileType,
            fileSize: Math.floor(Math.random() * 10) + 1 + "MB",
            ipfsHash: `Qm${Array(44)
              .fill(0)
              .map(() => Math.floor(Math.random() * 36).toString(36))
              .join("")}`,
            blockchainTx: `0x${Array(64)
              .fill(0)
              .map(() => Math.floor(Math.random() * 16).toString(16))
              .join("")}`,
            sharedWith: [
              `Dr. ${
                ["Smith", "Johnson", "Williams"][Math.floor(Math.random() * 3)]
              }`,
            ],
            institution: "City General Hospital",
            provider: "Dr. Sarah Johnson",
            notes:
              "Patient presents with normal results within expected ranges.",
          },
        },
      };
    } catch (error) {
      console.error("Get record by ID failed:", error);
      throw error;
    }
  },
};

// Access Control Service Methods
const accessControl = {
  // Get list of healthcare providers with access to records
  async getAccessList() {
    try {
      await simulateApiDelay();

      // In a real app, this would fetch access list from the API
      // return apiClient.get('/access');

      // Generate mock access list
      const providers = [];
      const hospitals = [
        "City General Hospital",
        "Medical Center",
        "Healthcare Group",
        "University Medical",
        "Regional Clinic",
      ];
      const specialties = [
        "Cardiology",
        "Neurology",
        "Oncology",
        "Internal Medicine",
        "Family Medicine",
        "Dermatology",
      ];

      for (let i = 0; i < 5; i++) {
        const firstName = [
          "Sarah",
          "James",
          "Robert",
          "Maria",
          "David",
          "Emily",
          "Michael",
          "Jessica",
        ][Math.floor(Math.random() * 8)];
        const lastName = [
          "Smith",
          "Johnson",
          "Williams",
          "Brown",
          "Jones",
          "Garcia",
          "Miller",
          "Davis",
        ][Math.floor(Math.random() * 8)];
        const hospital =
          hospitals[Math.floor(Math.random() * hospitals.length)];
        const specialty =
          specialties[Math.floor(Math.random() * specialties.length)];
        const date = new Date(
          Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
        );
        const expiry = new Date(
          Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000
        );

        providers.push({
          id: `prov_${Date.now()}_${i}`,
          name: `Dr. ${firstName} ${lastName}`,
          firstName,
          lastName,
          institution: hospital,
          specialty,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${hospital
            .toLowerCase()
            .replace(/\s/g, "")}.org`,
          blockchainAddress: `0x${Array(40)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join("")}`,
          accessGrantedAt: date.toISOString(),
          accessExpiresAt: expiry.toISOString(),
          accessLevel: i === 0 ? "full" : "limited",
          recordsAccessed: Math.floor(Math.random() * 8),
        });
      }

      // Sort by most recently granted access
      providers.sort(
        (a, b) => new Date(b.accessGrantedAt) - new Date(a.accessGrantedAt)
      );

      return { data: { providers } };
    } catch (error) {
      console.error("Get access list failed:", error);
      throw error;
    }
  },

  // Grant access to a healthcare provider
  async grantAccess(providerData) {
    try {
      await simulateApiDelay();

      // In a real app, this would update the blockchain access control
      // return apiClient.post('/access', providerData);

      return {
        data: {
          provider: {
            id: `prov_${Date.now()}`,
            ...providerData,
            accessGrantedAt: new Date().toISOString(),
            accessExpiresAt: new Date(
              Date.now() + 180 * 24 * 60 * 60 * 1000
            ).toISOString(),
            recordsAccessed: 0,
          },
        },
      };
    } catch (error) {
      console.error("Grant access failed:", error);
      throw error;
    }
  },

  // Revoke access from a healthcare provider
  async revokeAccess(providerId) {
    try {
      await simulateApiDelay();

      // In a real app, this would update the blockchain to revoke access
      // return apiClient.delete(`/access/${providerId}`);

      return { data: { success: true } };
    } catch (error) {
      console.error("Revoke access failed:", error);
      throw error;
    }
  },

  // Update access settings for a healthcare provider
  async updateAccess(providerId, accessData) {
    try {
      await simulateApiDelay();

      // In a real app, this would update the access settings via API
      // return apiClient.put(`/access/${providerId}`, accessData);

      return {
        data: {
          provider: {
            id: providerId,
            ...accessData,
            accessUpdatedAt: new Date().toISOString(),
          },
        },
      };
    } catch (error) {
      console.error("Update access failed:", error);
      throw error;
    }
  },

  // Get access requests
  async getAccessRequests() {
    try {
      await simulateApiDelay();

      // In a real app, this would fetch access requests from the API
      // return apiClient.get('/access/requests');

      // Generate mock access requests
      const requests = [];
      const hospitals = [
        "City General Hospital",
        "Medical Center",
        "Healthcare Group",
        "University Medical",
      ];
      const specialties = [
        "Cardiology",
        "Neurology",
        "Oncology",
        "Internal Medicine",
      ];
      const reasons = [
        "Annual check-up follow-up",
        "Review of recent lab results",
        "Consultation for specialist referral",
        "Emergency care coordination",
        "Ongoing treatment monitoring",
      ];

      for (let i = 0; i < 3; i++) {
        const firstName = ["Sarah", "James", "Robert", "Maria"][
          Math.floor(Math.random() * 4)
        ];
        const lastName = ["Smith", "Johnson", "Williams", "Brown"][
          Math.floor(Math.random() * 4)
        ];
        const hospital =
          hospitals[Math.floor(Math.random() * hospitals.length)];
        const specialty =
          specialties[Math.floor(Math.random() * specialties.length)];
        const date = new Date(
          Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000
        );

        requests.push({
          id: `req_${Date.now()}_${i}`,
          providerName: `Dr. ${firstName} ${lastName}`,
          firstName,
          lastName,
          institution: hospital,
          specialty,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${hospital
            .toLowerCase()
            .replace(/\s/g, "")}.org`,
          blockchainAddress: `0x${Array(40)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join("")}`,
          requestedAt: date.toISOString(),
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          accessLevel: i === 0 ? "full" : "limited",
          duration: i === 0 ? "1 year" : i === 1 ? "6 months" : "3 months",
        });
      }

      // Sort by most recent request
      requests.sort(
        (a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)
      );

      return { data: { requests } };
    } catch (error) {
      console.error("Get access requests failed:", error);
      throw error;
    }
  },
};

// Blockchain and IPFS Service Methods
const blockchain = {
  // Get transaction history for a record
  async getTransactionHistory(recordId) {
    try {
      await simulateApiDelay();

      // In a real app, this would fetch blockchain transaction history
      // return apiClient.get(`/blockchain/history/${recordId}`);

      // Generate mock transaction history
      const transactions = [];
      const actions = [
        "UPLOAD",
        "ACCESS_GRANTED",
        "ACCESS_REVOKED",
        "RECORD_ACCESSED",
      ];
      const now = new Date();

      // First transaction is always record creation
      transactions.push({
        id: `tx_${recordId}_0`,
        action: "UPLOAD",
        timestamp: new Date(
          now - Math.random() * 365 * 24 * 60 * 60 * 1000
        ).toISOString(),
        performedBy: "You (Patient)",
        blockchainTx: `0x${Array(64)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("")}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
      });

      // Generate additional transactions
      for (let i = 0; i < 5; i++) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        const date = new Date(transactions[0].timestamp);
        // Make sure subsequent transactions are after the creation
        date.setDate(date.getDate() + Math.floor(Math.random() * 30) + 1);

        let actor, description;
        switch (action) {
          case "ACCESS_GRANTED":
            actor = `You (Patient)`;
            description = `Granted access to Dr. ${
              ["Smith", "Johnson", "Williams"][Math.floor(Math.random() * 3)]
            }`;
            break;
          case "ACCESS_REVOKED":
            actor = `You (Patient)`;
            description = `Revoked access from Dr. ${
              ["Smith", "Johnson", "Williams"][Math.floor(Math.random() * 3)]
            }`;
            break;
          case "RECORD_ACCESSED":
            actor = `Dr. ${
              ["Smith", "Johnson", "Williams"][Math.floor(Math.random() * 3)]
            }`;
            description = `Accessed the record for consultation`;
            break;
          default:
            actor = "System";
            description = "System action";
        }

        transactions.push({
          id: `tx_${recordId}_${i + 1}`,
          action,
          description,
          timestamp: date.toISOString(),
          performedBy: actor,
          blockchainTx: `0x${Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join("")}`,
          blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
        });
      }

      // Sort by timestamp (oldest first to show chronological history)
      transactions.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      return { data: { transactions } };
    } catch (error) {
      console.error("Get transaction history failed:", error);
      throw error;
    }
  },

  // Verify document integrity
  async verifyIntegrity(ipfsHash, recordId) {
    try {
      await simulateApiDelay();

      // In a real app, this would verify the document against blockchain
      // return apiClient.post('/blockchain/verify', { ipfsHash, recordId });

      // Most of the time return valid, but occasionally show invalid to simulate verification
      const isValid = Math.random() > 0.1;

      return {
        data: {
          verified: isValid,
          message: isValid
            ? "Document integrity verified successfully"
            : "Document integrity verification failed",
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Verify integrity failed:", error);
      throw error;
    }
  },
};

// User Service Methods
const users = {
  // Get user profile
  async getProfile() {
    try {
      await simulateApiDelay();
      return {
        data: {
          user: {
            id: 1,
            name: "Test User",
            email: "test@example.com",
          },
        },
      };
    } catch (error) {
      console.error("Get profile failed:", error);
      throw error;
    }
  },
};

// Export all service methods
const apiService = {
  auth,
  users,
  notifications,
  medicalRecords,
  accessControl,
  blockchain,
};

export default apiService;
