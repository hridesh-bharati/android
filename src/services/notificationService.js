// src/services/notificationService.js
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  getDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebase';

/* ============================================================ */
export const NOTIFICATION_TYPES = {
  ADMISSION_PENDING: 'admission_pending',
  ADMISSION_APPROVED: 'admission_approved',
  FEE_DUE: 'fee_due',
  FEE_PAID: 'fee_paid',
  EXAM_SCHEDULED: 'exam_scheduled',
  EXAM_RESULT: 'exam_result',
  NEW_QUERY: 'new_query',
  NEW_MESSAGE: 'new_message',
  CERTIFICATE_READY: 'certificate_ready',
  NEW_STUDENT: 'new_student',
  BIRTHDAY: 'birthday',
  GENERAL: 'general',
};

/* ============================================================
   SAFE GET DOCS (skip missing index errors gracefully)
   ============================================================ */
const safeGetDocs = async (queryRef, fallbackName = 'query') => {
  try {
    return await getDocs(queryRef);
  } catch (error) {
    if (
      error.code === 'failed-precondition' ||
      error.message?.includes('index')
    ) {
      const indexUrl = error.message?.match(/https:\/\/[^\s]+/)?.[0];
      console.warn(`⚠️ Missing index for ${fallbackName}`);
      if (indexUrl) console.warn(`👉 Create: ${indexUrl}`);
    } else {
      console.log(`Error in ${fallbackName}:`, error.message);
    }
    return { forEach: () => {}, empty: true, size: 0, docs: [] };
  }
};

/* ============================================================
   FORMAT RELATIVE TIME
   ============================================================ */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  
  let date;
  if (timestamp?.toDate) date = timestamp.toDate();
  else if (timestamp instanceof Date) date = timestamp;
  else if (typeof timestamp === 'number') date = new Date(timestamp);
  else if (typeof timestamp === 'string') date = new Date(timestamp);
  else return 'Just now';

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

/* ============================================================
   FETCH ADMIN NOTIFICATIONS
   ============================================================ */
export const fetchAdminNotifications = async () => {
  const notifications = [];

  try {
    /* 1. PENDING ADMISSIONS */
    const admissionsRef = collection(db, 'admissions');
    const admissionsSnap = await safeGetDocs(
      query(
        admissionsRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc'),
        limit(20)
      ),
      'admissions'
    );
    
    admissionsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      notifications.push({
        id: `adm_${docSnap.id}`,
        type: NOTIFICATION_TYPES.ADMISSION_PENDING,
        title: '📋 New Admission Request',
        message: `${data.name || 'A student'} applied for ${data.course || 'a course'}`,
        timestamp: data.createdAt || data.appliedDate,
        read: false,
        actionable: true,
        route: 'AdminPanel',
        routeParams: { screen: 'Admissions' },
        meta: { applicationId: data.applicationId, email: docSnap.id },
      });
    });

    /* 2. NEW STUDENT QUERIES — FIXED! status "pending" not "unread" */
    const queriesRef = collection(db, 'studentQueries');
    const queriesSnap = await safeGetDocs(
      query(
        queriesRef,
        where('status', '==', 'pending'),
        orderBy('timestamp', 'desc'),
        limit(20)
      ),
      'studentQueries'
    );
    
    queriesSnap.forEach((docSnap) => {
      const data = docSnap.data();
      notifications.push({
        id: `qry_${docSnap.id}`,
        type: NOTIFICATION_TYPES.NEW_QUERY,
        title: '💬 New Support Query',
        message: `${data.fullName || 'Someone'}: ${(data.query || '').substring(0, 60)}...`,
        timestamp: data.timestamp,
        read: false,
        actionable: true,
        route: 'AdminPanel',
        routeParams: { screen: 'Queries' },
        meta: { queryId: docSnap.id, mobile: data.mobile },
      });
    });

    /* 3. FEE DUE */
    const studentsRef = collection(db, 'students');
    const feeSnap = await safeGetDocs(
      query(
        studentsRef,
        where('feeStatus', '==', 'overdue'),
        orderBy('updatedAt', 'desc'),
        limit(15)
      ),
      'students'
    );
    
    feeSnap.forEach((docSnap) => {
      const data = docSnap.data();
      notifications.push({
        id: `fee_${docSnap.id}`,
        type: NOTIFICATION_TYPES.FEE_DUE,
        title: '⚠️ Fee Overdue',
        message: `${data.name || 'Student'} (${data.regNo || 'N/A'}) - ₹${data.dueAmount || 0} pending`,
        timestamp: data.updatedAt || data.feeDueDate,
        read: false,
        actionable: true,
        route: 'FeePage',
        routeParams: { studentId: docSnap.id },
        meta: { regNo: data.regNo, amount: data.dueAmount },
      });
    });

    /* 4. UPCOMING EXAMS */
    const examsRef = collection(db, 'exams');
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const examsSnap = await safeGetDocs(
      query(
        examsRef,
        where('date', '>=', today.toISOString().split('T')[0]),
        where('date', '<=', nextWeek.toISOString().split('T')[0]),
        limit(10)
      ),
      'exams'
    );
    
    examsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      notifications.push({
        id: `exam_${docSnap.id}`,
        type: NOTIFICATION_TYPES.EXAM_SCHEDULED,
        title: '📝 Upcoming Exam',
        message: `${data.title || 'Exam'} on ${data.date} at ${data.startTime || 'TBA'}`,
        timestamp: data.createdAt || new Date().toISOString(),
        read: false,
        actionable: true,
        route: 'AdminPanel',
        routeParams: { screen: 'Exams' },
        meta: { examId: docSnap.id },
      });
    });

  } catch (error) {
    console.log('Error fetching admin notifications:', error);
  }

  return notifications.sort((a, b) => {
    const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
    const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
    return dateB - dateA;
  });
};

