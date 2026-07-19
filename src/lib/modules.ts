import {
  LayoutDashboard, Building2, School, Users, UserPlus, IdCard, Users2, GraduationCap,
  UserCheck, ClipboardCheck, BookOpen, Calendar, BookMarked, FileText, ClipboardList,
  Monitor, Wallet, Calculator, Banknote, Bus, BedDouble, Library, Package, Stethoscope,
  MessageSquare, PartyPopper, CalendarClock, Contact, Phone, Award, BarChart3, Sparkles,
  Smartphone, FolderLock, Bell, ShieldCheck, Plug, Globe2, CreditCard, Settings,
  type LucideIcon,
} from "lucide-react";

export interface ModuleDef {
  slug: string;
  no: number;
  title: { en: string; bn: string };
  desc: { en: string; bn: string };
  icon: LucideIcon;
  group: string;
  features: string[];
}

export const groups = [
  { key: "core", en: "Core", bn: "কোর" },
  { key: "people", en: "People", bn: "মানুষ" },
  { key: "academic", en: "Academic", bn: "একাডেমিক" },
  { key: "finance", en: "Finance", bn: "অর্থ" },
  { key: "operations", en: "Operations", bn: "অপারেশন" },
  { key: "engagement", en: "Engagement", bn: "এনগেজমেন্ট" },
  { key: "insight", en: "Insight & AI", bn: "ইনসাইট ও এআই" },
  { key: "platform", en: "Platform", bn: "প্ল্যাটফর্ম" },
] as const;

