document.addEventListener('DOMContentLoaded', () => {
    const contentTitle = document.getElementById('contentTitle');
    const contentArea = document.getElementById('contentArea');

    const addJobsBtn = document.getElementById('addJobsBtn');
    const clientsBtn = document.getElementById('clientsBtn');
    const addClientBtn = document.getElementById('addClientBtn');
    const jobSchedulesBtn = document.getElementById('jobSchedulesBtn');
    const jobRequestedBtn = document.getElementById('jobRequestedBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    // Function to load job requests
    async function loadJobRequests() {
        contentTitle.textContent = 'Job Requested Applications';
        contentArea.innerHTML = '<p>Loading job applications...</p>';

        try {
            const response = await fetch('/api/job-requests');
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login.html'; // Redirect to login if not authenticated
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const applications = await response.json();

            if (applications.length === 0) {
                contentArea.innerHTML = '<p>No job applications submitted yet.</p>';
                return;
            }

            let tableHtml = `
                <table class="job-requests-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Experience</th>
                            <th>Details</th>
                            <th>Status</th>
                            <th>Submitted At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            applications.forEach(app => {
                const statusClass = `status-${app.status}`;
                tableHtml += `
                    <tr>
                        <td>${app.id}</td>
                        <td>${app.name}</td>
                        <td>${app.email}</td>
                        <td>${app.phone}</td>
                        <td>${app.experience}</td>
                        <td><textarea readonly>${app.jobDetails}</textarea></td>
                        <td class="${statusClass}">${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</td>
                        <td>${new Date(app.submittedAt).toLocaleString()}</td>
                        <td class="actions">
                            ${app.status === 'pending' ? `
                                <button class="btn btn-success approve-btn" data-id="${app.id}">Approve</button>
                                <button class="btn btn-danger decline-btn" data-id="${app.id}">Decline</button>
                            ` : ''}
                        </td>
                    </tr>
                `;
            });

            tableHtml += `
                    </tbody>
                </table>
            `;
            contentArea.innerHTML = tableHtml;

            // Add event listeners for approve/decline buttons
            document.querySelectorAll('.approve-btn').forEach(button => {
                button.addEventListener('click', (e) => handleApplicationAction(e.target.dataset.id, 'approve'));
            });
            document.querySelectorAll('.decline-btn').forEach(button => {
                button.addEventListener('click', (e) => handleApplicationAction(e.target.dataset.id, 'decline'));
            });

        } catch (error) {
            console.error('Error fetching job requests:', error);
            contentArea.innerHTML = '<p style="color: red;">Failed to load job applications. Please try again.</p>';
        }
    }

    // Function to handle approve/decline actions
    async function handleApplicationAction(id, action) {
        if (!confirm(`Are you sure you want to ${action} this application?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/job-requests/${id}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert(`Application ${action}d successfully!`);
                loadJobRequests(); // Reload the list
            } else {
                const errorText = await response.text();
                alert(`Failed to ${action} application: ${errorText}`);
            }
        } catch (error) {
            console.error(`Error ${action}ing application:`, error);
            alert(`An error occurred while trying to ${action} the application.`);
        }
    }

    // Event Listeners for Sidebar Buttons
    addJobsBtn.addEventListener('click', () => {
        contentTitle.textContent = 'Add New Job Posting';
        contentArea.innerHTML = `
            <p>This section will allow the admin to add new job openings for Paul's Cleaning Crews.</p>
            <form>
                <div class="form-group">
                    <label for="jobTitle">Job Title:</label>
                    <input type="text" id="jobTitle" name="jobTitle">
                </div>
                <div class="form-group">
                    <label for="jobDescription">Job Description:</label>
                    <textarea id="jobDescription" name="jobDescription" rows="5"></textarea>
                </div>
                <button type="submit" class="btn btn-success">Save Job</button>
            </form>
        `;
    });

    clientsBtn.addEventListener('click', () => {
        contentTitle.textContent = 'Manage Clients';
        contentArea.innerHTML = `
            <p>This section will display a list of all clients and allow for their management (view, edit, delete).</p>
            <p><em>(Functionality to be implemented)</em></p>
        `;
    });

    addClientBtn.addEventListener('click', () => {
        contentTitle.textContent = 'Add New Client';
        contentArea.innerHTML = `
            <p>This section will provide a form to add new client details.</p>
            <form>
                <div class="form-group">
                    <label for="clientName">Client Name:</label>
                    <input type="text" id="clientName" name="clientName">
                </div>
                <div class="form-group">
                    <label for="clientContact">Contact Person:</label>
                    <input type="text" id="clientContact" name="clientContact">
                </div>
                <div class="form-group">
                    <label for="clientAddress">Address:</label>
                    <input type="text" id="clientAddress" name="clientAddress">
                </div>
                <button type="submit" class="btn btn-success">Save Client</button>
            </form>
        `;
    });

    jobSchedulesBtn.addEventListener('click', () => {
        contentTitle.textContent = 'Job Schedules';
        contentArea.innerHTML = `
            <p>This section will allow the admin to view and manage job schedules for the cleaning crews.</p>
            <p><em>(Functionality to be implemented)</em></p>
            <p>Example: A calendar view or list of upcoming jobs with assigned crews.</p>
        `;
    });

    jobRequestedBtn.addEventListener('click', loadJobRequests); // Load job requests when clicked

    settingsBtn.addEventListener('click', () => {
        contentTitle.textContent = 'Settings';
        contentArea.innerHTML = `
            <p>This section will contain various settings useful for all users (e.g., profile management, notification preferences, general site settings).</p>
            <ul>
                <li><strong>Admin Profile:</strong> Change admin password (requires current password).</li>
                <li><strong>Notification Preferences:</strong> Set up email/SMS alerts for new applications or job updates.</li>
                <li><strong>Site Content Management:</strong> Edit static content on public pages (e.g., "About Us" text).</li>
                <li><strong>User Management:</strong> (If other user roles are introduced later)</li>
            </ul>
            <p><em>(Functionality to be implemented)</em></p>
        `;
    });

    // Initial load for Job Requested section when admin.html loads
    // You can change this to any default section you want to show first
    loadJobRequests();
});