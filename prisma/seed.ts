import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedCore, seedUser } from "./lib/seed-core";
import { requireDatabaseUrl } from "./lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

/** รหัสผ่านทุกบัญชีตัวอย่าง */
export const DEV_PASSWORD = "Passw0rd!vibe";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PROD !== "1") {
    console.error("[seed] ปฏิเสธ: NODE_ENV=production — ใช้ npm run db:bootstrap แทน");
    process.exit(1);
  }
  const core = await seedCore(prisma, { tenantCode: "DEMO", nameTh: "องค์กรตัวอย่าง", nameEn: "Sample Organization" });
  const hash = await bcrypt.hash(DEV_PASSWORD, 12);
  const sriparatHash = await bcrypt.hash("11111111", 12);
  const users = [
    { email: "admin@app.local", name: "ผู้ดูแลสูงสุด", roles: ["SUPER_ADMIN"], passwordHash: hash },
    { email: "sriparat@app.local", name: "Sriparat (Super Admin)", roles: ["SUPER_ADMIN"], passwordHash: sriparatHash },
    { email: "staff@app.local", name: "เจ้าหน้าที่", roles: ["STAFF"], passwordHash: hash },
    { email: "viewer@app.local", name: "ผู้ดู", roles: ["VIEWER"], passwordHash: hash },
    { email: "lockme@app.local", name: "บัญชีทดสอบล็อก", roles: ["VIEWER"], passwordHash: hash },
    { email: "forced@app.local", name: "บัญชีบังคับเปลี่ยนรหัส", roles: ["VIEWER"], passwordHash: hash, mustChangePassword: true },
  ];
  for (const u of users) {
    await seedUser(prisma, core.tenantId, {
      email: u.email,
      name: u.name,
      passwordHash: u.passwordHash,
      roleIds: u.roles.map((c) => core.roleIds[c]),
      mustChangePassword: u.mustChangePassword,
    });
  }

  // Seed หมวดหมู่ข่าวสาร
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@app.local" } });
  if (adminUser) {
    const categories = [
      { slug: "academic", nameTh: "ข่าววิชาการและงานวิจัย", nameEn: "Academic & Research" },
      { slug: "activity", nameTh: "ข่าวกิจกรรมนักศึกษา", nameEn: "Student Activities" },
      { slug: "admission", nameTh: "ข่าวรับสมัครนักศึกษา", nameEn: "Admissions" },
      { slug: "announcement", nameTh: "ประกาศทั่วไป", nameEn: "Announcements" },
    ];

    const catMap: Record<string, string> = {};
    for (const cat of categories) {
      const c = await prisma.articleCategory.upsert({
        where: { tenantId_slug: { tenantId: core.tenantId, slug: cat.slug } },
        update: { nameTh: cat.nameTh, nameEn: cat.nameEn },
        create: { tenantId: core.tenantId, slug: cat.slug, nameTh: cat.nameTh, nameEn: cat.nameEn },
      });
      catMap[cat.slug] = c.id;
    }

    // Seed ข่าวตัวอย่าง
    const sampleArticles = [
      {
        slug: "welcome-freshmen-2026",
        title: "ยินดีต้อนรับนักศึกษาใหม่ ประจำปีการศึกษา 2569 สู่รั้วคณะ",
        excerpt: "คณะขอต้อนรับนักศึกษาใหม่ทุกท่าน เข้าร่วมกิจกรรมปฐมนิเทศและเตรียมความพร้อมก่อนเปิดภาคเรียน",
        content: "คณะขอแสดงความยินดีและต้อนรับนักศึกษาใหม่ทุกท่านเข้าสู่ครอบครัวของเรา กิจกรรมปฐมนิเทศจะจัดขึ้นในวันที่ 15 มิถุนายน ณ หอประชุมใหญ่ โดยนักศึกษาจะได้พบปะคณาจารย์และรับฟังคำแนะนำการใช้ชีวิตในรั้วมหาวิทยาลัย ขอให้นักศึกษาเตรียมความพร้อมและปฏิบัติตามคำแนะนำของทางคณะอย่างเคร่งครัด",
        coverImageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop",
        categoryId: catMap["activity"],
        status: "PUBLISHED" as const,
        isPinned: true,
        publishedAt: new Date(),
      },
      {
        slug: "ai-research-breakthrough-2026",
        title: "คณาจารย์คณะคว้าทุนวิจัยระดับนานาชาติ ด้านปัญญาประดิษฐ์ทางการแพทย์",
        excerpt: "ผลงานวิจัยนวัตกรรมโมเดลตรวจจับความผิดปกติของภาพถ่ายทางการแพทย์ ได้รับคัดเลือกตีพิมพ์ในวารสารชั้นนำระดับโลก",
        content: "ทีมวิจัยประจำคณะนำโดย รศ.ดร. ได้รับทุนสนับสนุนงานวิจัยต่อยอดนวัตกรรมปัญญาประดิษฐ์เพื่อช่วยวินิจฉัยโรค โดยโมเดลนี้มีความแม่นยำสูงและเตรียมนำไปทดสอบใช้งานจริงในโรงพยาบาลพันธมิตร เพื่อประโยชน์ต่อวงการสาธารณสุขของประเทศ",
        coverImageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop",
        categoryId: catMap["academic"],
        status: "PUBLISHED" as const,
        isPinned: true,
        publishedAt: new Date(),
      },
      {
        slug: "tcas-admission-round-1",
        title: "เปิดรับสมัครบุคคลเข้าศึกษาต่อระดับปริญญาตรี รอบ Portfolio ประจำปี 2569",
        excerpt: "รับสมัครผู้มีความสามารถพิเศษและผลงานโดดเด่นเข้าศึกษาต่อ 4 สาขาวิชาหลัก ดูรายละเอียดคุณสมบัติและกำหนดการได้ที่นี่",
        content: "ทางคณะเปิดรับสมัครนักเรียนชั้นมัธยมศึกษาปีที่ 6 หรือเทียบเท่า เข้าศึกษาต่อในหลักสูตรวิทยาศาสตรบัณฑิต ประจำปีการศึกษา 2569 ผ่านระบบ TCAS รอบที่ 1 Portfolio ผู้สนใจสามารถยื่นเอกสารและสมัครออนไลน์ได้ตั้งแต่วันนี้ถึงสิ้นเดือน",
        coverImageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000&auto=format&fit=crop",
        categoryId: catMap["admission"],
        status: "PUBLISHED" as const,
        isPinned: false,
        publishedAt: new Date(),
      },
    ];

    for (const art of sampleArticles) {
      await prisma.article.upsert({
        where: { tenantId_slug: { tenantId: core.tenantId, slug: art.slug } },
        update: {
          title: art.title,
          excerpt: art.excerpt,
          content: art.content,
          coverImageUrl: art.coverImageUrl,
          status: art.status,
          isPinned: art.isPinned,
          publishedAt: art.publishedAt,
        },
        create: {
          tenantId: core.tenantId,
          categoryId: art.categoryId,
          authorId: adminUser.id,
          title: art.title,
          slug: art.slug,
          excerpt: art.excerpt,
          content: art.content,
          coverImageUrl: art.coverImageUrl,
          status: art.status,
          isPinned: art.isPinned,
          publishedAt: art.publishedAt,
        },
      });
    }

    // ── Seed ภาควิชาและบุคลากร ──────────────────────────────────────
    const depts = [
      { code: "CS", nameTh: "สาขาวิชาวิทยาการคอมพิวเตอร์", nameEn: "Department of Computer Science" },
      { code: "IT", nameTh: "สาขาวิชาเทคโนโลยีสารสนเทศ", nameEn: "Department of Information Technology" },
      { code: "BA", nameTh: "สาขาวิชาการจัดการธุรกิจดิจิทัล", nameEn: "Department of Digital Business Management" },
    ];
    const deptMap: Record<string, string> = {};
    for (const d of depts) {
      const row = await prisma.department.upsert({
        where: { tenantId_code: { tenantId: core.tenantId, code: d.code } },
        update: { nameTh: d.nameTh, nameEn: d.nameEn },
        create: { tenantId: core.tenantId, code: d.code, nameTh: d.nameTh, nameEn: d.nameEn },
      });
      deptMap[d.code] = row.id;
    }

    const sampleStaff = [
      {
        departmentId: deptMap["CS"],
        academicTitleTh: "รองศาสตราจารย์ ดร.",
        academicTitleEn: "Assoc. Prof. Dr.",
        firstNameTh: "สมชาย",
        firstNameEn: "Somchai",
        lastNameTh: "ใจดี",
        lastNameEn: "Jaidee",
        positionTh: "คณบดีประจำคณะ",
        positionEn: "Dean of the Faculty",
        email: "somchai.j@faculty.university.ac.th",
        phoneExt: "1001",
        roomNumber: "401",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
        biography: "ผู้เชี่ยวชาญด้านปัญญาประดิษฐ์ การประมวลผลภาษาธรรมชาติ และการวิเคราะห์ข้อมูลขนาดใหญ่",
        expertise: ["Artificial Intelligence", "Natural Language Processing", "Big Data Analytics"],
        education: ["Ph.D. in Computer Science, Carnegie Mellon University", "วท.บ. วิทยาการคอมพิวเตอร์ (เกียรตินิยมอันดับ 1)"],
        sortOrder: 1,
      },
      {
        departmentId: deptMap["IT"],
        academicTitleTh: "ผู้ช่วยศาสตราจารย์ ดร.",
        academicTitleEn: "Asst. Prof. Dr.",
        firstNameTh: "กานดา",
        firstNameEn: "Kanda",
        lastNameTh: "วงศ์สุวรรณ",
        lastNameEn: "Wongsuwan",
        positionTh: "รองคณบดีฝ่ายวิชาการและวิจัย",
        positionEn: "Associate Dean for Academic & Research Affairs",
        email: "kanda.w@faculty.university.ac.th",
        phoneExt: "1002",
        roomNumber: "402",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
        biography: "เชี่ยวชาญด้านระบบคลาวด์คอมพิวติ้ง สถาปัตยกรรมไมโครเซอร์วิส และความมั่นคงปลอดภัยสารสนเทศ",
        expertise: ["Cloud Computing", "Cybersecurity", "Software Architecture"],
        education: ["Ph.D. in Information Technology, Tokyo Institute of Technology", "วท.ม. เทคโนโลยีสารสนเทศ"],
        sortOrder: 2,
      },
      {
        departmentId: deptMap["CS"],
        academicTitleTh: "อาจารย์ ดร.",
        academicTitleEn: "Dr.",
        firstNameTh: "วิชัย",
        firstNameEn: "Wichai",
        lastNameTh: "พงษ์ศิริ",
        lastNameEn: "Pongsiri",
        positionTh: "หัวหน้าสาขาวิชาวิทยาการคอมพิวเตอร์",
        positionEn: "Head of Computer Science Department",
        email: "wichai.p@faculty.university.ac.th",
        phoneExt: "1005",
        roomNumber: "501",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
        biography: "เชี่ยวชาญด้านโครงสร้างข้อมูล การออกแบบอัลกอริทึม และวิศวกรรมซอฟต์แวร์ระดับองค์กร",
        expertise: ["Software Engineering", "Full-stack Development", "Algorithms"],
        education: ["Ph.D. in Computer Engineering, Chulalongkorn University"],
        sortOrder: 3,
      },
    ];

    for (const s of sampleStaff) {
      const existing = await prisma.staffProfile.findFirst({
        where: { tenantId: core.tenantId, email: s.email },
      });
      if (existing) {
        await prisma.staffProfile.update({ where: { id: existing.id }, data: s });
      } else {
        await prisma.staffProfile.create({ data: { tenantId: core.tenantId, ...s } });
      }
    }

    // ── Seed หลักสูตร ──────────────────────────────────────────────
    const samplePrograms = [
      {
        code: "CS-BSc-65",
        nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์และปัญญาประดิษฐ์",
        nameEn: "Bachelor of Science in Computer Science and Artificial Intelligence",
        degreeLevel: "BACHELOR" as const,
        degreeNameTh: "วิทยาศาสตรบัณฑิต (วท.บ.)",
        degreeNameEn: "Bachelor of Science (B.Sc.)",
        curriculumYear: 2565,
        totalCredits: 128,
        tuitionFeeSemester: 21000,
        durationYears: 4,
        description: "มุ่งเน้นการพัฒนาระบบซอฟต์แวร์ระดับองค์กร ปัญญาประดิษฐ์ (AI) วิทยาการข้อมูล และความมั่นคงปลอดภัยไซเบอร์",
        status: "OPEN_ADMISSION" as const,
      },
      {
        code: "IT-BSc-65",
        nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล",
        nameEn: "Bachelor of Science in Information Technology and Digital Innovation",
        degreeLevel: "BACHELOR" as const,
        degreeNameTh: "วิทยาศาสตรบัณฑิต (วท.บ.)",
        degreeNameEn: "Bachelor of Science (B.Sc.)",
        curriculumYear: 2565,
        totalCredits: 126,
        tuitionFeeSemester: 19500,
        durationYears: 4,
        description: "สร้างผู้เชี่ยวชาญด้าน Cloud Architecture, DevOps, การจัดการโครงสร้างพื้นฐานดิจิทัล และการพัฒนาเว็บแอปพลิเคชันสมัยใหม่",
        status: "OPEN_ADMISSION" as const,
      },
      {
        code: "BA-BBA-65",
        nameTh: "หลักสูตรบริหารธุรกิจบัณฑิต สาขาวิชาการจัดการธุรกิจดิจิทัลและการตลาดสมัยใหม่",
        nameEn: "Bachelor of Business Administration in Digital Business Management",
        degreeLevel: "BACHELOR" as const,
        degreeNameTh: "บริหารธุรกิจบัณฑิต (บธ.บ.)",
        degreeNameEn: "Bachelor of Business Administration (B.B.A.)",
        curriculumYear: 2565,
        totalCredits: 130,
        tuitionFeeSemester: 18000,
        durationYears: 4,
        description: "บูรณาการทักษะการบริหารจัดการธุรกิจ ยุคดิจิทัล E-Commerce การวิเคราะห์ข้อมูลผู้บริโภค และการเป็นผู้ประกอบการสตาร์ทอัพ",
        status: "ACTIVE" as const,
      },
    ];

    for (const p of samplePrograms) {
      await prisma.program.upsert({
        where: { tenantId_code: { tenantId: core.tenantId, code: p.code } },
        update: p,
        create: { tenantId: core.tenantId, ...p },
      });
    }

    // ── Seed ห้องประชุมและยานพาหนะ ──────────────────────────────────
    const sampleFacilities = [
      {
        nameTh: "ห้องประชุมสัมมนาใหญ่ (Auditorium 501)",
        nameEn: "Main Auditorium 501",
        type: "ROOM" as const,
        capacity: 80,
        location: "ชั้น 5 อาคารบริหารและปฏิบัติการ",
        amenities: ["Projector 4K", "Video Conference System", "Wireless Mics (4)", "Stage Lighting"],
        photoUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop",
        requiresApproval: true,
      },
      {
        nameTh: "ห้องประชุมย่อย 302 (Executive Boardroom)",
        nameEn: "Meeting Room 302",
        type: "ROOM" as const,
        capacity: 15,
        location: "ชั้น 3 อาคารบริหาร",
        amenities: ["Smart TV 75\"", "Jabra Speakerphone", "Whiteboard"],
        photoUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop",
        requiresApproval: false,
      },
      {
        nameTh: "รถตู้ส่วนกลางคณะ (Toyota Commuter ทะเบียน ฮภ-9999)",
        nameEn: "Faculty Van 1 (Lic: 9999)",
        type: "VEHICLE" as const,
        capacity: 11,
        location: "ลานจอดรถอาคารบริหาร",
        amenities: ["คนขับรถประจำคณะ", "GPS Tracker", "Dashcam"],
        photoUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop",
        requiresApproval: true,
      },
    ];

    for (const f of sampleFacilities) {
      const existing = await prisma.facilityResource.findFirst({
        where: { tenantId: core.tenantId, nameTh: f.nameTh },
      });
      if (existing) {
        await prisma.facilityResource.update({ where: { id: existing.id }, data: f });
      } else {
        await prisma.facilityResource.create({ data: { tenantId: core.tenantId, ...f } });
      }
    }

    // ── Seed เอกสารคำขอและขั้นตอนอนุมัติ ──────────────────────────────
    const sampleDocs = [
      {
        docNumber: "MEMO-2026/001",
        docType: "MEMO_INTERNAL" as const,
        title: "ขออนุมัติจัดโครงการสัมมนาเชิงปฏิบัติการปัญญาประดิษฐ์สำหรับนักศึกษา",
        description: "จัดอบรมเชิงปฏิบัติการ Generative AI & Machine Learning เพื่อเตรียมความพร้อมนักศึกษาเข้าสู่ตลาดแรงงานสากล งบประมาณรวม 45,000 บาท",
        urgency: "NORMAL" as const,
        currentStep: 2,
        totalSteps: 3,
        status: "PENDING_REVIEW" as const,
      },
      {
        docNumber: "PR-2026/012",
        docType: "PURCHASE_REQUEST" as const,
        title: "ขออนุมัติจัดซื้อชุดคอมพิวเตอร์สำหรับห้องปฏิบัติการวิจัย AI",
        description: "จัดซื้อเครื่อง Workstation พร้อมการ์ดจอประมวลผลประสิทธิภาพสูงจำนวน 5 เครื่อง สำหรับรองรับงานวิจัยนิสิตระดับบัณฑิตศึกษา",
        urgency: "URGENT" as const,
        currentStep: 1,
        totalSteps: 2,
        status: "APPROVED" as const,
      },
    ];

    for (const doc of sampleDocs) {
      const existing = await prisma.documentRequest.findUnique({
        where: { tenantId_docNumber: { tenantId: core.tenantId, docNumber: doc.docNumber } },
      });
      if (!existing) {
        const created = await prisma.documentRequest.create({
          data: {
            tenantId: core.tenantId,
            requesterId: adminUser.id,
            ...doc,
          },
        });

        // Add approval steps
        await prisma.documentApprovalStep.createMany({
          data: [
            {
              documentRequestId: created.id,
              stepOrder: 1,
              approverTitle: "หัวหน้าสาขาวิชา",
              approverUserId: adminUser.id,
              status: "APPROVED",
              comment: "เห็นชอบในหลักการและงบประมาณ",
              actedAt: new Date(),
            },
            {
              documentRequestId: created.id,
              stepOrder: 2,
              approverTitle: "รองคณบดีฝ่ายวิชาการและวิจัย",
              status: doc.status === "APPROVED" ? "APPROVED" : "PENDING",
              comment: doc.status === "APPROVED" ? "อนุมัติเรียบร้อย" : null,
              actedAt: doc.status === "APPROVED" ? new Date() : null,
            },
          ],
        });
      }
    }
  }

  console.log(`[seed] เสร็จ — login: admin@app.local / ${DEV_PASSWORD}`);
}

main().finally(() => prisma.$disconnect());
