import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = 3000;

app.use(express.json({ limit: "2mb" }));

interface ServiceOption {
  id: string;
  labelAr: string;
  labelEn: string;
  priceDelta: number;
}

interface MakanakService {
  id: string;
  category: "government" | "vehicles-finance" | "education-career" | "digital-personal";
  nameAr: string;
  nameEn: string;
  summaryAr: string;
  summaryEn: string;
  priceSar: number;
  turnaroundAr: string;
  turnaroundEn: string;
  iconKey: string;
  accentHex: string;
  requirementsAr: string[];
  requirementsEn: string[];
  stepsAr: string[];
  stepsEn: string[];
  options?: ServiceOption[];
}

const SERVICES: MakanakService[] = [
  {
    id: "absher",
    category: "government",
    nameAr: "التسجيل في أبشر",
    nameEn: "Absher Registration",
    summaryAr: "إنشاء وتفعيل حساب أبشر للأفراد وتحديث بيانات الجوال والعنوان الوطني بشكل مكتمل.",
    summaryEn: "Create and activate your Absher individual account with mobile verification and National Address setup.",
    priceSar: 35,
    turnaroundAr: "خلال ٣٠ دقيقة",
    turnaroundEn: "Within 30 mins",
    iconKey: "absher",
    accentHex: "#15803D",
    requirementsAr: [
      "رقم الهوية الوطنية أو الإقامة سارية المفعول",
      "رقم جوال مسجل باسم المستفيد لدى مزود الخدمة",
      "البريد الإلكتروني الفعال",
    ],
    requirementsEn: [
      "Valid National ID or Iqama number",
      "Active mobile number registered under your ID",
      "Valid personal email address",
    ],
    stepsAr: [
      "إدخال البيانات والتحقق من مطابقتها مع النفاذ الوطني",
      "إنشاء الحساب وإعداد كلمة المرور وأسئلة الأمان",
      "توجيه المستفيد للتوثيق عبر الخدمة الذاتية أو التطبيق البنكي",
    ],
    stepsEn: [
      "Verify personal details and National Single Sign-On readiness",
      "Configure Absher credentials and security settings",
      "Guide final biometric activation via bank app or kiosk",
    ],
    options: [
      { id: "absher-new", labelAr: "تسجيل حساب أبشر جديد", labelEn: "New Absher Registration", priceDelta: 0 },
      { id: "absher-recover", labelAr: "تحديث رقم الجوال / استعادة حساب", labelEn: "Mobile Update / Recovery", priceDelta: 10 },
    ],
  },
  {
    id: "jawazat",
    category: "government",
    nameAr: "الجوازات",
    nameEn: "Passports (Jawazat)",
    summaryAr: "إصدار وتجديد جواز السفر، تأشيرات الخروج والعودة، تمديد الزيارة، ونقل المعلومات.",
    summaryEn: "Passport issuance and renewal, exit/re-entry visas, visit visa extensions, and passport data updates.",
    priceSar: 50,
    turnaroundAr: "نفس اليوم",
    turnaroundEn: "Same Day",
    iconKey: "jawazat",
    accentHex: "#3F6212",
    requirementsAr: [
      "حساب أبشر مفعل للمستفيد أو رب الأسرة",
      "سداد الرسوم الحكومية عبر سداد قبل التنفيذ",
      "صورة الجواز أو بيانات التابع المطلوبة",
    ],
    requirementsEn: [
      "Active Absher account for the applicant or sponsor",
      "Official SADAD fee settled prior to submission",
      "Passport copy or dependent details",
    ],
    stepsAr: [
      "مراجعة الأهلية والتحقق من سداد الرسوم عبر سداد",
      "رفع الطلب إلكترونياً عبر بوابة الجوازات",
      "إرسال نسخة الوثيقة أو رقم تتبع التوصيل",
    ],
    stepsEn: [
      "Verify eligibility and SADAD payment clearance",
      "Submit request electronically through Jawazat services",
      "Send confirmation receipt or delivery tracking",
    ],
    options: [
      { id: "jawazat-passport", labelAr: "إصدار / تجديد الجواز", labelEn: "Issue / Renew Passport", priceDelta: 0 },
      { id: "jawazat-visa", labelAr: "تأشيرة خروج وعودة / تمديد زيارة", labelEn: "Exit-Reentry / Visit Extension", priceDelta: 0 },
      { id: "jawazat-transfer", labelAr: "نقل معلومات الجواز للمقيمين", labelEn: "Resident Passport Info Update", priceDelta: 15 },
    ],
  },
  {
    id: "citizen-account",
    category: "government",
    nameAr: "التسجيل في حساب المواطن",
    nameEn: "Citizen Account Registration",
    summaryAr: "تسجيل حساب جديد أو تحديث الدخل والتابعين وعقود الإيجار ومعالجة الأهلية والاعتراضات.",
    summaryEn: "New registration, income & dependent updates, rental contract linking, and eligibility appeal filing.",
    priceSar: 45,
    turnaroundAr: "خلال ساعتين",
    turnaroundEn: "Within 2 hours",
    iconKey: "citizen-account",
    accentHex: "#1D4ED8",
    requirementsAr: [
      "بيانات النفاذ الوطني ورقم الهوية الوطنية",
      "رقم الآيبان البنكي النشط باسم المستفيد",
      "بيانات التابعين وإثبات الاستقلالية (عقد إيجار إلكتروني إن وجد)",
    ],
    requirementsEn: [
      "National ID and Nafath access",
      "Active personal IBAN bank account number",
      "Dependents info and tenancy contract if applicable",
    ],
    stepsAr: [
      "مراجعة الإفصاح المالي ومصادر الدخل بدقة",
      "إضافة التابعين وربط الآيبان البنكي والمرفقات الرسمية",
      "تأكيد الإرسال ومتابعة حالة الأهلية للدورة القادمة",
    ],
    stepsEn: [
      "Review income disclosures and household status",
      "Link dependents, verified IBAN, and supporting documents",
      "Submit application and confirm cycle eligibility status",
    ],
    options: [
      { id: "ca-new", labelAr: "تسجيل ملف جديد في حساب المواطن", labelEn: "New Citizen Account File", priceDelta: 0 },
      { id: "ca-update", labelAr: "تحديث بيانات / رفع اعتراض أهلية", labelEn: "Data Update / Appeal", priceDelta: 10 },
    ],
  },
  {
    id: "civil-affairs",
    category: "government",
    nameAr: "مواعيد الأحوال المدنية",
    nameEn: "Civil Affairs Appointments",
    summaryAr: "حجز وتعديل مواعيد الأحوال المدنية لتجديد الهوية الوطنية، سجل الأسرة، وشهادات الميلاد.",
    summaryEn: "Book and reschedule Civil Affairs appointments for National ID renewal, family registry, and birth certificates.",
    priceSar: 25,
    turnaroundAr: "خلال ٢٠ دقيقة",
    turnaroundEn: "Within 20 mins",
    iconKey: "civil-affairs",
    accentHex: "#A16207",
    requirementsAr: [
      "رقم الهوية الوطنية وتاريخ الميلاد",
      "المدينة والفرع المفضل للمراجعة",
      "توضيح نوع المعاملة المطلوبة (تجديد، بدل تالف، سجل أسرة)",
    ],
    requirementsEn: [
      "National ID number and date of birth",
      "Preferred city and Civil Affairs branch",
      "Required service type (renewal, replacement, family card)",
    ],
    stepsAr: [
      "البحث عن أقرب موعد متاح في الفرع المطلوب",
      "حجز الموعد وإعداد نموذج المتطلبات المسبق",
      "إرسال تذكرة الموعد وقائمة المستندات الواجب إحضارها",
    ],
    stepsEn: [
      "Locate the earliest available slot at your chosen branch",
      "Reserve the appointment and prepare pre-visit forms",
      "Deliver official appointment slip and checklist",
    ],
  },
  {
    id: "car-insurance",
    category: "vehicles-finance",
    nameAr: "تأمين السيارات",
    nameEn: "Car Insurance",
    summaryAr: "مقارنة أسعار التأمين ضد الغير والشامل من شركات التأمين المعتمدة وإصدار الوثيقة فوراً.",
    summaryEn: "Compare third-party and comprehensive motor insurance quotes from licensed insurers and issue instantly.",
    priceSar: 40,
    turnaroundAr: "خلال ٣٠ دقيقة",
    turnaroundEn: "Within 30 mins",
    iconKey: "car-insurance",
    accentHex: "#334155",
    requirementsAr: [
      "رقم الهوية الوطنية أو الإقامة لمالك المركبة",
      "الرقم التسلسلي للمركبة أو رقم البطاقة الجمركية",
      "تحديد نوع التأمين المطلوب (ضد الغير أو شامل)",
    ],
    requirementsEn: [
      "Owner National ID or Iqama number",
      "Vehicle serial number or customs card number",
      "Preferred coverage (Third-Party or Comprehensive)",
    ],
    stepsAr: [
      "جلب ومقارنة أفضل عروض الأسعار من الشركات المرخصة",
      "اعتماد العرض المناسب مع المستفيد وإتمام السداد",
      "إصدار الوثيقة وربطها تلقائياً مع نظام المرور ونجم",
    ],
    stepsEn: [
      "Fetch and compare live quotes across licensed insurers",
      "Confirm preferred policy and complete payment",
      "Issue policy with automatic traffic system linking",
    ],
    options: [
      { id: "ins-tpl", labelAr: "تأمين ضد الغير", labelEn: "Third-Party Liability", priceDelta: 0 },
      { id: "ins-comp", labelAr: "تأمين شامل", labelEn: "Comprehensive Coverage", priceDelta: 20 },
    ],
  },
  {
    id: "istimara-renewal",
    category: "vehicles-finance",
    nameAr: "تجديد استمارة",
    nameEn: "Vehicle Registration Renewal",
    summaryAr: "إتمام إجراءات تجديد رخصة السير (الاستمارة) والتحقق من الفحص الدوري والتأمين وسداد الرسوم.",
    summaryEn: "Complete vehicle registration (Istimara) renewal including inspection, insurance check, and system filing.",
    priceSar: 45,
    turnaroundAr: "خلال ٤٥ دقيقة",
    turnaroundEn: "Within 45 mins",
    iconKey: "istimara-renewal",
    accentHex: "#166534",
    requirementsAr: [
      "وجود تأمين مركبة ساري وفحص دوري ساري المفعول",
      "خلو السجل من المخالفات المرورية وسداد رسوم التجديد",
      "رقم اللوحة والرقم التسلسلي للمركبة",
    ],
    requirementsEn: [
      "Valid motor insurance and periodic technical inspection",
      "Cleared traffic violations and settled renewal fee",
      "Vehicle plate and serial numbers",
    ],
    stepsAr: [
      "التحقق من استيفاء الفحص الدوري والتأمين والرسوم",
      "تنفيذ طلب التجديد إلكترونياً عبر بوابة المرور",
      "إتاحة الاستمارة الرقمية وإشعار التوصيل عند الحاجة",
    ],
    stepsEn: [
      "Verify inspection, insurance, and fee clearance",
      "Process electronic renewal via traffic services",
      "Provide digital registration confirmation and delivery option",
    ],
  },
  {
    id: "bank-account",
    category: "vehicles-finance",
    nameAr: "فتح حساب بنكي",
    nameEn: "Bank Account Opening",
    summaryAr: "المساعدة في فتح الحسابات البنكية الجارية للأفراد أو المؤسسات وربط العنوان الوطني والنفاذ.",
    summaryEn: "Guided assistance for opening personal or commercial bank accounts with Nafath and National Address setup.",
    priceSar: 50,
    turnaroundAr: "نفس اليوم",
    turnaroundEn: "Same Day",
    iconKey: "bank-account",
    accentHex: "#0F766E",
    requirementsAr: [
      "هوية وطنية أو إقامة سارية مع حساب نفاذ وطني مفعل",
      "تسجيل العنوان الوطني مطابق لمقر السكن",
      "تحديد البنك المطلوب ونوع الحساب (أفراد / منشأة)",
    ],
    requirementsEn: [
      "Valid National ID or Iqama with active Nafath",
      "Verified National Address",
      "Preferred bank and account type (Personal / Business)",
    ],
    stepsAr: [
      "التأكد من جاهزية العنوان الوطني وبيانات الهوية",
      "تعبئة نموذج فتح الحساب البنكي وإدخال البيانات المالية",
      "التحقق عبر النفاذ الوطني وإصدار رقم الآيبان مباشرة",
    ],
    stepsEn: [
      "Validate National Address and KYC readiness",
      "Complete bank onboarding forms and financial profile",
      "Authenticate via Nafath to receive your active IBAN",
    ],
  },
  {
    id: "job-application",
    category: "education-career",
    nameAr: "التقديم على الوظائف",
    nameEn: "Job Applications",
    summaryAr: "التقديم الاحترافي على الوظائف الحكومية والخاصة ومنصات جدارات وطاقات ولينكدإن.",
    summaryEn: "Professional application filing across Jadara, Taqat, LinkedIn, and corporate career portals.",
    priceSar: 40,
    turnaroundAr: "خلال ٣ ساعات",
    turnaroundEn: "Within 3 hours",
    iconKey: "job-application",
    accentHex: "#1E40AF",
    requirementsAr: [
      "السيرة الذاتية المحدثة والمؤهلات العلمية والشهادات",
      "بيانات الدخول لمنصة جدارات أو طاقات أو البريد الإلكتروني",
      "تحديد المجالات الوظيفية والمدن المفضلة",
    ],
    requirementsEn: [
      "Updated CV, academic degrees, and certificates",
      "Portal details (Jadara / Taqat) or career email",
      "Target job roles and preferred cities",
    ],
    stepsAr: [
      "مراجعة المؤهلات ومطابقتها مع الشواغر المعلنة",
      "تعبئة ملفات التقديم وإرفاق الشهادات بالصيغة المطلوبة",
      "إرسال ملخص بكافة الوظائف التي تم التقديم عليها",
    ],
    stepsEn: [
      "Match qualifications against open job listings",
      "Submit complete portal forms with formatted attachments",
      "Deliver confirmation report of all submitted applications",
    ],
  },
  {
    id: "university-admission",
    category: "education-career",
    nameAr: "التسجيل في الجامعات",
    nameEn: "University Admissions",
    summaryAr: "ترتيب الرغبات والتقديم في بوابات القبول الموحد والجامعات والدبلومات والمنح.",
    summaryEn: "Application filing and major preference ordering for unified admission portals, universities, and diplomas.",
    priceSar: 60,
    turnaroundAr: "خلال ساعتين",
    turnaroundEn: "Within 2 hours",
    iconKey: "university-admission",
    accentHex: "#374151",
    requirementsAr: [
      "شهادة الثانوية العامة ودرجات القدرات والتحصيلي",
      "بيانات الهوية الوطنية ورقم جوال الطالب",
      "قائمة التخصصات والجامعات المفضلة حسب الأولوية",
    ],
    requirementsEn: [
      "High school transcript and Qudurat / Tahsili scores",
      "Student National ID and personal mobile number",
      "Preferred majors and universities list",
    ],
    stepsAr: [
      "حساب النسبة الموزونة ومقارنتها بحدود القبول السابقة",
      "تسجيل الرغبات بدقة في البوابة الموحدة أو بوابة الجامعة",
      "تثبيت الطلب وتزويد الطالب بإيصال التسجيل الرسمي",
    ],
    stepsEn: [
      "Calculate weighted score against historical admission cutoffs",
      "Order and submit major preferences on official university portals",
      "Lock application and deliver official registration receipt",
    ],
  },
  {
    id: "qiyas",
    category: "education-career",
    nameAr: "التسجيل في قياس",
    nameEn: "Qiyas Exam Registration",
    summaryAr: "إنشاء ملف قياس وحجز اختبارات القدرات والتحصيلي وكفايات والاختبارات المهنية.",
    summaryEn: "Qiyas profile setup and exam booking for Qudurat, Tahsili, STEP, and professional licensing tests.",
    priceSar: 30,
    turnaroundAr: "خلال ٣٠ دقيقة",
    turnaroundEn: "Within 30 mins",
    iconKey: "qiyas",
    accentHex: "#78583A",
    requirementsAr: [
      "رقم الهوية الوطنية أو الإقامة وتاريخ الميلاد",
      "اسم الاختبار المطلوب (قدرات، تحصيلي، STEP، رخصة مهنية)",
      "المدينة والنوع المطلوب (محوسب أو ورقي) وسداد الرسوم",
    ],
    requirementsEn: [
      "National ID or Iqama number and date of birth",
      "Exam type (Qudurat, Tahsili, STEP, or Teacher License)",
      "Preferred city, test mode (CBT/Paper), and fee settlement",
    ],
    stepsAr: [
      "إنشاء أو تحديث ملف المتقدم في منصة قياس",
      "حجز أقرب مركز وموعد مناسب حسب رغبة الطالب",
      "إصدار إشعار السداد وتأكيد الحجز النهائي",
    ],
    stepsEn: [
      "Create or update applicant profile on the Qiyas portal",
      "Reserve nearest test center and preferred date slot",
      "Confirm payment reference and deliver exam booking slip",
    ],
  },
  {
    id: "homework-help",
    category: "education-career",
    nameAr: "حل الواجبات",
    nameEn: "Homework & Study Assistance",
    summaryAr: "إعداد وتنسيق البحوث المدرسية والجامعية، العروض التقديمية، ومراجعة الواجبات والملخصات.",
    summaryEn: "Structured preparation and formatting of school/university assignments, presentations, and study summaries.",
    priceSar: 45,
    turnaroundAr: "٦ – ٢٤ ساعة",
    turnaroundEn: "6 – 24 hours",
    iconKey: "homework-help",
    accentHex: "#D97706",
    requirementsAr: [
      "نص الواجب أو ملف التعليمات والمادة الدراسية",
      "المرحلة الدراسية وموعد التسليم المطلوب",
      "صيغة الملف المرغوبة (Word / PDF / PowerPoint)",
    ],
    requirementsEn: [
      "Assignment prompt, rubric, and subject name",
      "Academic level and submission deadline",
      "Preferred deliverable format (Word / PDF / PowerPoint)",
    ],
    stepsAr: [
      "مراجعة متطلبات المعلم أو المحاضر والمصادر المعتمدة",
      "إعداد الحل وتنسيقه بأسلوب أكاديمي واضح ومنظم",
      "تسليم الملف النهائي مع إمكانية التعديل المجاني",
    ],
    stepsEn: [
      "Review course guidelines and academic rubric",
      "Draft, solve, and format work clearly with proper structure",
      "Deliver final file with complimentary revision support",
    ],
    options: [
      { id: "hw-standard", labelAr: "واجب دراسي / ملخص", labelEn: "Standard Assignment / Summary", priceDelta: 0 },
      { id: "hw-ppt", labelAr: "عرض تقديمي أو بحث متكامل", labelEn: "Presentation / Research Paper", priceDelta: 25 },
    ],
  },
  {
    id: "online-shopping",
    category: "digital-personal",
    nameAr: "التسوق الإلكتروني",
    nameEn: "Online Shopping Concierge",
    summaryAr: "الوساطة والطلب من المتاجر المحلية والعالمية بأمان مع متابعة الشحن حتى باب المنزل.",
    summaryEn: "Safe purchasing assistance from local and international online stores with full shipment tracking to your door.",
    priceSar: 30,
    turnaroundAr: "خلال ساعة",
    turnaroundEn: "Within 1 hour",
    iconKey: "online-shopping",
    accentHex: "#BE185D",
    requirementsAr: [
      "روابط المنتجات المطلوبة والمقاسات والألوان",
      "العنوان الوطني أو عنوان التوصيل التفصيلي",
      "تحويل قيمة الطلب الإجمالية قبل اعتماد الشراء",
    ],
    requirementsEn: [
      "Direct product links, sizes, and color selections",
      "Delivery address or National Address",
      "Order subtotal transfer prior to checkout confirmation",
    ],
    stepsAr: [
      "حساب التكلفة الشاملة (السعر + الشحن + الضريبة) بشفافية",
      "إتمام الطلب الرسمي باسم المستفيد وتزويده بالفاتورة",
      "مشاركة رقم التتبع ومتابعة الشحنة حتى الاستلام",
    ],
    stepsEn: [
      "Calculate transparent total (item + shipping + VAT)",
      "Place official order and issue store invoice copy",
      "Share courier tracking number until safe delivery",
    ],
  },
  {
    id: "email-creation",
    category: "digital-personal",
    nameAr: "إنشاء إيميلات",
    nameEn: "Email Account Creation",
    summaryAr: "إنشاء بريد إلكتروني رسمي وشخصي آمن (Gmail / Outlook) وربطه برقم الجوال وإعداد الحماية.",
    summaryEn: "Set up secure personal or professional email accounts (Gmail / Outlook) with 2FA and phone recovery.",
    priceSar: 20,
    turnaroundAr: "خلال ١٥ دقيقة",
    turnaroundEn: "Within 15 mins",
    iconKey: "email-creation",
    accentHex: "#DC2626",
    requirementsAr: [
      "الاسم الكامل باللغة الإنجليزية",
      "رقم جوال نشط لاستلام رمز التحقق والربط الأمني",
      "اختيار نوع البريد المطلوب (Gmail أو Outlook)",
    ],
    requirementsEn: [
      "Full name in English spelling",
      "Active mobile number for verification & recovery",
      "Preferred provider (Gmail or Outlook)",
    ],
    stepsAr: [
      "إنشاء عنوان بريد إلكتروني مهني ومناسب للاستخدام الرسمي",
      "تفعيل التحقق بخطوتين وربط رقم الجوال للاسترداد",
      "تسليم بيانات الدخول وإرشاد المستفيد لتسجيل الدخول الآمن",
    ],
    stepsEn: [
      "Register clean, professional email address",
      "Enable 2-step verification and recovery phone link",
      "Hand over credentials and verify first device sign-in",
    ],
  },
  {
    id: "cv-creation",
    category: "digital-personal",
    nameAr: "إنشاء سيرة ذاتية",
    nameEn: "CV / Resume Creation",
    summaryAr: "تصميم وصياغة سيرة ذاتية احترافية متوافقة مع أنظمة فرز المرشحين (ATS) بالعربية أو الإنجليزية.",
    summaryEn: "Craft a clean, ATS-compliant professional resume in Arabic, English, or bilingual format.",
    priceSar: 55,
    turnaroundAr: "خلال ٤ ساعات",
    turnaroundEn: "Within 4 hours",
    iconKey: "cv-creation",
    accentHex: "#0284C7",
    requirementsAr: [
      "المؤهلات العلمية، الدورات التدريبية، والخبرات السابقة",
      "المسمى الوظيفي المستهدف وبيانات التواصل",
      "تحديد اللغة المطلوبة (عربي، إنجليزي، أو نسختين)",
    ],
    requirementsEn: [
      "Education, certifications, skills, and work history",
      "Target job title and contact details",
      "Preferred language (Arabic, English, or Bilingual)",
    ],
    stepsAr: [
      "مراجعة الخبرات وصياغة الإنجازات المهنية باحترافية",
      "تصميم السيرة الذاتية بقالب حديث متوافق مع أنظمة ATS",
      "التسليم بصيغتي PDF و Word القابلة للتعديل",
    ],
    stepsEn: [
      "Refine career summary and quantify key achievements",
      "Format in a clean ATS-friendly layout",
      "Deliver editable Word and print-ready PDF files",
    ],
    options: [
      { id: "cv-single", labelAr: "نسخة واحدة (عربي أو إنجليزي)", labelEn: "Single Language (AR or EN)", priceDelta: 0 },
      { id: "cv-both", labelAr: "نسختان (عربي + إنجليزي)", labelEn: "Bilingual Bundle (AR + EN)", priceDelta: 25 },
    ],
  },
  {
    id: "social-security",
    category: "government",
    nameAr: "الضمان الاجتماعي المطور",
    nameEn: "Developed Social Security",
    summaryAr: "التسجيل في منصة الدعم والحماية الاجتماعية، تكوين المنزل، إضافة التابعين، ومتابعة الأهلية.",
    summaryEn: "Full registration in the Social Protection platform, household setup, income declaration, and appeals.",
    priceSar: 45,
    turnaroundAr: "خلال ساعتين",
    turnaroundEn: "Within 2 hours",
    iconKey: "social-security",
    accentHex: "#EA580C",
    requirementsAr: [
      "بيانات النفاذ الوطني ورقم الآيبان البنكي النشط",
      "عقد الإيجار الإلكتروني الموحد أو إثبات السكن",
      "بيانات الدخل لجميع أفراد الأسرة المقيمين في نفس المسكن",
    ],
    requirementsEn: [
      "Nafath credentials and active personal IBAN",
      "Verified tenancy contract or proof of residence",
      "Household members and total family income details",
    ],
    stepsAr: [
      "بناء الملف الموحد وإدخال بيانات المسكن والدخل بدقة",
      "تكوين المنازل وإرفاق المستندات الرسمية المطلوبة",
      "تقديم الطلب ومتابعة نتيجة الأهلية الشهرية",
    ],
    stepsEn: [
      "Build unified profile with housing and income records",
      "Configure household composition and attach official proofs",
      "Submit claim and verify monthly eligibility tracking",
    ],
  },
  {
    id: "hafiz-reef-tamheer",
    category: "education-career",
    nameAr: "التسجيل في حافز، الريف، تمهير",
    nameEn: "Hafiz, Reef & Tamheer Programs",
    summaryAr: "التسجيل وإعداد دراسة الجدوى أو البيانات المطلوبة لبرامج طاقات (حافز، تمهير) ومنصة ريف.",
    summaryEn: "Registration and eligibility filing for Taqat (Hafiz & Tamheer) and Reef agricultural support program.",
    priceSar: 50,
    turnaroundAr: "خلال ٣ ساعات",
    turnaroundEn: "Within 3 hours",
    iconKey: "hafiz-reef-tamheer",
    accentHex: "#475569",
    requirementsAr: [
      "بيانات الهوية الوطنية وحساب النفاذ الوطني (أبشر)",
      "رقم الآيبان البنكي والمؤهل الدراسي",
      "لبرامج ريف: تحديد النشاط الزراعي/الأسر المنتجة ووثيقة العمل الحر",
    ],
    requirementsEn: [
      "National ID and active Nafath / Absher account",
      "Personal IBAN and educational certificate",
      "For Reef: activity details & Freelance Certificate",
    ],
    stepsAr: [
      "تحديد البرنامج الأنسب والتحقق من شروط الاستحقاق",
      "تعبئة استمارات البوابة وإرفاق الوثائق المطلوبة",
      "تسليم مرجع الطلب وخطة المتابعة الأسبوعية أو الشهرية",
    ],
    stepsEn: [
      "Confirm program selection and eligibility requirements",
      "Complete portal application with supporting certificates",
      "Deliver submission reference and compliance checklist",
    ],
    options: [
      { id: "prog-hafiz", labelAr: "برنامج حافز (طاقات)", labelEn: "Hafiz Program (Taqat)", priceDelta: 0 },
      { id: "prog-tamheer", labelAr: "برنامج تمهير للتدريب على رأس العمل", labelEn: "Tamheer On-the-Job Training", priceDelta: 0 },
      { id: "prog-reef", labelAr: "منصة ريف للدعم الزراعي والريفي", labelEn: "Reef Support Program", priceDelta: 15 },
    ],
  },
];

