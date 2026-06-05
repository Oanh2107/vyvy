// js/contracts.js

const ContractsManager = {
    getTemplate() {
        return StorageManager.getContractTemplate();
    },

    saveTemplate(templateText) {
        StorageManager.saveContractTemplate(templateText);
    },

    // Helper to replace all tokens
    generateContractText(staff) {
        let template = this.getTemplate();
        
        const todayStr = new Date().toLocaleDateString('vi-VN');
        const deptName = DepartmentsManager.getDepartmentName(staff.deptId);
        const salaryText = ProcurementManager.formatCurrency(staff.salary || 0);

        const tokens = {
            '{ID_HD}': staff.id ? staff.id.replace('staff-', '') : '______',
            '{NGAY_KY}': todayStr,
            '{HO_TEN}': staff.name ? staff.name.toUpperCase() : '__________________',
            '{DIEN_THOAI}': staff.phone || '__________________',
            '{EMAIL}': staff.email || '__________________',
            '{PHONG_BAN}': deptName,
            '{CHUC_VU}': staff.role || '__________________',
            '{NGAY_VAO}': staff.joinDate ? PersonnelManager.formatDate(staff.joinDate) : '__________________',
            '{NGAY_KY_HD}': staff.contractDate ? PersonnelManager.formatDate(staff.contractDate) : '__________________',
            '{MUC_LUONG}': salaryText,
            '{BHXH}': staff.bhxh || '__________________'
        };

        for (const [key, value] of Object.entries(tokens)) {
            template = template.replaceAll(key, value);
        }

        return template;
    },

    renderContractsTab(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const templateText = this.getTemplate();
        const staffList = PersonnelManager.getPersonnel().filter(p => p.status !== 'inactive');

        let html = `
            <div class="template-editor-card">
                <!-- Left: List of Tokens and template description -->
                <div class="template-tokens-list">
                    <h3 class="font-semibold text-base-size" style="margin-bottom:12px;">Mẫu Hợp Đồng Mặc Định</h3>
                    <p class="text-xs-size text-muted" style="margin-bottom:16px;">
                        Bạn có thể soạn thảo mẫu Hợp đồng lao động gốc bằng các biến dưới đây. Khi tạo hợp đồng cho nhân viên, các biến này sẽ tự động được thay thế bằng thông tin thực tế.
                    </p>
                    <div style="margin-bottom:16px;">
                        <span class="token-tag" data-token="{HO_TEN}">Họ Tên {HO_TEN}</span>
                        <span class="token-tag" data-token="{PHONG_BAN}">Phòng Ban {PHONG_BAN}</span>
                        <span class="token-tag" data-token="{CHUC_VU}">Chức Vụ {CHUC_VU}</span>
                        <span class="token-tag" data-token="{MUC_LUONG}">Lương {MUC_LUONG}</span>
                        <span class="token-tag" data-token="{BHXH}">BHXH {BHXH}</span>
                        <span class="token-tag" data-token="{NGAY_VAO}">Ngày vào {NGAY_VAO}</span>
                        <span class="token-tag" data-token="{NGAY_KY_HD}">Ngày ký HĐ {NGAY_KY_HD}</span>
                        <span class="token-tag" data-token="{DIEN_THOAI}">Điện thoại {DIEN_THOAI}</span>
                        <span class="token-tag" data-token="{EMAIL}">Email {EMAIL}</span>
                        <span class="token-tag" data-token="{ID_HD}">Số HĐ {ID_HD}</span>
                        <span class="token-tag" data-token="{NGAY_KY}">Ngày lập HĐ {NGAY_KY}</span>
                    </div>
                    
                    <button class="btn btn-primary btn-sm" id="btn-save-contract-template" style="width:100%;">Lưu Mẫu Hợp Đồng</button>
                </div>

                <!-- Middle/Right: Template Textarea -->
                <div>
                    <label for="contract-template-text" class="form-label font-semibold">Nội dung mẫu hợp đồng gốc</label>
                    <textarea id="contract-template-text" class="form-input" style="height: 300px; font-family: monospace; font-size: 13px; line-height: 1.5; resize: vertical;">${templateText}</textarea>
                </div>
            </div>

            <!-- List of Personnel to generate contracts -->
            <div class="panel-card" style="margin-top: 32px;">
                <h3 class="panel-title">Tiến Hành Lập Hợp Đồng Cho Nhân Viên</h3>
                <p class="text-sm-size text-muted" style="margin-top:-16px; margin-bottom: 20px;">
                    Danh sách nhân viên chính thức đang làm việc và trạng thái hợp đồng của họ.
                </p>
        `;

        if (staffList.length === 0) {
            html += `
                <div class="empty-state-compact">
                    <p class="text-muted">Chưa có nhân viên nào trong danh sách hoạt động.</p>
                </div>
            `;
        } else {
            html += `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nhân Viên</th>
                                <th>Phòng Ban / Chức Vụ</th>
                                <th>Mức Lương</th>
                                <th>Mã số BHXH</th>
                                <th>Ngày Ký HĐLĐ</th>
                                <th class="text-right">Hợp Đồng</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            staffList.forEach(staff => {
                const deptName = DepartmentsManager.getDepartmentName(staff.deptId);
                const hasContractFields = staff.salary && staff.bhxh && staff.contractDate;
                const statusBadge = hasContractFields
                    ? `<span class="badge badge-info">Đã thiết lập thông tin</span>`
                    : `<span class="badge badge-warning">Thiếu thông tin lương/BHXH</span>`;
                
                const salaryVal = staff.salary ? ProcurementManager.formatCurrency(staff.salary) : 'Chưa thiết lập';
                const bhxhVal = staff.bhxh || 'Chưa thiết lập';
                const contractDateVal = staff.contractDate ? PersonnelManager.formatDate(staff.contractDate) : 'Chưa thiết lập';

                html += `
                    <tr>
                        <td>
                            <div class="font-semibold">${staff.name}</div>
                            <div class="text-xs-size text-muted">${staff.role}</div>
                        </td>
                        <td><span class="badge badge-dept">${deptName}</span></td>
                        <td><span class="font-medium text-primary">${salaryVal}</span></td>
                        <td>${bhxhVal}</td>
                        <td>${contractDateVal}</td>
                        <td class="text-right">
                            <button class="btn btn-sm btn-primary btn-generate-contract" data-id="${staff.id}">
                                📝 Tạo & Xem HĐ
                            </button>
                        </td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;

        // Bind Save Template Button
        const saveBtn = document.getElementById('btn-save-contract-template');
        const textarea = document.getElementById('contract-template-text');
        if (saveBtn && textarea) {
            saveBtn.addEventListener('click', () => {
                const text = textarea.value;
                this.saveTemplate(text);
                window.showToast?.('Đã lưu mẫu Hợp đồng lao động gốc thành công!', 'success');
            });
        }

        // Bind Token Clicks (adds token to cursor position in textarea)
        container.querySelectorAll('.token-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const token = tag.getAttribute('data-token');
                if (textarea) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const currentText = textarea.value;
                    textarea.value = currentText.substring(0, start) + token + currentText.substring(end);
                    textarea.focus();
                    textarea.selectionStart = textarea.selectionEnd = start + token.length;
                }
            });
        });

        // Bind Generate Contract Buttons
        container.querySelectorAll('.btn-generate-contract').forEach(btn => {
            btn.addEventListener('click', () => {
                const staffId = btn.getAttribute('data-id');
                window.openContractViewModal?.(staffId);
            });
        });
    }
};

window.ContractsManager = ContractsManager;
