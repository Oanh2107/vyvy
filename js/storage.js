// js/storage.js

const KEYS = {
    DEPARTMENTS: 'taskflow_departments',
    PERSONNEL: 'taskflow_personnel',
    TASKS: 'taskflow_tasks',
    PROCUREMENTS: 'taskflow_procurements',
    CONTRACT_TEMPLATE: 'taskflow_contract_template',
    THEME: 'taskflow_theme'
};

const MOCK_DEPARTMENTS = [
    { id: 'dept-1', name: 'Ban Giám Đốc' },
    { id: 'dept-2', name: 'Phòng Nhân Sự' },
    { id: 'dept-3', name: 'Phòng Kỹ Thuật' },
    { id: 'dept-4', name: 'Phòng Marketing' }
];

const MOCK_PERSONNEL = [
    {
        id: 'staff-1',
        name: 'Nguyễn Văn An',
        email: 'an.nguyen@company.com',
        phone: '0901234567',
        deptId: 'dept-3',
        role: 'Trưởng phòng Kỹ thuật',
        joinDate: '2024-01-15',
        contractDate: '2024-01-15',
        salary: 25000000,
        bhxh: '0123456789',
        status: 'active'
    },
    {
        id: 'staff-2',
        name: 'Trần Thị Bình',
        email: 'binh.tran@company.com',
        phone: '0912345678',
        deptId: 'dept-2',
        role: 'Chuyên viên Tuyển dụng',
        joinDate: '2024-03-01',
        contractDate: '2024-03-01',
        salary: 15000000,
        bhxh: '0987654321',
        status: 'active'
    },
    {
        id: 'staff-3',
        name: 'Phạm Văn Cường',
        email: 'cuong.pham@company.com',
        phone: '0923456789',
        deptId: 'dept-3',
        role: 'Lập trình viên Senior',
        joinDate: '2024-02-10',
        contractDate: '2024-02-10',
        salary: 22000000,
        bhxh: '0246813579',
        status: 'active'
    },
    {
        id: 'staff-4',
        name: 'Lê Thị Dung',
        email: 'dung.le@company.com',
        phone: '0934567890',
        deptId: 'dept-4',
        role: 'Chuyên viên Content',
        joinDate: '2024-05-15',
        contractDate: '2024-05-15',
        salary: 10000000,
        bhxh: '0135792468',
        status: 'probation'
    },
    {
        id: 'staff-5',
        name: 'Hoàng Văn Giang',
        email: 'giang.hoang@company.com',
        phone: '0945678901',
        deptId: 'dept-4',
        role: 'Thiết kế đồ họa',
        joinDate: '2025-11-20',
        contractDate: '2025-11-20',
        salary: 12000000,
        bhxh: '0909090909',
        status: 'active'
    }
];

const MOCK_TASKS = [
    {
        id: 'task-1',
        title: 'Nâng cấp giao diện WebApp',
        description: 'Nâng cấp giao diện người dùng sử dụng CSS hiện đại, tối ưu responsive trên di động và hỗ trợ Dark Mode.',
        assigneeId: 'staff-3',
        deptId: 'dept-3',
        priority: 'high',
        dueDate: '2026-06-15',
        status: 'in-progress'
    },
    {
        id: 'task-2',
        title: 'Tuyển dụng Lập trình viên React',
        description: 'Lên tin tuyển dụng, sàng lọc hồ sơ ứng viên và lên lịch phỏng vấn cho vị trí React Developer.',
        assigneeId: 'staff-2',
        deptId: 'dept-2',
        priority: 'medium',
        dueDate: '2026-06-10',
        status: 'todo'
    },
    {
        id: 'task-3',
        title: 'Thiết kế chiến dịch Marketing tháng 6',
        description: 'Lên kế hoạch chạy quảng cáo Facebook và Google Search cho sản phẩm mới ra mắt.',
        assigneeId: 'staff-4',
        deptId: 'dept-4',
        priority: 'high',
        dueDate: '2026-06-20',
        status: 'todo'
    },
    {
        id: 'task-4',
        title: 'Báo cáo tài chính quý 1',
        description: 'Tổng hợp doanh thu, chi phí và lợi nhuận của quý 1 năm 2026 gửi Ban giám đốc.',
        assigneeId: 'staff-1',
        deptId: 'dept-1',
        priority: 'high',
        dueDate: '2026-05-30',
        status: 'completed'
    },
    {
        id: 'task-5',
        title: 'Thiết kế Banner cho Website mới',
        description: 'Thiết kế banner trang chủ và các trang con cho đợt khuyến mãi sắp tới.',
        assigneeId: 'staff-5',
        deptId: 'dept-4',
        priority: 'low',
        dueDate: '2026-06-12',
        status: 'review'
    }
];