interface TrackedOrder {
  orderId: string;
  customerName: string;
  mobile: string;
  city: string;
  contactMethod: "whatsapp" | "phone";
  notes?: string;
  items: {
    serviceId: string;
    serviceNameAr: string;
    serviceNameEn: string;
    quantity: number;
    unitPriceSar: number;
    selectedOptionLabel?: string;
  }[];
  totalSar: number;
  status: "received" | "in_progress" | "completed";
  createdAt: string;
}

const ordersStore = new Map<string, TrackedOrder>();

ordersStore.set("MKN-104820", {
  orderId: "MKN-104820",
  customerName: "عبدالله بن فهد السبيعي",
  mobile: "0551234567",
  city: "الرياض",
  contactMethod: "whatsapp",
  notes: "نموذج طلب تجريبي للتتبع",
  items: [
    {
      serviceId: "absher",
      serviceNameAr: "التسجيل في أبشر",
      serviceNameEn: "Absher Registration",
      quantity: 1,
      unitPriceSar: 35,
      selectedOptionLabel: "تسجيل حساب أبشر جديد",
    },
    {
      serviceId: "cv-creation",
      serviceNameAr: "إنشاء سيرة ذاتية",
      serviceNameEn: "CV / Resume Creation",
      quantity: 1,
      unitPriceSar: 80,
      selectedOptionLabel: "نسختان (عربي + إنجليزي)",
    },
  ],
  totalSar: 115,
  status: "in_progress",
  createdAt: new Date().toISOString(),
});

