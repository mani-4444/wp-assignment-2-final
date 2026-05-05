<template>
  <div class="container mt-5">
    <div class="page-header text-center mb-5">
      <h2 class="title">Employee Hub</h2>
      <p class="subtitle text-muted">
        Manage your team members and roles efficiently
      </p>
    </div>

    <!-- Add/Edit Form -->
    <div class="card form-card mb-5">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">
          <span v-if="isEditing">Edit Employee Details</span>
          <span v-else>Add New Employee</span>
        </h5>
        <span
          class="badge"
          :class="isEditing ? 'bg-warning text-dark' : 'bg-primary'"
        >
          {{ isEditing ? "Editing Mode" : "Creation Mode" }}
        </span>
      </div>
      <div class="card-body p-4">
        <form @submit.prevent="saveEmployee">
          <div class="row g-4">
            <div class="col-md-6">
              <label class="form-label text-muted small fw-bold text-uppercase"
                >Name</label
              >
              <div class="input-group">
                <input
                  type="text"
                  v-model="employeeForm.name"
                  class="form-control"
                  placeholder="e.g., Jane Doe"
                  required
                />
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label text-muted small fw-bold text-uppercase"
                >Designation</label
              >
              <div class="input-group">
                <input
                  type="text"
                  v-model="employeeForm.designation"
                  class="form-control"
                  placeholder="e.g., Software Engineer"
                  required
                />
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label text-muted small fw-bold text-uppercase"
                >Department</label
              >
              <div class="input-group">
                <input
                  type="text"
                  v-model="employeeForm.department"
                  class="form-control"
                  placeholder="e.g., Engineering"
                  required
                />
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label text-muted small fw-bold text-uppercase"
                >Salary</label
              >
              <div class="input-group">
                <input
                  type="number"
                  v-model="employeeForm.salary"
                  class="form-control"
                  placeholder="e.g., 75000"
                  required
                />
              </div>
            </div>
          </div>
          <div class="d-flex mt-4 pt-3 border-top">
            <button
              type="submit"
              class="btn btn-primary px-4 shadow-sm"
              :disabled="loading"
            >
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {{ isEditing ? "Save Changes" : "Create Employee" }}
            </button>
            <button
              type="button"
              class="btn btn-light border ms-2 px-4 shadow-sm"
              @click="resetForm"
              v-if="isEditing"
            >
              Cancel Edit
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Employee Table -->
    <div class="card table-card mb-5">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">Employee Roster</h5>
        <span class="badge bg-secondary rounded-pill shadow-sm"
          >Total: {{ employees.length }}</span
        >
      </div>
      <div class="card-body p-0">
        <div v-if="loading && employees.length === 0" class="text-center p-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Fetching employees...</p>
        </div>
        <div
          v-else-if="error"
          class="alert alert-danger m-4 border-0 shadow-sm"
        >
          {{ error }}
        </div>
        <div class="table-responsive" v-else>
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">ID</th>
                <th>Employee Details</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Salary</th>
                <th class="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in employees" :key="emp.id" class="employee-row">
                <td class="ps-4 text-muted fw-bold">#{{ emp.id || "N/A" }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div
                      class="avatar bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold"
                      style="width: 40px; height: 40px"
                    >
                      {{ emp.name.charAt(0).toUpperCase() }}
                    </div>
                    <strong>{{ emp.name }}</strong>
                  </div>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">{{
                    emp.designation
                  }}</span>
                </td>
                <td>{{ emp.department }}</td>
                <td class="fw-bold text-success">
                  ₹{{ emp.salary ? Number(emp.salary).toLocaleString() : 0 }}
                </td>
                <td class="text-end pe-4">
                  <button
                    class="btn btn-sm btn-action btn-outline-primary me-2 fw-bold"
                    style="width: auto; padding: 0.25rem 0.75rem"
                    @click="editEmployee(emp)"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    class="btn btn-sm btn-action btn-outline-danger fw-bold"
                    style="width: auto; padding: 0.25rem 0.75rem"
                    @click="deleteEmployee(emp.id)"
                    title="Delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
              <tr v-if="employees.length === 0">
                <td colspan="6" class="text-center p-5">
                  <div class="empty-state text-muted">
                    <h5>No employees found</h5>
                    <p>Start by adding a new employee above.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