const MOCK_PROCUREMENTS = [
    { id: 'proc-1', date: '2026-05-10', productName: 'Máy tính xách tay Dell Vostro', quantity: 2, price: 17500000, supplier: 'Phong Vũ Computer' },
    { id: 'proc-2', date: '2026-05-12', productName: 'Bàn làm việc gỗ công nghiệp', quantity: 4, price: 1100000, supplier: 'Nội thất Hòa Phát' },
    { id: 'proc-3', date: '2026-05-15', productName: 'Giấy in A4 Double A 70gsm', quantity: 10, price: 82000, supplier: 'Văn phòng phẩm Hải Tiến' },
    { id: 'proc-4', date: '2026-06-01', productName: 'Máy in Canon LBP 2900', quantity: 1, price: 4450000, supplier: 'Siêu thị Điện máy Nguyễn Kim' },
    { id: 'proc-5', date: '2026-06-02', productName: 'Gói trà, cà phê & đường tháng 6', quantity: 1, price: 780000, supplier: 'Bách Hóa Xanh' },
    { id: 'proc-6', date: '2026-06-03', productName: 'Bút bi Thiên Long FO-03 (Hộp 20 cái)', quantity: 3, price: 95000, supplier: 'Nhà sách Nguyễn Văn Cừ' }
];

const DEFAULT_CONTRACT_TEMPLATE = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
------------------

HỢP ĐỒNG LAO ĐỘNG
Số: {ID_HD}/HĐLĐ

Hôm nay, ngày {NGAY_KY}, chúng tôi gồm:
1. NGƯỜI SỬ DỤNG LAO ĐỘNG (Bên A):
- Đại diện: Ông/Bà Giám Đốc
- Chức vụ: Giám Đốc đại diện doanh nghiệp
- Địa chỉ công ty: Tầng 10, Tòa nhà TF, Hà Nội

2. NGƯỜI LAO ĐỘNG (Bên B):
- Họ và tên: {HO_TEN}
- Số điện thoại: {DIEN_THOAI}
- Email: {EMAIL}

Hai bên thỏa thuận ký kết hợp đồng lao động này với các điều khoản sau:
Điều 1: Công việc và địa điểm làm việc
- Bộ phận công tác: {PHONG_BAN}
- Chức danh chuyên môn (Chức vụ): {CHUC_VU}
- Địa điểm làm việc: Văn phòng chính công ty hoặc theo điều động công việc.

Điều 2: Thời hạn hợp đồng
- Loại hợp đồng: Hợp đồng lao động xác định thời hạn (12 tháng)
- Ngày bắt đầu làm việc: {NGAY_VAO}
- Ngày ký hợp đồng: {NGAY_KY_HD}

Điều 3: Quyền lợi của Người lao động
- Mức lương chính: {MUC_LUONG}
- Mã số đóng BHXH: {BHXH}
- Thời gian làm việc: 8h/ngày, từ thứ Hai đến thứ Sáu hàng tuần.
- Quyền lợi khác: Hưởng chế độ bảo hiểm, phép năm và phúc lợi theo Luật lao động.

