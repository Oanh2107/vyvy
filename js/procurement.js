// js/procurement.js

const ProcurementManager = {
    getProcurements() {
        return StorageManager.getProcurements();
    },

    getProcurementById(id) {
        return this.getProcurements().find(p => p.id === id);
    },

    addProcurement(data) {
        this.validateProcurementData(data);

        const procurements = this.getProcurements();
        const newProc = {
            id: 'proc-' + Date.now(),
            date: data.date,
            productName: data.productName.trim(),
            quantity: parseInt(data.quantity),
            price: parseFloat(data.price),
            supplier: data.supplier.trim()
        };

        procurements.push(newProc);
        StorageManager.saveProcurements(procurements);
        return newProc;
    },

    updateProcurement(id, data) {
        this.validateProcurementData(data);

        const procurements = this.getProcurements();
        const index = procurements.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Không tìm thấy bản ghi mua sắm.');

        procurements[index] = {
            ...procurements[index],
            date: data.date,
            productName: data.productName.trim(),
            quantity: parseInt(data.quantity),
            price: parseFloat(data.price),
            supplier: data.supplier.trim()
        };

        StorageManager.saveProcurements(procurements);
        return procurements[index];
    },

    deleteProcurement(id) {
        let procurements = this.getProcurements();
        procurements = procurements.filter(p => p.id !== id);
        StorageManager.saveProcurements(procurements);
    },

    validateProcurementData(data) {
        if (!data.date) throw new Error('Vui lòng chọn ngày mua.');
        if (!data.productName || !data.productName.trim()) throw new Error('Tên sản phẩm không được để trống.');
        if (!data.quantity || parseInt(data.quantity) <= 0) throw new Error('Số lượng phải lớn hơn 0.');
        if (!data.price || parseFloat(data.price) <= 0) throw new Error('Giá thành phải lớn hơn 0.');
        if (!data.supplier || !data.supplier.trim()) throw new Error('Vui lòng điền nhà cung cấp.');
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    },

    getMonthsList() {
        const procurements = this.getProcurements();
        const months = new Set();
        
        // Add current month in case it's empty
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        months.add(currentMonth);

        procurements.forEach(p => {
            if (p.date) {
                months.add(p.date.slice(0, 7));
            }
        });

        return Array.from(months).sort((a, b) => b.localeCompare(a));
    },

    populateMonthFilter(selectElementId) {
        const select = document.getElementById(selectElementId);
        if (!select) return;

        const months = this.getMonthsList();
        let html = '';
        months.forEach(month => {
            const parts = month.split('-');
            html += `<option value="${month}">Tháng ${parts[1]}/${parts[0]}</option>`;
        });
        select.innerHTML = html;
    },

    renderProcurementPage(containerId, activeMonth) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const allProcurements = this.getProcurements();
        
        // Filter by month
        const filtered = allProcurements.filter(p => p.date && p.date.startsWith(activeMonth))
            .sort((a, b) => b.date.localeCompare(a.date));

        // Calculate Stats
        const totalItems = filtered.reduce((acc, curr) => acc + curr.quantity, 0);
        const totalSpending = filtered.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
        const uniqueSuppliers = new Set(filtered.map(p => p.supplier.toLowerCase().trim())).size;

        // Render Stats Summary Cards
        let html = `
            <div class="procure-summary">
                <div class="procure-stat-card">
                    <span class="text-sm-size text-muted font-semibold">TỔNG CHI TIÊU</span>
                    <span class="procure-stat-val mt-1">${this.formatCurrency(totalSpending)}</span>
                </div>
                <div class="procure-stat-card">
                    <span class="text-sm-size text-muted font-semibold">SỐ LƯỢNG MUA SẮM</span>
                    <span class="procure-stat-val mt-1">${totalItems} mặt hàng</span>
                </div>
                <div class="procure-stat-card">
                    <span class="text-sm-size text-muted font-semibold">NHÀ CUNG CẤP</span>
                    <span class="procure-stat-val mt-1">${uniqueSuppliers} đơn vị</span>
                </div>
            </div>
        `;

        if (filtered.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-icon">🛒</div>
                    <p>Chưa có mặt hàng mua sắm nào được ghi nhận trong tháng này.</p>
                </div>
            `;
            container.innerHTML = html;
            return;
        }

        // Render List Table
        html += `
            <!-- Desktop view table -->
            <div class="table-responsive desktop-view-only">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Ngày Mua</th>
                            <th>Tên Sản Phẩm / Thiết Bị</th>
                            <th class="text-center">Số Lượng</th>
                            <th class="text-right">Đơn Giá</th>
                            <th class="text-right">Thành Tiền</th>
                            <th>Nhà Cung Cấp</th>
                            <th class="text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        filtered.forEach(p => {
            const totalPrice = p.quantity * p.price;
            html += `
                <tr>
                    <td>${PersonnelManager.formatDate(p.date)}</td>
                    <td><span class="font-semibold">${p.productName}</span></td>
                    <td class="text-center">${p.quantity}</td>
                    <td class="text-right">${this.formatCurrency(p.price)}</td>
                    <td class="text-right font-semibold text-primary">${this.formatCurrency(totalPrice)}</td>
                    <td><span class="badge badge-dept">${p.supplier}</span></td>
                    <td class="text-right">
                        <div class="action-buttons">
                            <button class="btn btn-icon btn-primary btn-edit-proc" data-id="${p.id}" title="Sửa bản ghi">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                            </button>
                            <button class="btn btn-icon btn-danger btn-delete-proc" data-id="${p.id}" title="Xóa bản ghi">
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

            <!-- Mobile view cards -->
            <div class="mobile-view-only staff-mobile-cards">
        `;

        filtered.forEach(p => {
            const totalPrice = p.quantity * p.price;
            html += `
                <div class="mobile-card">
                    <div class="mobile-card-header" style="align-items: flex-start;">
                        <div class="mobile-card-title-section">
                            <h4 class="mobile-card-title">${p.productName}</h4>
                            <span class="mobile-card-subtitle">Ngày mua: ${PersonnelManager.formatDate(p.date)}</span>
                        </div>
                        <div style="font-weight: 700; color: var(--primary-color); font-size:14px;">
                            ${this.formatCurrency(totalPrice)}
                        </div>
                    </div>
                    <div class="mobile-card-body">
                        <div class="info-row">
                            <span class="info-label">Đơn giá:</span>
                            <span class="info-value">${this.formatCurrency(p.price)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Số lượng:</span>
                            <span class="info-value font-semibold">${p.quantity}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Nhà cung cấp:</span>
                            <span class="info-value text-muted font-medium">${p.supplier}</span>
                        </div>
                    </div>
                    <div class="mobile-card-footer">
                        <button class="btn btn-sm btn-outline-primary btn-edit-proc" data-id="${p.id}">Sửa</button>
                        <button class="btn btn-sm btn-outline-danger btn-delete-proc" data-id="${p.id}">Xóa</button>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;

        // Bind Edit buttons
        container.querySelectorAll('.btn-edit-proc').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                window.openProcurementModal?.(id);
            });
        });

        // Bind Delete buttons
        container.querySelectorAll('.btn-delete-proc').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const p = this.getProcurementById(id);
                if (confirm(`Bạn có chắc muốn xóa bản ghi mua sắm "${p.productName}" không?`)) {
                    this.deleteProcurement(id);
                    this.renderProcurementPage(containerId, activeMonth);
                    window.showToast?.('Xóa bản ghi mua sắm thành công!', 'success');
                    window.dispatchEvent(new CustomEvent('procurementsUpdated'));
                }
            });
        });
    }
};

window.ProcurementManager = ProcurementManager;
