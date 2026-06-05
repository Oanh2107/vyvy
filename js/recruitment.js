// js/recruitment.js

const RecruitmentManager = {
    getRecruitments() {
        return StorageManager.getRecruitments();
    },

    getRecruitmentById(id) {
        return this.getRecruitments().find(r => r.id === id);
    },

    addRecruitment(data) {
        this.validateRecruitmentData(data);

        const list = this.getRecruitments();
        const newRec = {
            id: 'rec-' + Date.now(),
            position: data.position.trim(),
            deptId: data.deptId,
            quantity: parseInt(data.quantity),
            dueDate: data.dueDate,
            status: data.status || 'tuyển dụng'
        };

        list.push(newRec);
        StorageManager.saveRecruitments(list);
        return newRec;
    },

    updateRecruitment(id, data) {
        this.validateRecruitmentData(data);

        const list = this.getRecruitments();
        const index = list.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Không tìm thấy kế hoạch tuyển dụng.');

        list[index] = {
            ...list[index],
            position: data.position.trim(),
            deptId: data.deptId,
            quantity: parseInt(data.quantity),
            dueDate: data.dueDate,
            status: data.status
        };

        StorageManager.saveRecruitments(list);
        return list[index];
    },

    deleteRecruitment(id) {
        let list = this.getRecruitments();
        list = list.filter(r => r.id !== id);
        StorageManager.saveRecruitments(list);
    },

    validateRecruitmentData(data) {
        if (!data.position || !data.position.trim()) throw new Error('Vị trí tuyển dụng không được để trống.');
        if (!data.deptId) throw new Error('Vui lòng chọn phòng ban.');
        if (!data.quantity || parseInt(data.quantity) <= 0) throw new Error('Số lượng tuyển dụng phải lớn hơn 0.');
        if (!data.dueDate) throw new Error('Vui lòng chọn hạn hoàn thành.');
    },

    getStatusBadge(status) {
        switch (status) {
            case 'tuyển dụng':
                return '<span class="status-badge status-active">Đang tuyển</span>';
            case 'đã tuyển':
                return '<span class="status-badge status-inactive">Đã tuyển đủ</span>';
            case 'tạm dừng':
                return '<span class="status-badge status-probation">Tạm dừng</span>';
            default:
                return `<span class="status-badge">${status}</span>`;
        }
    },

    renderRecruitmentsTab(containerId, activeDeptId = '') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const recruitments = this.getRecruitments();
        const departments = StorageManager.getDepartments();

        if (recruitments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📢</div>
                    <p>Chưa có kế hoạch tuyển dụng nào được tạo.</p>
                </div>
            `;
            return;
        }

        let html = '';

        // Filter departments based on selection or active plans
        departments.forEach(dept => {
            if (activeDeptId && dept.id !== activeDeptId) return;

            const deptPlans = recruitments.filter(r => r.deptId === dept.id);
            if (deptPlans.length === 0) return; // Only show departments with plans

            html += `
                <div class="panel-card" style="margin-bottom:24px; padding: 20px;">
                    <h3 class="font-semibold text-base-size" style="margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                        <span class="dept-icon-badge">🏢</span>
                        <span>${dept.name}</span>
                        <span class="badge badge-dept" style="font-size:11px;">${deptPlans.length} kế hoạch</span>
                    </h3>
                    
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Vị Trí Tuyển Dụng</th>
                                    <th class="text-center">Số Lượng</th>
                                    <th>Hạn Tuyển</th>
                                    <th>Trạng Thái</th>
                                    <th class="text-right">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            deptPlans.forEach(plan => {
                html += `
                    <tr>
                        <td><span class="font-semibold">${plan.position}</span></td>
                        <td class="text-center"><span class="badge badge-info">${plan.quantity} người</span></td>
                        <td>${PersonnelManager.formatDate(plan.dueDate)}</td>
                        <td>${this.getStatusBadge(plan.status)}</td>
                        <td class="text-right">
                            <div class="action-buttons">
                                <button class="btn btn-icon btn-primary btn-edit-rec" data-id="${plan.id}" title="Sửa kế hoạch">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                </button>
                                <button class="btn btn-icon btn-danger btn-delete-rec" data-id="${plan.id}" title="Xóa kế hoạch">
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
                </div>
            `;
        });

        if (!html) {
            html = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <p>Không có kế hoạch tuyển dụng nào thuộc phòng ban đã chọn.</p>
                </div>
            `;
        }

        container.innerHTML = html;

        // Bind Edit buttons
        container.querySelectorAll('.btn-edit-rec').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                window.openRecruitmentModal?.(id);
            });
        });

        // Bind Delete buttons
        container.querySelectorAll('.btn-delete-rec').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const plan = this.getRecruitmentById(id);
                if (confirm(`Bạn có chắc chắn muốn xóa kế hoạch tuyển dụng cho "${plan.position}"?`)) {
                    this.deleteRecruitment(id);
                    this.renderRecruitmentsTab(containerId, activeDeptId);
                    window.showToast?.('Xóa kế hoạch tuyển dụng thành công!', 'success');
                    window.dispatchEvent(new CustomEvent('recruitmentsUpdated'));
                }
            });
        });
    }
};

window.RecruitmentManager = RecruitmentManager;