const API_URL = "https://69f96cdec509a40d3aa271f6.mockapi.io/employees";

export default {
  name: "EmployeeManager",
  data() {
    return {
      employees: [],
      employeeForm: {
        id: null,
        name: "",
        designation: "",
        department: "",
        salary: null,
      },
      isEditing: false,
      loading: false,
      error: null,
    };
  },
  mounted() {
    this.fetchEmployees();
  },
  methods: {
    async fetchEmployees() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(API_URL);
        this.employees = response.data;
      } catch (err) {
        this.error = "Failed to fetch employees. Please try again.";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async saveEmployee() {
      this.loading = true;
      try {
        if (this.isEditing) {
          // Send all data back to MockAPI without extracting 'id'
          // if it doesn't recognize our custom extraction
          await axios.put(
            `${API_URL}/${this.employeeForm.id}`,
            this.employeeForm,
          );
        } else {
          await axios.post(API_URL, this.employeeForm);
        }
        await this.fetchEmployees();
        this.resetForm();
      } catch (err) {
        this.error = "Failed to save employee. Please try again.";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    editEmployee(employee) {
      this.isEditing = true;
      this.employeeForm = { ...employee };
    },
    async deleteEmployee(id) {
      if (!confirm("Are you sure you want to delete this employee?")) return;

      this.loading = true;
      try {
        await axios.delete(`${API_URL}/${id}`);
        await this.fetchEmployees();
      } catch (err) {
        this.error = "Failed to delete employee. Please try again.";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.isEditing = false;
      this.employeeForm = {
        id: null,
        name: "",
        designation: "",
        department: "",
        salary: null,
      };
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 950px;
  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif;
}

.page-header {
  padding-bottom: 1rem;
  border-bottom: 2px dashed #f1f3f5;
}

.title {
  color: #2b3a4a;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 1.1rem;
  font-weight: 500;
}

.card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  background-color: white;
}

.form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #edf2f7;
  padding: 1.25rem 1.5rem;
}

.card-header h5 {
  color: #4a5568;
  font-weight: 700;
  font-size: 1.1rem;
}

.card-body {
  background-color: #ffffff;
}

.form-label {
  letter-spacing: 0.5px;
  color: #718096;
}

.input-group-text {
  border-color: #cbd5e0;
  color: #4a5568;
  font-size: 1.1rem;
}

.form-control {
  border-color: #cbd5e0;
  padding: 0.65rem 1rem;
  transition: all 0.2s ease;
  background-color: #f8f9fa;
}

.form-control:focus {
  background-color: white;
  border-color: #63b3ed;
  box-shadow: 0 0 0 3px rgba(99, 179, 237, 0.15);
}

.input-group:focus-within .input-group-text,
.input-group:focus-within .form-control {
  border-color: #63b3ed;
}

.btn {
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.2s ease;
  letter-spacing: 0.3px;
}

.btn-primary {
  background-color: #3b82f6;
  border-color: #3b82f6;
  padding: 10px 24px;
}

.btn-primary:hover {
  background-color: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
}

.table-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.table th {
  color: #4a5568;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.8px;
  padding: 1.2rem 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.table td {
  vertical-align: middle;
  padding: 1.25rem 1rem;
  color: #2d3748;
  border-bottom: 1px solid #edf2f7;
}

.employee-row {
  transition: background-color 0.2s ease;
}

.table-hover tbody tr:hover {
  background-color: #f8fafc;
}

.avatar {
  font-size: 1.2rem;
  box-shadow: 0 2px 5px rgba(59, 130, 246, 0.2);
}

.badge {
  padding: 0.5em 0.8em;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.btn-action {
  width: 38px;
  height: 38px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.btn-outline-primary {
  background-color: #ebf4ff;
  color: #3182ce;
}
.btn-outline-primary:hover {
  background-color: #3182ce;
  color: white;
  transform: scale(1.05);
}

.btn-outline-danger {
  background-color: #fff5f5;
  color: #e53e3e;
}
.btn-outline-danger:hover {
  background-color: #e53e3e;
  color: white;
  transform: scale(1.05);
}

.empty-state {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
