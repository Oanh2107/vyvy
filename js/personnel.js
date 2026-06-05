// js/personnel.js

const PersonnelManager = {
    getPersonnel() {
        return StorageManager.getPersonnel();
    },

    getStaffById(id) {
        return this.getPersonnel().find(p => p.id === id);
    },

    addStaff(staffData) {
        this.validateStaffData(staffData);

        const personnel = this.getPersonnel();
        
        // Check email duplicate
        if (staffData.email && personnel.some(p => p.email.toLowerCase() === staffData.email.toLowerCase())) {
            throw new Error('Email này đã tồn tại trong hệ thống.');
        }

        const newStaff = {
            id: 'staff-' + Date.now(),
            name: staffData.name.trim(),
            email: staffData.email.trim(),
            phone: staffData.phone.trim(),
            deptId: staffData.deptId,
            role: staffData.role.trim() || 'Nhân viên',
            joinDate: staffData.joinDate || new Date().toISOString().slice(0, 10),
            contractDate: staffData.contractDate || staffData.joinDate || new Date().toISOString().slice(0, 10),
            salary: staffData.salary ? parseFloat(staffData.salary) : 0,
            bhxh: staffData.bhxh ? staffData.bhxh.trim() : '',
            status: staffData.status || 'active'
        };

        personnel.push(newStaff);
        StorageManager.savePersonnel(personnel);
        return newStaff;
    },

    updateStaff(id, staffData) {
        this.validateStaffData(staffData);

        const personnel = this.getPersonnel();
        const index = personnel.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Không tìm thấy nhân viên.');

        // Check email duplicate with others
        if (staffData.email && personnel.some(p => p.id !== id && p.email.toLowerCase() === staffData.email.toLowerCase())) {
            throw new Error('Email này đã được sử dụng bởi nhân viên khác.');
        }

        personnel[index] = {
            ...personnel[index],
            name: staffData.name.trim(),
            email: staffData.email.trim(),
            phone: staffData.phone.trim(),
            deptId: staffData.deptId,
            role: staffData.role.trim() || 'Nhân viên',
            joinDate: staffData.joinDate,
            contractDate: staffData.contractDate,
            salary: staffData.salary ? parseFloat(staffData.salary) : 0,
            bhxh: staffData.bhxh ? staffData.bhxh.trim() : '',
            status: staffData.status
        };

        StorageManager.savePersonnel(personnel);
        return personnel[index];
    },

    deleteStaff(id) {
        const tasks = StorageManager.getTasks();
        // Check if employee has active tasks
        const hasActiveTasks = tasks.some(t => t.assigneeId === id && t.status !== 'completed');
        if (hasActiveTasks) {
            throw new Error('Không thể xóa nhân viên này vì đang được phân công công việc chưa hoàn thành.');
        }

        let personnel = this.getPersonnel();
        personnel = personnel.filter(p => p.id !== id);
        StorageManager.savePersonnel(personnel);

        // Update tasks assignee to empty
        let updatedTasks = StorageManager.getTasks();
        updatedTasks = updatedTasks.map(t => {
            if (t.assigneeId === id) {
                return { ...t, assigneeId: '' };
            }
            return t;
        });
        StorageManager.saveTasks(updatedTasks);
    },

    validateStaffData(data) {
        if (!data.name || !data.name.trim()) throw new Error('Họ tên không được để trống.');
        if (!data.deptId) throw new Error('Vui lòng chọn phòng ban.');
        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) throw new Error('Email không hợp lệ.');
        }
        if (data.phone) {
            const phoneRegex = /^[0-9+.\s-]{9,15}$/;
            if (!phoneRegex.test(data.phone)) throw new Error('Số điện thoại không hợp lệ (9-15 số).');
        }
        if (!data.joinDate) throw new Error('Vui lòng chọn ngày vào làm.');
        if (!data.contractDate) throw new Error('Vui lòng chọn ngày ký hợp đồng.');
        if (data.salary && (isNaN(data.salary) || parseFloat(data.salary) < 0)) {
            throw new Error('Mức lương phải là số hợp lệ và lớn hơn hoặc bằng 0.');
        }
    },

    getStatusBadge(status) {
        switch (status) {
            case 'active':
                return '<span class="status-badge status-active">Đang làm việc</span>';
            case 'probation':
                return '<span class="status-badge status-probation">Thử việc</span>';
            case 'inactive':
                return '<span class="status-badge status-inactive">Đã nghỉ việc</span>';
            default:
                return `<span class="status-badge">${status}</span>`;
        }
    },

    populateAssigneeSelect(selectElementId, defaultOptionText = 'Chọn nhân sự') {
        const select = document.getElementById(selectElementId);
        if (!select) return;

        const personnel = this.getPersonnel().filter(p => p.status !== 'inactive');
        let html = `<option value="">-- ${defaultOptionText} --</option>`;
        personnel.forEach(staff => {
            const deptName = DepartmentsManager.getDepartmentName(staff.deptId);
            html += `<option value="${staff.id}">${staff.name} (${deptName} - ${staff.role})</option>`;
        });
        select.innerHTML = html;
    },

    renderPersonnelList(containerId, filters = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let list = this.getPersonnel();

        // Apply filters
        if (filters.search) {
            const searchVal = filters.search.toLowerCase().trim();
            list = list.filter(p => 
                p.name.toLowerCase().includes(searchVal) || 
                p.email.toLowerCase().includes(searchVal) || 
                p.phone.includes(searchVal) ||
                p.role.toLowerCase().includes(searchVal)
            );
        }

        if (filters.deptId) {
            list = list.filter(p => p.deptId === filters.deptId);
        }

        if (filters.status) {
            list = list.filter(p => p.status === filters.status);
        }

        if (list.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <p>Không tìm thấy nhân viên nào phù hợp.</p>
                </div>
            `;
            return;
        }

        // Generate Desktop Table view & Mobile Cards view dynamically
        let html = `
            <!-- Desktop View -->
            <div class="table-responsive desktop-view-only">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Họ và Tên</th>
                            <th>Phòng Ban / Chức Vụ</th>
                            <th>Lương / BHXH</th>
                            <th>Liên Hệ</th>
                            <th>Thời Gian</th>
                            <th>Trạng Thái</th>
                            <th class="text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        list.forEach(staff => {
            const deptName = DepartmentsManager.getDepartmentName(staff.deptId);
            const initials = staff.name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase();
            
            const salaryVal = staff.salary ? ProcurementManager.formatCurrency(staff.salary) : 'Chưa nhập';
            const bhxhVal = staff.bhxh || 'Chưa nhập';
            const contractDateVal = staff.contractDate ? this.formatDate(staff.contractDate) : 'Chưa nhập';

            html += `
                <tr>
                    <td>
                        <div class="staff-cell">
                            <div class="avatar-circle">${initials}</div>
                            <div>
                                <div class="font-semibold text-lg-size">${staff.name}</div>
                                <div class="text-muted text-xs-size">ID: ${staff.id}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="dept-badge-container">
                            <span class="badge badge-dept">${deptName}</span>
                            <div class="text-sm-size text-muted font-medium mt-1">${staff.role}</div>
                        </div>
                    </td>
                    <td>
                        <div class="font-semibold text-primary">${salaryVal}</div>
                        <div class="text-xs-size text-muted mt-1">BHXH: ${bhxhVal}</div>
                    </td>
                    <td>
                        <div class="contact-info">
                            <span class="text-sm-size text-primary font-medium" style="display:block;">📧 ${staff.email || 'N/A'}</span>
                            <span class="text-sm-size text-muted">📞 ${staff.phone || 'N/A'}</span>
                        </div>
                    </td>
                    <td>
                        <div class="date-cell">Vào: ${this.formatDate(staff.joinDate)}</div>
                        <div class="text-xs-size text-muted mt-1">Ký HĐ: ${contractDateVal}</div>
                    </td>
                    <td>
                        ${this.getStatusBadge(staff.status)}
                    </td>
                    <td class="text-right">
                        <div class="action-buttons">
                            <button class="btn btn-icon btn-primary btn-edit-staff" data-id="${staff.id}" title="Sửa thông tin">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                            </button>
                            <button class="btn btn-icon btn-danger btn-delete-staff" data-id="${staff.id}" title="Xóa nhân viên">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>

            <!-- Mobile View -->
            <div class="mobile-view-only staff-mobile-cards">
        `;

        list.forEach(staff => {
            const deptName = DepartmentsManager.getDepartmentName(staff.deptId);
            const initials = staff.name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase();
            
            const salaryVal = staff.salary ? ProcurementManager.formatCurrency(staff.salary) : 'Chưa nhập';
            const bhxhVal = staff.bhxh || 'Chưa nhập';
            const contractDateVal = staff.contractDate ? this.formatDate(staff.contractDate) : 'Chưa nhập';

            html += `
                <div class="mobile-card">
                    <div class="mobile-card-header">
                        <div class="avatar-circle">${initials}</div>
                        <div class="mobile-card-title-section">
                            <h4 class="mobile-card-title">${staff.name}</h4>
                            <span class="mobile-card-subtitle">${staff.role}</span>
                        </div>
                        <div class="mobile-card-status">${this.getStatusBadge(staff.status)}</div>
                    </div>
                    
                    <div class="mobile-card-body">
                        <div class="info-row">
                            <span class="info-label">Phòng ban:</span>
                            <span class="info-value font-semibold">${deptName}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Mức lương:</span>
                            <span class="info-value text-primary font-semibold">${salaryVal}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">BHXH:</span>
                            <span class="info-value">${bhxhVal}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-value text-primary">${staff.email || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Điện thoại:</span>
                            <span class="info-value">${staff.phone || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Ngày vào:</span>
                            <span class="info-value">${this.formatDate(staff.joinDate)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Ký HĐLĐ:</span>
                            <span class="info-value">${contractDateVal}</span>
                        </div>
                    </div>

                    <div class="mobile-card-footer">
                        <button class="btn btn-sm btn-outline-primary btn-edit-staff" data-id="${staff.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="margin-right:4px;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg> Sửa
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-delete-staff" data-id="${staff.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="margin-right:4px;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg> Xóa
                        </button>
                    </div>
                </div>
            `;
        });

        html += `</div>`;

        container.innerHTML = html;

        // Bind events
        container.querySelectorAll('.btn-edit-staff').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                window.openStaffModal?.(id);
            });
        });

        container.querySelectorAll('.btn-delete-staff').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const staff = this.getStaffById(id);
                if (confirm(`Bạn có chắc chắn muốn xóa nhân viên "${staff.name}" khỏi hệ thống?`)) {
                    try {
                        this.deleteStaff(id);
                        this.renderPersonnelList(containerId, filters);
                        window.showToast?.('Xóa nhân sự thành công!', 'success');
                    } catch (error) {
                        window.showToast?.(error.message, 'error');
                    }
                }
            });
        });
    },

    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    }
};

window.PersonnelManager = PersonnelManager;
