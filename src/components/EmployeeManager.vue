<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4">Employee Management System</h2>

    <!-- Add/Edit Form -->
    <div class="card mb-4">
      <div class="card-header">
        <h5>{{ isEditing ? "Edit Employee" : "Add New Employee" }}</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="saveEmployee">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Name</label>
              <input
                type="text"
                v-model="employeeForm.name"
                class="form-control"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Designation</label>
              <input
                type="text"
                v-model="employeeForm.designation"
                class="form-control"
                required
              />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Department</label>
              <input
                type="text"
                v-model="employeeForm.department"
                class="form-control"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Salary</label>
              <input
                type="number"
                v-model="employeeForm.salary"
                class="form-control"
                required
              />
            </div>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ isEditing ? "Update" : "Save" }}
          </button>
          <button
            type="button"
            class="btn btn-secondary ms-2"
            @click="resetForm"
            v-if="isEditing"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>

    <!-- Employee Table -->
    <div class="card">
      <div class="card-header">
        <h5>Employee List</h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
        <table v-else class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in employees" :key="emp.id">
              <td>{{ emp.id || "N/A" }}</td>
              <td>{{ emp.name }}</td>
              <td>{{ emp.designation }}</td>
              <td>{{ emp.department }}</td>
              <td>{{ emp.salary }}</td>
              <td>
                <button
                  class="btn btn-sm btn-warning me-2"
                  @click="editEmployee(emp)"
                >
                  Edit
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="deleteEmployee(emp.id)"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="employees.length === 0">
              <td colspan="6" class="text-center">No employees found.</td>
            </tr>
          </tbody>
        </table>
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
  max-width: 900px;
  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif;
}

h2 {
  color: #2c3e50;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #edf2f7;
  padding: 1.25rem 1.5rem;
}

.card-header h5 {
  margin: 0;
  color: #4a5568;
  font-weight: 600;
}

.card-body {
  padding: 2rem 1.5rem;
}

.form-label {
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.form-control {
  border-radius: 8px;
  border: 1px solid #cbd5e0;
  padding: 0.6rem 1rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-control:focus {
  border-color: #63b3ed;
  box-shadow: 0 0 0 3px rgba(99, 179, 237, 0.2);
  outline: none;
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  padding: 0.6rem 1.5rem;
  transition: all 0.2s ease;
  letter-spacing: 0.3px;
}

.btn-primary {
  background-color: #4299e1;
  border-color: #4299e1;
}

.btn-primary:hover {
  background-color: #3182ce;
  border-color: #3182ce;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #4a5568;
  border: none;
}

.btn-secondary:hover {
  background-color: #cbd5e0;
  color: #2d3748;
}

.table th {
  background-color: #f8f9fa;
  color: #4a5568;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
  padding: 1rem;
}

.table td {
  vertical-align: middle;
  padding: 1rem;
  color: #4a5568;
  border-bottom: 1px solid #edf2f7;
}

.table-striped tbody tr:nth-of-type(odd) {
  background-color: #fdfdfd;
}

.table-hover tbody tr:hover {
  background-color: #ebf4ff;
}

.btn-sm {
  padding: 0.35rem 0.8rem;
  font-size: 0.875rem;
}

.btn-warning {
  background-color: #ecc94b;
  border-color: #ecc94b;
  color: #744210;
}

.btn-warning:hover {
  background-color: #d69e2e;
  border-color: #d69e2e;
  color: white;
}

.btn-danger {
  background-color: #fc8181;
  border-color: #fc8181;
}

.btn-danger:hover {
  background-color: #e53e3e;
  border-color: #e53e3e;
}
</style>
