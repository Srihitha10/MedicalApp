import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  Divider,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  Description,
  FilePresent,
  ContentCopy,
  Visibility,
  DeleteOutline,
  HealthAndSafety,
  LocalHospital,
  Event,
  Search,
  FilterList,
  Download,
} from "@mui/icons-material";
import { useBlockchain } from "../../contexts/BlockchainContext";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  transition: "all 0.3s ease",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "visible",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
    "& .record-actions": {
      opacity: 1,
    },
  },
}));

const IconOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: -20,
  right: 20,
  width: 40,
  height: 40,
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  zIndex: 1,
}));

const SearchBox = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 30,
    backgroundColor: alpha(theme.palette.common.white, 0.9),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 1),
    },
    "&.Mui-focused": {
      backgroundColor: alpha(theme.palette.common.white, 1),
    },
  },
}));

const FilterChip = styled(Chip)(({ theme, selected }) => ({
  margin: theme.spacing(0.5),
  fontWeight: selected ? 600 : 400,
  backgroundColor: selected
    ? theme.palette.primary.main
    : alpha(theme.palette.primary.light, 0.1),
  color: selected
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
  "&:hover": {
    backgroundColor: selected
      ? theme.palette.primary.dark
      : alpha(theme.palette.primary.light, 0.2),
  },
}));

const ActionsBox = styled(Box)(({ theme }) => ({
  opacity: 0,
  transition: "opacity 0.3s ease",
}));

const RECORD_TYPES = {
  PRESCRIPTION: { icon: <LocalHospital />, color: "#f44336" },
  LABTEST: { icon: <Description />, color: "#2196f3" },
  XRAY: { icon: <HealthAndSafety />, color: "#4caf50" },
  OTHER: { icon: <FilePresent />, color: "#ff9800" },
};

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { fetchRecords } = useBlockchain();

  useEffect(() => {
    const fetchUserRecords = async () => {
      try {
        // Simulate fetching records from blockchain/IPFS
        setTimeout(() => {
          const mockRecords = [
            {
              id: "0x7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b",
              name: "Annual Checkup Results",
              type: "LABTEST",
              date: "2025-03-15",
              hash: "QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgptN",
              hospital: "City General Hospital",
              doctor: "Dr. Sarah Johnson",
              description: "Complete blood work and general health assessment.",
              accessCount: 3,
              lastAccessed: "2025-04-08",
            },
            {
              id: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
              name: "Chest X-Ray",
              type: "XRAY",
              date: "2025-02-22",
              hash: "QmT8CQh7jDcEDZvY4PwYyU2XeW2S9xNKV2ZFCBJrVMUMbr",
              hospital: "Medical Imaging Center",
              doctor: "Dr. Robert Chen",
              description: "Chest X-ray images showing lung condition.",
              accessCount: 1,
              lastAccessed: "2025-03-01",
            },
            {
              id: "0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f",
              name: "Prescription - Antibiotics",
              type: "PRESCRIPTION",
              date: "2025-04-01",
              hash: "QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgptN",
              hospital: "City Health Clinic",
              doctor: "Dr. Emily Martinez",
              description: "Prescribed medication for respiratory infection.",
              accessCount: 0,
              lastAccessed: "Never",
            },
            {
              id: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b",
              name: "Allergy Test Results",
              type: "LABTEST",
              date: "2025-01-18",
              hash: "QmT8CQh7jDcEDZvY4PwYyU2XeW2S9xNKV2ZFCBJrVMUMbr",
              hospital: "Allergy & Immunology Center",
              doctor: "Dr. Michael Wong",
              description: "Comprehensive allergy panel test results.",
              accessCount: 2,
              lastAccessed: "2025-02-15",
            },
          ];
          setRecords(mockRecords);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching medical records:", error);
        setLoading(false);
      }
    };

    fetchUserRecords();
  }, [fetchRecords]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilter = (type) => {
    setFilterType(type);
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setViewDialogOpen(false);
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "ALL" || record.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You'd typically show a notification here
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <SearchBox
          fullWidth
          placeholder="Search records by name, description or doctor..."
          variant="outlined"
          size="medium"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          <FilterList sx={{ mr: 1 }} />
          <FilterChip
            label="All"
            onClick={() => handleFilter("ALL")}
            selected={filterType === "ALL"}
          />
          <FilterChip
            label="Lab Tests"
            onClick={() => handleFilter("LABTEST")}
            selected={filterType === "LABTEST"}
          />
          <FilterChip
            label="X-Rays"
            onClick={() => handleFilter("XRAY")}
            selected={filterType === "XRAY"}
          />
          <FilterChip
            label="Prescriptions"
            onClick={() => handleFilter("PRESCRIPTION")}
            selected={filterType === "PRESCRIPTION"}
          />
        </Box>
      </Box>

      {filteredRecords.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <FilePresent
            sx={{ fontSize: 60, color: "text.secondary", opacity: 0.5 }}
          />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            No records found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredRecords.map((record) => (
            <Grid item xs={12} sm={6} md={4} key={record.id}>
              <StyledCard>
                <IconOverlay>
                  {RECORD_TYPES[record.type]?.icon || <FilePresent />}
                </IconOverlay>

                <CardContent sx={{ pt: 3 }}>
                  <Typography variant="h6" noWrap title={record.name}>
                    {record.name}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <Event fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {record.date}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {record.hospital} • {record.doctor}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      mb: 2,
                    }}
                  >
                    {record.description}
                  </Typography>

                  <Chip
                    label={record.type.toLowerCase().replace("_", " ")}
                    size="small"
                    sx={{
                      backgroundColor: alpha(
                        RECORD_TYPES[record.type]?.color || "#9e9e9e",
                        0.1
                      ),
                      color: RECORD_TYPES[record.type]?.color || "#9e9e9e",
                      fontWeight: 600,
                    }}
                  />
                </CardContent>

                <CardActions
                  sx={{
                    mt: "auto",
                    justifyContent: "space-between",
                    px: 2,
                    pb: 2,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Last accessed: {record.lastAccessed}
                  </Typography>

                  <ActionsBox className="record-actions">
                    <Tooltip title="View Record">
                      <IconButton
                        size="small"
                        onClick={() => handleViewRecord(record)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy Hash">
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(record.hash)}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton size="small">
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ActionsBox>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* View Record Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        {selectedRecord && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" component="div" fontWeight="bold">
                {selectedRecord.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Record ID: {selectedRecord.id.substring(0, 8)}...
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.type.toLowerCase().replace("_", " ")}
                  </Typography>

                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    Date Created
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.date}
                  </Typography>

                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    Healthcare Provider
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.hospital}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Doctor
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.doctor}
                  </Typography>

                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    Access Count
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.accessCount} times
                  </Typography>

                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    Last Accessed
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.lastAccessed}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedRecord.description}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    IPFS Hash
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {selectedRecord.hash}
                    </Typography>
                    <Tooltip title="Copy Hash">
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(selectedRecord.hash)}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>

                {/* Placeholder for record preview */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 200,
                      backgroundColor: "background.paper",
                    }}
                  >
                    <FilePresent
                      sx={{
                        fontSize: 60,
                        color: "text.secondary",
                        opacity: 0.5,
                        mb: 2,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      File preview would appear here
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      sx={{ mt: 2 }}
                    >
                      Download File
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MedicalRecords;