/* ============================================================
   FETCH STUDENT NOTIFICATIONS
   ============================================================ */
export const fetchStudentNotifications = async (userEmail) => {
  const notifications = [];
  if (!userEmail) return notifications;

  try {
    /* 1. ADMISSION STATUS */
    const admissionRef = doc(db, 'admissions', userEmail.toLowerCase());
    const admissionSnap = await getDoc(admissionRef).catch(() => null);
    
    if (admissionSnap?.exists()) {
      const data = admissionSnap.data();
      if (data.status === 'approved') {
        notifications.push({
          id: `adm_status_${userEmail}`,
          type: NOTIFICATION_TYPES.ADMISSION_APPROVED,
          title: '🎉 Admission Approved!',
          message: `Your admission for ${data.course} has been approved.`,
          timestamp: data.approvedAt || data.updatedAt || data.createdAt,
          read: false,
          actionable: true,
          route: 'StudentPanel',
          meta: { course: data.course },
        });
      } else if (data.status === 'pending') {
        notifications.push({
          id: `adm_pending_${userEmail}`,
          type: NOTIFICATION_TYPES.ADMISSION_PENDING,
          title: '⏳ Application Under Review',
          message: `Your admission for ${data.course} is pending approval.`,
          timestamp: data.createdAt || data.appliedDate,
          read: true,
          actionable: false,
          route: 'StudentPanel',
          meta: { course: data.course },
        });
      }
    }

    /* 2. PAYMENTS */
    const paymentsRef = collection(db, 'admissions', userEmail.toLowerCase(), 'payments');
    const paymentsSnap = await safeGetDocs(
      query(paymentsRef, orderBy('date', 'desc'), limit(5)),
      'payments'
    );
    
    paymentsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      notifications.push({
        id: `pay_${docSnap.id}`,
        type: NOTIFICATION_TYPES.FEE_PAID,
        title: '✅ Fee Payment Received',
        message: `₹${data.amount} paid via ${data.method || 'Cash'}. ${data.note || ''}`,
        timestamp: data.date || data.createdAt,
        read: false,
        actionable: false,
        route: 'StudentPanel',
        meta: { amount: data.amount },
      });
    });

    /* 3. EXAMS */
    const studentExamsRef = collection(db, 'studentExams');
    const myExamsSnap = await safeGetDocs(
      query(
        studentExamsRef,
        where('studentId', '==', userEmail.toLowerCase()),
        orderBy('assignedAt', 'desc'),
        limit(10)
      ),
      'studentExams'
    );
    
    myExamsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.status === 'assigned') {
        notifications.push({
          id: `sexam_${docSnap.id}`,
          type: NOTIFICATION_TYPES.EXAM_SCHEDULED,
          title: '📝 Exam Assigned',
          message: `${data.examTitle || 'New exam'} scheduled. Check now!`,
          timestamp: data.assignedAt,
          read: false,
          actionable: true,
          route: 'ExamNavigator',
          meta: { examId: docSnap.id },
        });
      } else if (data.status === 'completed' && data.score !== undefined) {
        notifications.push({
          id: `sresult_${docSnap.id}`,
          type: NOTIFICATION_TYPES.EXAM_RESULT,
          title: '📊 Exam Result Declared',
          message: `You scored ${data.score}% in ${data.examTitle || 'your exam'}.`,
          timestamp: data.completedAt,
          read: false,
          actionable: true,
          route: 'ExamNavigator',
          meta: { score: data.score },
        });
      }
    });

    /* 4. CERTIFICATES */
    const certificatesRef = collection(db, 'certificates');
    const certsSnap = await safeGetDocs(
      query(
        certificatesRef,
        where('studentEmail', '==', userEmail.toLowerCase()),
        orderBy('issuedAt', 'desc'),
        limit(5)
      ),
      'certificates'
    );
    
    certsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      notifications.push({
        id: `cert_${docSnap.id}`,
        type: NOTIFICATION_TYPES.CERTIFICATE_READY,
        title: '🎓 Certificate Ready!',
        message: `Your certificate for ${data.course || 'course'} is ready to download.`,
        timestamp: data.issuedAt,
        read: false,
        actionable: true,
        route: 'CertificateNavigator',
        meta: { certificateId: docSnap.id },
      });
    });

  } catch (error) {
    console.log('Error fetching student notifications:', error);
  }

  return notifications.sort((a, b) => {
    const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
    const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
    return dateB - dateA;
  });
};

/* ============================================================
   FETCH ALL NOTIFICATIONS (role-based)
   ============================================================ */
export const fetchAllNotifications = async (user, role) => {
  if (!user) return [];

  const isAdmin = role === 'admin' || 
    ['hridesh027@gmail.com', 'ajaytiwari4@gmail.com', 'chauhansantosh045@gmail.com']
      .includes(user.email?.toLowerCase());

  if (isAdmin) return fetchAdminNotifications();
  return fetchStudentNotifications(user.email);
};

/* ============================================================
   LOCAL READ STATE
   ============================================================ */
const readNotificationIds = new Set();

export const markAsRead = (id) => readNotificationIds.add(id);
export const markAllAsRead = (ids) => ids.forEach(id => readNotificationIds.add(id));
export const isNotificationRead = (id) => readNotificationIds.has(id);
export const getReadNotificationIds = () => Array.from(readNotificationIds);