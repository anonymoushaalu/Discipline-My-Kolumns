import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export const apiService = {
  // Jobs
  getJobs: () => axios.get(`${API_BASE}/jobs`),
  getJobStatus: (jobId) => axios.get(`${API_BASE}/jobs/${jobId}`),
  
  // Upload
  uploadCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Rules
  getRules: () => axios.get(`${API_BASE}/rules`),
  addRule: (columnName, ruleType, ruleValue) => 
    axios.post(`${API_BASE}/add-rule`, null, {
      params: { column_name: columnName, rule_type: ruleType, rule_value: ruleValue }
    }),
  updateRule: (ruleId, data) => axios.put(`${API_BASE}/rules/${ruleId}`, data),
  
  // Quarantine
  getQuarantine: () => axios.get(`${API_BASE}/quarantine`),
  updateQuarantine: (rowId, name, age) =>
    axios.put(`${API_BASE}/update-quarantine/${rowId}`, null, {
      params: { name, age }
    }),
  revalidateRow: (rowId) => axios.post(`${API_BASE}/revalidate/${rowId}`),
  
  // Logs
  getLogs: (jobId) => axios.get(`${API_BASE}/logs/${jobId}`),
  
  // Clean Data
  getCleanData: (limit = 5, jobId = null) => {
    if (jobId) {
      return axios.get(`${API_BASE}/clean-data?limit=${limit}&job_id=${jobId}`);
    }
    return axios.get(`${API_BASE}/clean-data?limit=${limit}`);
  },
  
  // Get job columns (dynamic)
  getJobColumns: (jobId) => axios.get(`${API_BASE}/job-columns/${jobId}`)
};
