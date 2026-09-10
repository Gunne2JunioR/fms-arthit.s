<?php
/**
 * Faculty Web Platform - Backend API (PHP/MySQL)
 * Subpath: /wp-content/meeting/api.php
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$host = 'localhost';
$user = '92hotel';
$pass = 'CqR6Z7Sxsn8zwQtJ';
$db   = '92hotel';

$mysqli = new mysqli($host, $user, $pass, $db);
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $mysqli->connect_error]);
    exit;
}
$mysqli->set_charset('utf8mb4');

// Initialize tables if not exists
$queries = [
    "CREATE TABLE IF NOT EXISTS fms_news (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        category_th VARCHAR(100) NOT NULL,
        category_en VARCHAR(100) NOT NULL,
        category_cn VARCHAR(100) NOT NULL,
        excerpt TEXT,
        content LONGTEXT,
        cover_image_url TEXT,
        is_pinned TINYINT(1) DEFAULT 0,
        view_count INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'PUBLISHED',
        published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS fms_staff (
        id VARCHAR(36) PRIMARY KEY,
        academic_title VARCHAR(100),
        first_name_th VARCHAR(100),
        last_name_th VARCHAR(100),
        first_name_en VARCHAR(100),
        last_name_en VARCHAR(100),
        department_th VARCHAR(100),
        department_en VARCHAR(100),
        department_cn VARCHAR(100),
        position VARCHAR(100),
        email VARCHAR(150),
        phone_ext VARCHAR(50),
        room_number VARCHAR(50),
        avatar_url TEXT,
        expertise TEXT,
        sort_order INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'ACTIVE'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS fms_programs (
        id VARCHAR(36) PRIMARY KEY,
        code VARCHAR(50) NOT NULL,
        name_th VARCHAR(200) NOT NULL,
        name_en VARCHAR(200) NOT NULL,
        name_cn VARCHAR(200) NOT NULL,
        degree_level VARCHAR(50),
        degree_name_th VARCHAR(150),
        degree_name_en VARCHAR(150),
        degree_name_cn VARCHAR(150),
        curriculum_year INT,
        total_credits INT,
        tuition_fee_semester DECIMAL(10,2),
        duration_years INT,
        description TEXT,
        status VARCHAR(50) DEFAULT 'OPEN_ADMISSION',
        brochure_file_url TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS fms_bookings (
        id VARCHAR(36) PRIMARY KEY,
        resource_id VARCHAR(100) NOT NULL,
        resource_name VARCHAR(150) NOT NULL,
        resource_type VARCHAR(20) NOT NULL,
        purpose VARCHAR(255) NOT NULL,
        attendees INT DEFAULT 1,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        requester_name VARCHAR(100) NOT NULL,
        requester_email VARCHAR(150),
        status VARCHAR(20) DEFAULT 'PENDING',
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS fms_documents (
        id VARCHAR(36) PRIMARY KEY,
        doc_number VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        doc_type VARCHAR(50) NOT NULL,
        urgency VARCHAR(20) DEFAULT 'NORMAL',
        requester_name VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        content TEXT,
        step INT DEFAULT 1,
        max_steps INT DEFAULT 2,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
];

foreach ($queries as $sql) {
    $mysqli->query($sql);
}

// Seed initial news if table is empty
$chkNews = $mysqli->query("SELECT COUNT(*) FROM fms_news")->fetch_row()[0];
if ($chkNews == 0) {
    $ins = $mysqli->prepare("INSERT INTO fms_news (id, title, slug, category, category_th, category_en, category_cn, excerpt, content, cover_image_url, is_pinned, view_count, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
    
    $newsList = [
        [
            'n1',
            'ขอแสดงความยินดีกับคณาจารย์และนักศึกษาที่ได้รับรางวัลนวัตกรรมดีเด่นระดับชาติ',
            'faculty-national-innovation-award-2026',
            'ACADEMIC', 'ข่าววิชาการและงานวิจัย', 'Academic & Research', '学术与科研',
            'ผลงานวิจัยและพัฒนานวัตกรรมปัญญาประดิษฐ์เพื่อการจัดการข้อมูลองค์กร ได้รับรางวัลชนะเลิศอันดับหนึ่งระดับประเทศ',
            'คณะขอแสดงความยินดีกับทีมคณาจารย์และนักศึกษาตัวแทนคณะ ที่สามารถคว้ารางวัลชนะเลิศการประกวดนวัตกรรมระดับชาติ ประจำปี 2569 สะท้อนศักยภาพความพร้อมในการบูรณาการเทคโนโลยีสารสนเทศระดับสูงเพื่อการพัฒนาสังคมอย่างยั่งยืน',
            'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop',
            1, 285, 'PUBLISHED'
        ],
        [
            'n2',
            'ยินดีต้อนรับนักศึกษาใหม่ ประจำปีการศึกษา 2569 สู่รั้วคณะ',
            'welcome-freshmen-academic-year-2026',
            'STUDENT_ACTIVITY', 'ข่าวกิจกรรมนักศึกษา', 'Student Activities', '学生活动',
            'คณะขอต้อนรับนักศึกษาใหม่ทุกท่าน เข้าร่วมกิจกรรมปฐมนิเทศและเตรียมความพร้อมก่อนเปิดภาคเรียน',
            'ยินดีต้อนรับนักศึกษาใหม่ทุกคนสู่ครอบครัวของเรา ขอให้นักศึกษาทุกคนเก็บเกี่ยวความรู้ ประสบการณ์ และมิตรภาพตลอดระยะเวลาการศึกษาอย่างเต็มที่',
            'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop',
            1, 142, 'PUBLISHED'
        ],
        [
            'n3',
            'เปิดรับสมัครบุคคลเข้าศึกษาต่อระดับปริญญาตรี รอบ Portfolio ประจำปี 2569',
            'tcas-admission-round-1',
            'ADMISSION', 'ข่าวรับสมัครนักศึกษา', 'Admission Announcements', '招生信息',
            'รับสมัครผู้มีความสามารถพิเศษและผลงานโดดเด่นเข้าศึกษาต่อ 4 สาขาวิชาหลัก ดูรายละเอียดคุณสมบัติและกำหนดการได้ที่นี่',
            'คณะเปิดรับสมัครนักเรียนชั้นมัธยมศึกษาปีที่ 6 หรือเทียบเท่า เข้าศึกษาต่อในหลักสูตรระดับปริญญาตรี ประจำปีการศึกษา 2569 ผู้สนใจสามารถยื่นเอกสารการสมัครผ่านระบบออนไลน์ได้ตั้งแต่วันนี้',
            'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000&auto=format&fit=crop',
            0, 98, 'PUBLISHED'
        ]
    ];

    foreach ($newsList as $row) {
        $ins->bind_param('ssssssssssiis', $row[0], $row[1], $row[2], $row[3], $row[4], $row[5], $row[6], $row[7], $row[8], $row[9], $row[10], $row[11], $row[12]);
        $ins->execute();
    }
}

// Seed initial staff if table is empty
$chkStaff = $mysqli->query("SELECT COUNT(*) FROM fms_staff")->fetch_row()[0];
if ($chkStaff == 0) {
    $ins = $mysqli->prepare("INSERT INTO fms_staff (id, academic_title, first_name_th, last_name_th, first_name_en, last_name_en, department_th, department_en, department_cn, position, email, phone_ext, room_number, avatar_url, expertise, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $staffList = [
        ['s1', 'ศ.ดร.', 'สมชาย', 'ใจดี', 'Somchai', 'Jaidee', 'สาขาวิชาวิทยาการคอมพิวเตอร์และสารสนเทศ', 'Computer Science & IT', '计算机与信息技术学系', 'คณบดี', 'somchai@faculty.ac.th', '1001', 'IT-401', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400', 'ปัญญาประดิษฐ์, วิทยาการข้อมูล, ระบบสารสนเทศองค์กร', 1, 'ACTIVE'],
        ['s2', 'รศ.ดร.', 'นารี', 'วิทยากร', 'Naree', 'Vittayakorn', 'สาขาวิชาบริหารธุรกิจและการจัดการ', 'Business Administration', '工商管理学系', 'รองคณบดีฝ่ายวิชาการ', 'naree@faculty.ac.th', '1002', 'IT-402', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400', 'การจัดการเชิงกลยุทธ์, การเงินธุรกิจ, นวัตกรรมองค์กร', 2, 'ACTIVE'],
        ['s3', 'ผศ.ดร.', 'อานนท์', 'รักเรียน', 'Arnon', 'Rakrean', 'สาขาวิชาวิศวกรรมซอฟต์แวร์', 'Software Engineering', '软件工程学系', 'หัวหน้าสาขาวิชา', 'arnon@faculty.ac.th', '1003', 'IT-405', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400', 'วิศวกรรมคลาวด์, สถาปัตยกรรมซอฟต์แวร์, DevSecOps', 3, 'ACTIVE']
    ];

    foreach ($staffList as $row) {
        $ins->bind_param('sssssssssssssssis', $row[0], $row[1], $row[2], $row[3], $row[4], $row[5], $row[6], $row[7], $row[8], $row[9], $row[10], $row[11], $row[12], $row[13], $row[14], $row[15], $row[16]);
        $ins->execute();
    }
}

// Seed initial programs if table is empty
$chkProg = $mysqli->query("SELECT COUNT(*) FROM fms_programs")->fetch_row()[0];
if ($chkProg == 0) {
    $ins = $mysqli->prepare("INSERT INTO fms_programs (id, code, name_th, name_en, name_cn, degree_level, degree_name_th, degree_name_en, degree_name_cn, curriculum_year, total_credits, tuition_fee_semester, duration_years, description, status, brochure_file_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $progList = [
        ['p1', 'CS-101', 'หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์', 'Bachelor of Science in Computer Science', '计算机科学理学学士', 'BACHELOR', 'วท.บ. (วิทยาการคอมพิวเตอร์)', 'B.Sc. (Computer Science)', '理学学士（计算机科学）', 2568, 128, 28000.00, 4, 'หลักสูตรเน้นการสร้างสรรค์นวัตกรรมซอฟต์แวร์ คลาวด์คอมพิวติ้ง และปัญญาประดิษฐ์เพื่อตอบโจทย์อุตสาหกรรมสากล', 'OPEN_ADMISSION', 'https://example.com/brochure-cs.pdf'],
        ['p2', 'IT-201', 'หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศและปัญญาประดิษฐ์', 'Bachelor of Science in Information Technology and AI', '信息技术与人工智能理学学士', 'BACHELOR', 'วท.บ. (เทคโนโลยีสารสนเทศและปัญญาประดิษฐ์)', 'B.Sc. (IT and AI)', '理学学士（信息技术与人工智能）', 2569, 130, 26000.00, 4, 'บูรณาการระบบสารสนเทศและการประยุกต์ใช้ AI ในภาคธุรกิจและองค์กรยุคใหม่', 'OPEN_ADMISSION', 'https://example.com/brochure-it.pdf'],
        ['p3', 'BA-301', 'หลักสูตรบริหารธุรกิจบัณฑิต สาขาวิชาการจัดการธุรกิจดิจิทัล', 'Bachelor of Business Administration in Digital Business', '数字商务工商管理学士', 'BACHELOR', 'บธ.บ. (การจัดการธุรกิจดิจิทัล)', 'B.B.A. (Digital Business Management)', '工商管理学士（数字商务管理）', 2567, 126, 25000.00, 4, 'สร้างนักบริหารยุคดิจิทัล ผสานกลยุทธ์การตลาดสมัยใหม่และเทคโนโลยีสารสนเทศ', 'OPEN_ADMISSION', 'https://example.com/brochure-ba.pdf']
    ];

    foreach ($progList as $row) {
        $ins->bind_param('sssssssssiidiss', $row[0], $row[1], $row[2], $row[3], $row[4], $row[5], $row[6], $row[7], $row[8], $row[9], $row[10], $row[11], $row[12], $row[13], $row[14], $row[15]);
        $ins->execute();
    }
}

// Seed initial bookings if empty
$chkBook = $mysqli->query("SELECT COUNT(*) FROM fms_bookings")->fetch_row()[0];
if ($chkBook == 0) {
    $ins = $mysqli->prepare("INSERT INTO fms_bookings (id, resource_id, resource_name, resource_type, purpose, attendees, start_time, end_time, requester_name, requester_email, status, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $bookList = [
        ['b1', 'room-1', 'ห้องประชุมปัญญานันทะ ชั้น 4', 'ROOM', 'ประชุมกรรมการพัฒนาหลักสูตรประจำปี', 15, date('Y-m-d 09:00:00', strtotime('+1 day')), date('Y-m-d 12:00:00', strtotime('+1 day')), 'ดร.สมชาย ใจดี', 'somchai@faculty.ac.th', 'CONFIRMED', 'ขอเตรียมโปรเจกเตอร์และเครื่องเสียง'],
        ['b2', 'van-1', 'รถตู้ส่วนกลาง ทะเบียน 1กข-9999', 'VEHICLE', 'นำนักศึกษาศึกษาดูงานศูนย์นวัตกรรม', 10, date('Y-m-d 08:30:00', strtotime('+2 days')), date('Y-m-d 16:30:00', strtotime('+2 days')), 'ผศ.ดร.อานนท์ รักเรียน', 'arnon@faculty.ac.th', 'PENDING', 'เดินทางไป-กลับ ชลบุรี']
    ];

    foreach ($bookList as $row) {
        $ins->bind_param('sssssissssss', $row[0], $row[1], $row[2], $row[3], $row[4], $row[5], $row[6], $row[7], $row[8], $row[9], $row[10], $row[11]);
        $ins->execute();
    }
}

// Routing
$action = $_GET['action'] ?? '';

if ($action === 'news') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $res = $mysqli->query("SELECT * FROM fms_news ORDER BY is_pinned DESC, published_at DESC");
        $data = [];
        while ($r = $res->fetch_assoc()) {
            $data[] = $r;
        }
        echo json_encode(['data' => $data]);
        exit;
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $id = uniqid('n_');
        $slug = $body['slug'] ?? ('news-' . time());
        $ins = $mysqli->prepare("INSERT INTO fms_news (id, title, slug, category, category_th, category_en, category_cn, excerpt, content, cover_image_url, is_pinned, view_count, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'PUBLISHED', NOW())");
        $catTh = $body['category_th'] ?? 'ข่าวสารทั่วไป';
        $catEn = $body['category_en'] ?? 'General News';
        $catCn = $body['category_cn'] ?? '通用新闻';
        $pinned = !empty($body['is_pinned']) ? 1 : 0;
        $ins->bind_param('ssssssssssi', $id, $body['title'], $slug, $body['category'], $catTh, $catEn, $catCn, $body['excerpt'], $body['content'], $body['cover_image_url'], $pinned);
        $ins->execute();
        echo json_encode(['success' => true, 'id' => $id]);
        exit;
    }
} elseif ($action === 'staff') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $res = $mysqli->query("SELECT * FROM fms_staff ORDER BY sort_order ASC, id ASC");
        $data = [];
        while ($r = $res->fetch_assoc()) {
            $data[] = $r;
        }
        echo json_encode(['data' => $data]);
        exit;
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $id = uniqid('s_');
        $ins = $mysqli->prepare("INSERT INTO fms_staff (id, academic_title, first_name_th, last_name_th, first_name_en, last_name_en, department_th, department_en, department_cn, position, email, phone_ext, room_number, avatar_url, expertise, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')");
        $sort = intval($body['sort_order'] ?? 99);
        $ins->bind_param('sssssssssssssssi', $id, $body['academic_title'], $body['first_name_th'], $body['last_name_th'], $body['first_name_en'], $body['last_name_en'], $body['department_th'], $body['department_en'], $body['department_cn'], $body['position'], $body['email'], $body['phone_ext'], $body['room_number'], $body['avatar_url'], $body['expertise'], $sort);
        $ins->execute();
        echo json_encode(['success' => true, 'id' => $id]);
        exit;
    }
} elseif ($action === 'programs') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $res = $mysqli->query("SELECT * FROM fms_programs ORDER BY id ASC");
        $data = [];
        while ($r = $res->fetch_assoc()) {
            $data[] = $r;
        }
        echo json_encode(['data' => $data]);
        exit;
    }
} elseif ($action === 'bookings') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $res = $mysqli->query("SELECT * FROM fms_bookings ORDER BY start_time DESC");
        $data = [];
        while ($r = $res->fetch_assoc()) {
            $data[] = $r;
        }
        echo json_encode(['data' => $data]);
        exit;
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $id = uniqid('b_');
        
        // Check conflict
        $chk = $mysqli->prepare("SELECT COUNT(*) FROM fms_bookings WHERE resource_id = ? AND status != 'CANCELLED' AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))");
        $chk->bind_param('sssss', $body['resource_id'], $body['start_time'], $body['start_time'], $body['end_time'], $body['end_time']);
        $chk->execute();
        if ($chk->get_result()->fetch_row()[0] > 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ห้องหรือยานพาหนะนี้มีผู้จองแล้วในช่วงเวลาดังกล่าว']);
            exit;
        }

        $ins = $mysqli->prepare("INSERT INTO fms_bookings (id, resource_id, resource_name, resource_type, purpose, attendees, start_time, end_time, requester_name, requester_email, status, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?)");
        $att = intval($body['attendees'] ?? 1);
        $ins->bind_param('sssssisssss', $id, $body['resource_id'], $body['resource_name'], $body['resource_type'], $body['purpose'], $att, $body['start_time'], $body['end_time'], $body['requester_name'], $body['requester_email'], $body['note']);
        $ins->execute();
        echo json_encode(['success' => true, 'id' => $id]);
        exit;
    }
} elseif ($action === 'documents') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $res = $mysqli->query("SELECT * FROM fms_documents ORDER BY created_at DESC");
        $data = [];
        while ($r = $res->fetch_assoc()) {
            $data[] = $r;
        }
        echo json_encode(['data' => $data]);
        exit;
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $id = uniqid('d_');
        $docNum = 'DOC-' . date('Ymd') . '-' . rand(100, 999);
        $ins = $mysqli->prepare("INSERT INTO fms_documents (id, doc_number, title, doc_type, urgency, requester_name, status, content, step, max_steps) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, 1, 2)");
        $ins->bind_param('sssssss', $id, $docNum, $body['title'], $body['doc_type'], $body['urgency'], $body['requester_name'], $body['content']);
        $ins->execute();
        echo json_encode(['success' => true, 'id' => $id, 'doc_number' => $docNum]);
        exit;
    }
} else {
    echo json_encode(['status' => 'online', 'message' => 'Faculty Web Platform API is running.']);
}