app.get("/api/services", (_req, res) => {
  res.json({ success: true, services: SERVICES });
});

app.get("/api/orders", (_req, res) => {
  res.json({ success: true, orders: Array.from(ordersStore.values()).reverse() });
});

app.post("/api/orders", (req, res) => {
  const { customerName, mobile, city, contactMethod, notes, items } = req.body || {};

  if (!customerName || !String(customerName).trim()) {
    return res.status(400).json({ success: false, error: "الاسم الكامل مطلوب" });
  }
  const cleanMobile = String(mobile || "").replace(/\s+/g, "");
  if (!cleanMobile || cleanMobile.length < 9) {
    return res.status(400).json({ success: false, error: "يرجى إدخال رقم جوال صحيح" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: "سلة الخدمات فارغة" });
  }

  const normalizedItems = items.map((item: {
    serviceId: string;
    serviceNameAr: string;
    serviceNameEn: string;
    quantity: number;
    unitPriceSar: number;
    selectedOptionLabel?: string;
  }) => ({
    serviceId: String(item.serviceId),
    serviceNameAr: String(item.serviceNameAr),
    serviceNameEn: String(item.serviceNameEn),
    quantity: Math.max(1, Number(item.quantity) || 1),
    unitPriceSar: Math.max(0, Number(item.unitPriceSar) || 0),
    selectedOptionLabel: item.selectedOptionLabel ? String(item.selectedOptionLabel) : undefined,
  }));

  const totalSar = normalizedItems.reduce(
    (sum: number, item: { quantity: number; unitPriceSar: number }) =>
      sum + item.quantity * item.unitPriceSar,
    0
  );

  const orderId = `MKN-${Math.floor(100000 + Math.random() * 900000)}`;
  const newOrder: TrackedOrder = {
    orderId,
    customerName: String(customerName).trim(),
    mobile: cleanMobile,
    city: String(city || "الرياض"),
    contactMethod: contactMethod === "phone" ? "phone" : "whatsapp",
    notes: notes ? String(notes).trim() : undefined,
    items: normalizedItems,
    totalSar,
    status: "received",
    createdAt: new Date().toISOString(),
  };

  ordersStore.set(orderId, newOrder);

  return res.status(201).json({ success: true, order: newOrder });
});

app.get("/api/orders/:orderId", (req, res) => {
  const id = String(req.params.orderId || "").trim().toUpperCase();
  const order = ordersStore.get(id);
  if (!order) {
    return res.status(404).json({
      success: false,
      error: "لم يتم العثور على طلب بهذا الرقم. تأكد من كتابة الرقم بشكل صحيح (مثال: MKN-104820).",
    });
  }
  return res.json({ success: true, order });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: { server: httpServer },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Makanak Services Desk Server running on http://localhost:${PORT}`);
  });
}

startServer();