Hợp đồng này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản để thực hiện.

          ĐẠI DIỆN BÊN A                                   BÊN B
           (Ký, ghi rõ họ tên)                       (Ký, ghi rõ họ tên)`;

const StorageManager = {
    init() {
        if (!localStorage.getItem(KEYS.DEPARTMENTS)) {
            localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(MOCK_DEPARTMENTS));
        }
        if (!localStorage.getItem(KEYS.PERSONNEL)) {
            localStorage.setItem(KEYS.PERSONNEL, JSON.stringify(MOCK_PERSONNEL));
        }
        if (!localStorage.getItem(KEYS.TASKS)) {
            localStorage.setItem(KEYS.TASKS, JSON.stringify(MOCK_TASKS));
        }
        if (!localStorage.getItem(KEYS.PROCUREMENTS)) {
            localStorage.setItem(KEYS.PROCUREMENTS, JSON.stringify(MOCK_PROCUREMENTS));
        }
        if (!localStorage.getItem(KEYS.CONTRACT_TEMPLATE)) {
            localStorage.setItem(KEYS.CONTRACT_TEMPLATE, DEFAULT_CONTRACT_TEMPLATE);
        }
        if (!localStorage.getItem(KEYS.THEME)) {
            localStorage.setItem(KEYS.THEME, 'light');
        }
    },

    getDepartments() {
        return JSON.parse(localStorage.getItem(KEYS.DEPARTMENTS)) || [];
    },

    saveDepartments(departments) {
        localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(departments));
        window.dispatchEvent(new CustomEvent('departmentsUpdated'));
    },

    getPersonnel() {
        return JSON.parse(localStorage.getItem(KEYS.PERSONNEL)) || [];
    },

    savePersonnel(personnel) {
        localStorage.setItem(KEYS.PERSONNEL, JSON.stringify(personnel));
        window.dispatchEvent(new CustomEvent('personnelUpdated'));
    },

    getTasks() {
        return JSON.parse(localStorage.getItem(KEYS.TASKS)) || [];
    },

    saveTasks(tasks) {
        localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
        window.dispatchEvent(new CustomEvent('tasksUpdated'));
    },

    getProcurements() {
        return JSON.parse(localStorage.getItem(KEYS.PROCUREMENTS)) || [];
    },

    saveProcurements(procurements) {
        localStorage.setItem(KEYS.PROCUREMENTS, JSON.stringify(procurements));
        window.dispatchEvent(new CustomEvent('procurementsUpdated'));
    },

    getContractTemplate() {
        return localStorage.getItem(KEYS.CONTRACT_TEMPLATE) || DEFAULT_CONTRACT_TEMPLATE;
    },

    saveContractTemplate(template) {
        localStorage.setItem(KEYS.CONTRACT_TEMPLATE, template);
        window.dispatchEvent(new CustomEvent('contractTemplateUpdated'));
    },

    getTheme() {
        return localStorage.getItem(KEYS.THEME) || 'light';
    },

    saveTheme(theme) {
        localStorage.setItem(KEYS.THEME, theme);
    },

    exportData() {
        const data = {
            departments: this.getDepartments(),
            personnel: this.getPersonnel(),
            tasks: this.getTasks(),
            procurements: this.getProcurements(),
            contractTemplate: this.getContractTemplate()
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `taskflow_backup_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    },

    importData(file, callback) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsedData = JSON.parse(event.target.result);
                if (parsedData.departments && parsedData.personnel && parsedData.tasks) {
                    this.saveDepartments(parsedData.departments);
                    this.savePersonnel(parsedData.personnel);
                    this.saveTasks(parsedData.tasks);
                    if (parsedData.procurements) {
                        this.saveProcurements(parsedData.procurements);
                    }
                    if (parsedData.contractTemplate) {
                        this.saveContractTemplate(parsedData.contractTemplate);
                    }
                    if (callback) callback(true, 'Nhập dữ liệu thành công!');
                } else {
                    if (callback) callback(false, 'Định dạng file không đúng cấu trúc TaskFlow!');
                }
            } catch (e) {
                if (callback) callback(false, 'File không hợp lệ hoặc bị lỗi!');
            }
        };
        reader.readAsText(file);
    },

    clearAll() {
        localStorage.removeItem(KEYS.DEPARTMENTS);
        localStorage.removeItem(KEYS.PERSONNEL);
        localStorage.removeItem(KEYS.TASKS);
        localStorage.removeItem(KEYS.PROCUREMENTS);
        localStorage.removeItem(KEYS.CONTRACT_TEMPLATE);
        this.init();
        window.dispatchEvent(new CustomEvent('dataCleared'));
    }
};

// Khởi tạo ngay lập tức
StorageManager.init();
window.StorageManager = StorageManager;