export const modules: ModuleDef[] = [
  { slug: "dashboard", no: 1, group: "core", icon: LayoutDashboard,
    title: { en: "Dashboard", bn: "ড্যাশবোর্ড" },
    desc: { en: "Executive command center with live KPIs and alerts.", bn: "লাইভ কেপিআই ও অ্যালার্টসহ এক্সিকিউটিভ কমান্ড সেন্টার।" },
    features: ["Total Students","Total Teachers","Total Staff","Active Classes","Today's Attendance","New Admissions","Pending Fees","Today's Revenue","Monthly Income","Expenses","Profit","Birthday Alerts","Notifications","Upcoming Exams","School Bus Status","Document Expiry","Quick Actions"] },

  { slug: "multi-school", no: 2, group: "platform", icon: Building2,
    title: { en: "Multi School (Super Admin)", bn: "মাল্টি-স্কুল (সুপার অ্যাডমিন)" },
    desc: { en: "Manage multiple schools, branches, and campuses from one console.", bn: "একটি কনসোল থেকে একাধিক স্কুল, শাখা ও ক্যাম্পাস পরিচালনা।" },
    features: ["Multi School","Multi Branch","Multi Campus","Independent Database","Subscription Management","Billing","License","White Label","Theme","Logo","Domain / Subdomain"] },

  { slug: "school-setup", no: 3, group: "core", icon: School,
    title: { en: "School Setup", bn: "স্কুল সেটআপ" },
    desc: { en: "Define academic year, grades, sections, subjects and timing.", bn: "একাডেমিক বছর, গ্রেড, সেকশন, বিষয় ও সময় নির্ধারণ।" },
    features: ["Academic Year","Semester","Grade","Section","Subject","Stream","Department","Class Room","School Information","School Timing","School Calendar"] },

  { slug: "users-roles", no: 4, group: "core", icon: Users,
    title: { en: "User & Role Management", bn: "ইউজার ও রোল ম্যানেজমেন্ট" },
    desc: { en: "Permission-based access for every role from Super Admin to Security.", bn: "সুপার অ্যাডমিন থেকে সিকিউরিটি — সব রোলের জন্য পারমিশন-ভিত্তিক অ্যাক্সেস।" },
    features: ["Super Admin","School Admin","Principal","Vice Principal","Accountant","HR","Teacher","Parent","Student","Librarian","Driver","Receptionist","Security","Permission Based Access Control"] },

  { slug: "admission", no: 5, group: "people", icon: UserPlus,
    title: { en: "Student Admission", bn: "শিক্ষার্থী ভর্তি" },
    desc: { en: "End-to-end online admission workflow with document upload and approval.", bn: "ডকুমেন্ট আপলোড ও অনুমোদনসহ সম্পূর্ণ অনলাইন ভর্তি প্রক্রিয়া।" },
    features: ["Online Admission","Admission Workflow","Document Upload","Passport","QID","Birth Certificate","Previous School","Interview","Admission Approval","Student ID Generation"] },

  { slug: "sis", no: 6, group: "people", icon: IdCard,
    title: { en: "Student Information System", bn: "শিক্ষার্থী তথ্য ব্যবস্থা" },
    desc: { en: "360° student profile — identity, medical, guardian, transport, hostel.", bn: "৩৬০° শিক্ষার্থী প্রোফাইল — পরিচয়, মেডিকেল, অভিভাবক, ট্রান্সপোর্ট, হোস্টেল।" },
    features: ["Student Profile","Photo","QR Code","Student ID","Passport","QID","Nationality","Religion","Address","Parent","Guardian","Medical","Allergies","Vaccination","Previous School","Transport","Hostel"] },

  { slug: "parent-portal", no: 7, group: "engagement", icon: Users2,
    title: { en: "Parent Portal", bn: "প্যারেন্ট পোর্টাল" },
    desc: { en: "One place for parents to track their child's school life.", bn: "শিক্ষার্থীর সব তথ্য এক পোর্টালে অভিভাবকের জন্য।" },
    features: ["Child Information","Attendance","Homework","Assignment","Fees","Result","Timetable","Notices","Chat","Leave","Transport Tracking"] },

  { slug: "teacher-portal", no: 8, group: "engagement", icon: GraduationCap,
    title: { en: "Teacher Portal", bn: "টিচার পোর্টাল" },
    desc: { en: "Everything teachers need — classes, plans, marks, communication.", bn: "শিক্ষকদের প্রয়োজনীয় সব — ক্লাস, প্ল্যান, নম্বর, যোগাযোগ।" },
    features: ["My Classes","Attendance","Lesson Plan","Homework","Assignment","Marks Entry","Exam","Student Notes","Communication"] },

  { slug: "hr", no: 9, group: "people", icon: UserCheck,
    title: { en: "Employee / HR", bn: "কর্মচারী / এইচআর" },
    desc: { en: "Recruitment to EOS — full employee lifecycle for GCC compliance.", bn: "নিয়োগ থেকে ইওএস — জিসিসি কমপ্লায়েন্স সহ পূর্ণ কর্মচারী জীবনচক্র।" },
    features: ["Staff Profile","Recruitment","Joining","Contract","Payroll","Leave","Overtime","Attendance","Passport","QID","Visa","Medical","EOS Settlement"] },

  { slug: "attendance", no: 10, group: "operations", icon: ClipboardCheck,
    title: { en: "Attendance", bn: "উপস্থিতি" },
    desc: { en: "QR, RFID, fingerprint, face and GPS attendance for all roles.", bn: "সব রোলের জন্য কিউআর, আরএফআইডি, ফিঙ্গারপ্রিন্ট, ফেস ও জিপিএস উপস্থিতি।" },
    features: ["Student","Teacher","Staff","Support","QR Code","RFID","Fingerprint","Face Recognition","GPS Attendance"] },

  { slug: "academic", no: 11, group: "academic", icon: BookOpen,
    title: { en: "Academic Management", bn: "একাডেমিক ম্যানেজমেন্ট" },
    desc: { en: "Curriculum, syllabus and allocation across the academic calendar.", bn: "একাডেমিক ক্যালেন্ডার জুড়ে কারিকুলাম, সিলেবাস ও বরাদ্দ।" },
    features: ["Curriculum","Syllabus","Subject Allocation","Class Allocation","Teacher Allocation","Lesson Plan","Academic Calendar"] },

  { slug: "timetable", no: 12, group: "academic", icon: Calendar,
    title: { en: "Timetable", bn: "রুটিন" },
    desc: { en: "AI-generated timetables with automatic conflict detection.", bn: "স্বয়ংক্রিয় দ্বন্দ্ব সনাক্তকরণ সহ এআই-জেনারেটেড রুটিন।" },
    features: ["AI Timetable","Teacher Availability","Classroom Availability","Automatic Conflict Detection"] },

  { slug: "homework", no: 13, group: "academic", icon: BookMarked,
    title: { en: "Homework", bn: "হোমওয়ার্ক" },
    desc: { en: "Assign, collect and review homework with attachments.", bn: "অ্যাটাচমেন্টসহ হোমওয়ার্ক দেওয়া, সংগ্রহ ও পর্যালোচনা।" },
    features: ["Homework","Due Date","Attachments","Submission","Review","Marks"] },

  { slug: "assignment", no: 14, group: "academic", icon: FileText,
    title: { en: "Assignment", bn: "অ্যাসাইনমেন্ট" },
    desc: { en: "Online assignment submission and evaluation.", bn: "অনলাইন অ্যাসাইনমেন্ট জমা ও মূল্যায়ন।" },
    features: ["Assignment","File Upload","Online Submission","Evaluation","Feedback"] },

  { slug: "examination", no: 15, group: "academic", icon: ClipboardList,
    title: { en: "Examination", bn: "পরীক্ষা" },
    desc: { en: "Schedule to transcript — complete examination lifecycle.", bn: "সিডিউল থেকে ট্রান্সক্রিপ্ট — পূর্ণ পরীক্ষা জীবনচক্র।" },
    features: ["Exam Schedule","Hall Allocation","Marks Entry","Grade","GPA","CGPA","Ranking","Report Card","Transcript"] },

  { slug: "online-exam", no: 16, group: "academic", icon: Monitor,
    title: { en: "Online Exam (CBT)", bn: "অনলাইন পরীক্ষা (সিবিটি)" },
    desc: { en: "Computer-based testing with auto marking and randomization.", bn: "অটো মার্কিং ও র‌্যান্ডমাইজেশনসহ কম্পিউটার-ভিত্তিক পরীক্ষা।" },
    features: ["MCQ","Essay","Random Questions","Timer","Auto Marking","Result"] },

  { slug: "fees", no: 17, group: "finance", icon: Wallet,
    title: { en: "Fees Management", bn: "ফি ম্যানেজমেন্ট" },
    desc: { en: "All fee types, installments and payment gateways ready.", bn: "সব ধরনের ফি, ইনস্টলমেন্ট ও পেমেন্ট গেটওয়ে প্রস্তুত।" },
    features: ["Admission Fee","Tuition Fee","Transport Fee","Hostel Fee","Uniform Fee","Books Fee","Activity Fee","Fine","Scholarship","Discount","Installment Plan","Payment Gateway Ready"] },

  { slug: "accounting", no: 18, group: "finance", icon: Calculator,
    title: { en: "Accounting & Finance", bn: "অ্যাকাউন্টিং ও ফিন্যান্স" },
    desc: { en: "Full double-entry accounting with financial statements.", bn: "আর্থিক বিবরণী সহ পূর্ণ ডাবল-এন্ট্রি অ্যাকাউন্টিং।" },
    features: ["Chart of Accounts","Income","Expense","Journal","Ledger","Trial Balance","Profit & Loss","Balance Sheet","Cash Flow","Bank Reconciliation","Budget"] },

  { slug: "payroll", no: 19, group: "finance", icon: Banknote,
    title: { en: "Payroll", bn: "পেরোল" },
    desc: { en: "GCC-compliant payroll with WPS-ready bank transfers.", bn: "ডব্লিউপিএস-রেডি ব্যাংক ট্রান্সফারসহ জিসিসি-কমপ্লায়েন্ট পেরোল।" },
    features: ["Salary Structure","Allowance","Deduction","Overtime","Bonus","Payslip","Bank Transfer","WPS Ready"] },

  { slug: "transport", no: 20, group: "operations", icon: Bus,
    title: { en: "Transport Management", bn: "ট্রান্সপোর্ট ম্যানেজমেন্ট" },
    desc: { en: "Buses, routes, drivers and live GPS tracking.", bn: "বাস, রুট, ড্রাইভার ও লাইভ জিপিএস ট্র্যাকিং।" },
    features: ["Bus","Driver","Route","GPS","Pickup","Drop","Attendance"] },

  { slug: "hostel", no: 21, group: "operations", icon: BedDouble,
    title: { en: "Hostel Management", bn: "হোস্টেল ম্যানেজমেন্ট" },
    desc: { en: "Buildings, rooms, beds, mess and fees.", bn: "বিল্ডিং, রুম, বেড, মেস ও ফি।" },
    features: ["Building","Room","Bed","Allocation","Mess","Fees"] },

  { slug: "library", no: 22, group: "operations", icon: Library,
    title: { en: "Library", bn: "লাইব্রেরি" },
    desc: { en: "Catalog, barcode/QR-based issue and return workflow.", bn: "ক্যাটালগ, বারকোড/কিউআর-ভিত্তিক ইস্যু-রিটার্ন প্রক্রিয়া।" },
    features: ["Book","Barcode","QR","Issue","Return","Fine"] },

  { slug: "inventory", no: 23, group: "operations", icon: Package,
    title: { en: "Inventory & Asset", bn: "ইনভেন্টরি ও অ্যাসেট" },
    desc: { en: "Assets, purchases, suppliers, stock and depreciation.", bn: "অ্যাসেট, ক্রয়, সাপ্লায়ার, স্টক ও অবচয়।" },
    features: ["Asset Register","Purchase","Supplier","Stock","Maintenance","Depreciation"] },

  { slug: "medical", no: 24, group: "operations", icon: Stethoscope,
    title: { en: "Medical Center", bn: "মেডিকেল সেন্টার" },
    desc: { en: "Health records, vaccinations and clinic visits.", bn: "স্বাস্থ্য রেকর্ড, টিকা ও ক্লিনিক ভিজিট।" },
    features: ["Health Record","Vaccination","Allergy","Medicine","Clinic Visit","Emergency"] },

  { slug: "communication", no: 25, group: "engagement", icon: MessageSquare,
    title: { en: "Communication Center", bn: "যোগাযোগ কেন্দ্র" },
    desc: { en: "SMS, email, WhatsApp and push in one place.", bn: "এসএমএস, ইমেইল, হোয়াটসঅ্যাপ ও পুশ — এক জায়গায়।" },
    features: ["SMS","Email","WhatsApp","Push Notification","Circular","Notice"] },

  { slug: "events", no: 26, group: "engagement", icon: PartyPopper,
    title: { en: "Event Management", bn: "ইভেন্ট ম্যানেজমেন্ট" },
    desc: { en: "Events, sports days, parent meetings and Eid celebrations.", bn: "ইভেন্ট, স্পোর্টস, প্যারেন্ট মিটিং ও ঈদ উদযাপন।" },
    features: ["Events","Sports","Parent Meeting","National Day","Eid Events"] },

  { slug: "leave", no: 27, group: "operations", icon: CalendarClock,
    title: { en: "Leave Management", bn: "ছুটি ব্যবস্থাপনা" },
    desc: { en: "Leave workflow for students, teachers and staff.", bn: "শিক্ষার্থী, শিক্ষক ও স্টাফের ছুটি প্রক্রিয়া।" },
    features: ["Student Leave","Staff Leave","Teacher Leave","Approval Workflow"] },

  { slug: "visitor", no: 28, group: "operations", icon: Contact,
    title: { en: "Visitor Management", bn: "ভিজিটর ম্যানেজমেন্ট" },
    desc: { en: "Register, appoint and pass visitors safely.", bn: "নিরাপদভাবে ভিজিটর রেজিস্টার, অ্যাপয়েন্টমেন্ট ও পাস।" },
    features: ["Visitor Registration","Appointment","Visitor Pass","Check-in / Check-out"] },

  { slug: "reception", no: 29, group: "engagement", icon: Phone,
    title: { en: "Reception", bn: "রিসেপশন" },
    desc: { en: "Inquiries, complaints and lost & found.", bn: "অনুসন্ধান, অভিযোগ ও লস্ট অ্যান্ড ফাউন্ড।" },
    features: ["Inquiry","Admission Inquiry","Complaint","Lost & Found"] },

  { slug: "certificates", no: 30, group: "academic", icon: Award,
    title: { en: "Certificate Generator", bn: "সার্টিফিকেট জেনারেটর" },
    desc: { en: "Bonafide, character, transfer and experience certificates.", bn: "বোনাফাইড, ক্যারেক্টার, ট্রান্সফার ও এক্সপিরিয়েন্স সার্টিফিকেট।" },
    features: ["Bonafide","Character","Transfer","Experience","Enrollment"] },

  { slug: "reports", no: 31, group: "insight", icon: BarChart3,
    title: { en: "Reports & Analytics", bn: "রিপোর্ট ও অ্যানালিটিক্স" },
    desc: { en: "Executive KPI dashboards across academic, finance and HR.", bn: "একাডেমিক, ফিন্যান্স ও এইচআর জুড়ে এক্সিকিউটিভ কেপিআই ড্যাশবোর্ড।" },
    features: ["Academic","Student Performance","Subject Analysis","Teacher Performance","Finance","Income","Expense","Fee Collection","HR","Attendance","Payroll","KPI Dashboard","Executive Reports"] },

  { slug: "ai-center", no: 32, group: "insight", icon: Sparkles,
    title: { en: "AI Center", bn: "এআই সেন্টার" },
    desc: { en: "AI assistants, generators and predictive analytics.", bn: "এআই অ্যাসিস্ট্যান্ট, জেনারেটর ও প্রেডিক্টিভ অ্যানালিটিক্স।" },
    features: ["AI Chat Assistant","AI Homework Generator","AI Exam Generator","AI Question Bank","AI Report Generator","AI Student Performance Prediction","AI Attendance Analysis","AI Fee Defaulter Prediction","AI Timetable Generator"] },

  { slug: "mobile-apps", no: 33, group: "platform", icon: Smartphone,
    title: { en: "Mobile Apps", bn: "মোবাইল অ্যাপ" },
    desc: { en: "Student, Parent, Teacher, Driver and Admin apps.", bn: "শিক্ষার্থী, অভিভাবক, শিক্ষক, ড্রাইভার ও অ্যাডমিন অ্যাপ।" },
    features: ["Student App","Parent App","Teacher App","Driver App","Admin App"] },

  { slug: "documents", no: 34, group: "operations", icon: FolderLock,
    title: { en: "Document Management", bn: "ডকুমেন্ট ম্যানেজমেন্ট" },
    desc: { en: "Digital vault with e-signature for critical documents.", bn: "গুরুত্বপূর্ণ ডকুমেন্টের জন্য ই-সিগনেচারসহ ডিজিটাল ভল্ট।" },
    features: ["Passport","QID","Visa","Certificates","Employee Documents","Digital Signature"] },

  { slug: "notifications", no: 35, group: "engagement", icon: Bell,
    title: { en: "Notification Center", bn: "নোটিফিকেশন কেন্দ্র" },
    desc: { en: "Unified notifications across every channel.", bn: "সব চ্যানেলে একত্রিত নোটিফিকেশন।" },
    features: ["SMS","Email","WhatsApp","Push","In-App Notification"] },

  { slug: "audit", no: 36, group: "platform", icon: ShieldCheck,
    title: { en: "Audit & Security", bn: "অডিট ও সিকিউরিটি" },
    desc: { en: "Audit trail, 2FA, IP restriction, backup & restore.", bn: "অডিট ট্রেইল, ২এফএ, আইপি সীমাবদ্ধতা, ব্যাকআপ ও রিস্টোর।" },
    features: ["Audit Log","Login History","Activity Log","Two Factor Authentication (2FA)","IP Restriction","Backup","Restore"] },

  { slug: "integrations", no: 37, group: "platform", icon: Plug,
    title: { en: "API & Integrations", bn: "এপিআই ও ইন্টিগ্রেশন" },
    desc: { en: "Payments, SMS, WhatsApp, Google, Microsoft, Zoom, biometric.", bn: "পেমেন্ট, এসএমএস, হোয়াটসঅ্যাপ, গুগল, মাইক্রোসফট, জুম, বায়োমেট্রিক।" },
    features: ["Payment Gateway","SMS Gateway","WhatsApp API","Google Calendar","Microsoft 365","Zoom / Google Meet","Moodle","RFID Devices","Biometric Devices"] },

  { slug: "gcc-compliance", no: 38, group: "platform", icon: Globe2,
    title: { en: "Qatar / GCC Compliance", bn: "কাতার / জিসিসি কমপ্লায়েন্স" },
    desc: { en: "Bilingual RTL, Hijri calendar, QID/Visa expiry, WPS, ministry reports.", bn: "দ্বিভাষিক আরটিএল, হিজরি ক্যালেন্ডার, কিউআইডি/ভিসা মেয়াদ, ডব্লিউপিএস, মিনিস্ট্রি রিপোর্ট।" },
    features: ["Arabic & English (RTL)","Hijri + Gregorian Calendar","QID Management","Passport Expiry","Visa Expiry","Contract Expiry","Ministry Reports","WPS Support","GCC Holiday Calendar"] },

  { slug: "subscription", no: 39, group: "platform", icon: CreditCard,
    title: { en: "SaaS Subscription", bn: "সাস সাবস্ক্রিপশন" },
    desc: { en: "Trials, plans, licensing, invoicing and usage analytics.", bn: "ট্রায়াল, প্ল্যান, লাইসেন্স, ইনভয়েস ও ইউসেজ অ্যানালিটিক্স।" },
    features: ["Free Trial","Monthly Plan","Yearly Plan","License","Billing","Invoice","Auto Renewal","Usage Analytics"] },

  { slug: "settings", no: 40, group: "platform", icon: Settings,
    title: { en: "Settings", bn: "সেটিংস" },
    desc: { en: "School, theme, language, currency, timezone, integrations.", bn: "স্কুল, থিম, ভাষা, মুদ্রা, টাইমজোন, ইন্টিগ্রেশন।" },
    features: ["School Settings","Theme","Language","Currency","Time Zone","Backup","Email Settings","SMS Settings","WhatsApp Settings","Branding"] },
];

export const modulesBySlug = new Map(modules.map((m) => [m.slug, m]));

export function modulesInGroup(g: string) {
  return modules.filter((m) => m.group === g);
}
