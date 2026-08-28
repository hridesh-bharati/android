// diit\src\services\emailService.js

// src/services/emailService.js
const API_BASE_URL = "https://drishteeindia.com"; 

export const sendEmailNotification = async (to, subject, html) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/send-mail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    });

    const data = await response.json().catch(() => ({ success: false }));
    return data.success;
  } catch (err) {
    console.error("Email Fetch Error:", err);
    return false;
  }
};

// ==========================================
// SUPPORT / CONTACT QUERY TEMPLATE (Sent to Admin)
// ==========================================
export const supportTemplate = (data) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    <div style="background-color: #0284c7; padding: 20px; text-align: center; color: white;">
      <h2 style="margin: 0; font-size: 22px; letter-spacing: 1px;">DRISHTEE COMPUTER CENTRE</h2>
      <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">New App Support Inquiry</p>
    </div>

    <div style="padding: 25px; background-color: #ffffff;">
      <p style="color: #555; font-size: 15px;">Hello Admin, you have received a new query from the mobile application.</p>
      
      <div style="background-color: #f8f9fa; border-left: 4px solid #0284c7; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #777; font-size: 13px; width: 100px;">Full Name</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${data.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #777; font-size: 13px;">Mobile No</td>
            <td style="padding: 8px 0;">
              <a href="tel:${data.mobile}" style="color: #0284c7; text-decoration: none; font-weight: bold;">${data.mobile}</a>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 8px 0 2px 0; color: #777; font-size: 13px;">Email ID</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 0 0 8px 0; color: #333; font-weight: 500;">${data.email || 'N/A'}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 8px 0 2px 0; color: #777; font-size: 13px;">Subject/Course</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 0 0 8px 0; color: #333; font-weight: 500; line-height: 1.4;">${data.title}</td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 20px;">
        <strong style="display: block; color: #333; margin-bottom: 8px; font-size: 14px; text-transform: uppercase;">Message:</strong>
        <div style="background-color: #fffdee; border: 1px solid #ffeeba; padding: 15px; border-radius: 8px; color: #555; font-style: italic; line-height: 1.6;">
          "${data.query}"
        </div>
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <a href="https://wa.me/91${data.mobile}" style="background-color: #25D366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">
          Reply on WhatsApp
        </a>
      </div>
    </div>

    <div style="background-color: #f1f1f1; padding: 15px; text-align: center; color: #888; font-size: 12px;">
      <p style="margin: 0;">Sent via Drishtee App Support System</p>
      <p style="margin: 5px 0 0;">Date: ${new Date().toLocaleString('en-IN')}</p>
    </div>
  </div>
`;

// ======================================================
// ADMIN ADMISSION ALERT EMAIL
// Sent to ADMIN when new student admission is submitted
// ======================================================
export const adminAdmissionAlertTemplate = (data) => `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: #fdfdfd;">
    <div style="background: #001529; color: #ffca28; padding: 20px; text-align: center;">
      <h2 style="margin: 0;">NEW ADMISSION ALERT</h2>
      <p style="margin: 5px 0 0; color: #fff; font-size: 14px;">Drishtee Computer Centre - Online Portal</p>
    </div>
    
    <div style="padding: 25px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${data.photoUrl}" alt="Student" style="width: 100px; height: 120px; border: 3px solid #001529; object-fit: cover;" />
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="background: #f4f4f4;"><td style="padding: 10px; font-weight: bold; width: 40%;">Student Name:</td><td style="padding: 10px;">${data.name}</td></tr>
        <tr><td style="padding: 10px; font-weight: bold;">Course Applied:</td><td style="padding: 10px; color: #d32f2f; font-weight: bold;">${data.course}</td></tr>
        <tr style="background: #f4f4f4;"><td style="padding: 10px; font-weight: bold;">Father's Name:</td><td style="padding: 10px;">${data.fatherName}</td></tr>
        <tr><td style="padding: 10px; font-weight: bold;">Mobile Number:</td><td style="padding: 10px;"><a href="tel:${data.mobile}">${data.mobile}</a></td></tr>
        <tr style="background: #f4f4f4;"><td style="padding: 10px; font-weight: bold;">Email ID:</td><td style="padding: 10px;">${data.email}</td></tr>
        <tr><td style="padding: 10px; font-weight: bold;">Branch:</td><td style="padding: 10px;">${data.branch}</td></tr>
        <tr style="background: #f4f4f4;"><td style="padding: 10px; font-weight: bold;">Qualification:</td><td style="padding: 10px;">${data.qualification}</td></tr>
      </table>

      <div style="margin-top: 25px; background: #fff8e1; padding: 15px; border: 1px solid #ffe082; border-radius: 5px;">
        <strong>Address:</strong><br/>
        ${data.address}
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <a href="https://drishteeindia.com/admin" style="background: #001529; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Admin Panel</a>
      </div>
    </div>
    
    <div style="background: #eee; padding: 10px; text-align: center; font-size: 11px; color: #777;">
      Applied on: ${new Date().toLocaleString('en-IN')}
    </div>
  </div>
`;

// ======================================================
// DELETE ACCOUNT / STUDENT RECORD REMOVED EMAIL
// This email is sent to STUDENT when admin deletes
// or deactivates their admission record
// ======================================================
export const deleteAccountTemplate = (student) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #fff;">
    
    <div style="background-color: #4b5563; padding: 25px; text-align: center; color: white;">
      <h2 style="margin: 0; font-size: 20px; letter-spacing: 1px; text-transform: uppercase;">Record Deactivated</h2>
      <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.8;">Drishtee Computer Centre</p>
    </div>

    <div style="padding: 35px; color: #444;">
      <p style="font-size: 16px;">Hello <strong>${student.name}</strong>,</p>
      <p style="line-height: 1.6; font-size: 15px;">
        This is to officially inform you that your student record for the course 
        <strong style="color: #111;">${student.course || 'Enrolled Course'}</strong> 
        has been removed from our institute by the administrator.
      </p>
      
      <div style="background-color: #fffaf0; border-left: 4px solid #ed8936; border-radius: 4px; padding: 15px; margin: 25px 0; border: 1px solid #feebc8;">
        <p style="margin: 0; font-size: 13px; color: #744210; line-height: 1.5;">
          <strong>Important:</strong> If you believe this action was taken in error, or if you wish to re-enroll for upcoming sessions, please reach out to us immediately using the button below.
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://drishteeindia.com/contact-us" 
           style="background-color: #4b5563; color: white; padding: 12px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
           Contact Support / Re-Enroll
        </a>
      </div>

      <p style="font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; pt-3">
        Best Regards,<br/>
        <strong style="color: #000;">Administration Department</strong><br/>
        <span>Drishtee Computer Centre</span>
      </p>
    </div>

    <div style="background-color: #f9fafb; padding: 15px; text-align: center; color: #9ca3af; font-size: 11px; border-top: 1px solid #eee;">
      <p style="margin: 0;">This is an automated system-generated notification. Please do not reply directly to this email.</p>
    </div>
  </div>
`;

// ======================================================
// STUDENT ADMISSION CONFIRMATION EMAIL
// Sent to STUDENT when admin approves admission
// ======================================================
export const admissionTemplate = (student, regNo) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); background-color: #fff;">
    <div style="background-color: #10b981; padding: 25px 20px; text-align: center; color: white;">
      <h2 style="margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 700;">DRISHTEE COMPUTER CENTRE</h2>
      <p style="margin: 8px 0 0; font-size: 15px; opacity: 0.9; font-weight: 300;">Official Admission Confirmation</p>
    </div>

    <div style="padding: 35px; background-color: #ffffff;">
      <h3 style="color: #10b981; margin-top: 0; font-size: 20px;">Congratulations, ${student.name}!</h3>
      <p style="color: #444; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
        Your application has been successfully processed. We are pleased to welcome you as a student at <strong>Drishtee Computer Centre</strong>.
      </p>
      
      <div style="background-color: #f9fdfb; border: 1px solid #d1f2e5; border-left: 5px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #666; font-size: 14px; width: 35%;">Reg No:</td>
            <td style="padding: 10px 0; color: #10b981; font-weight: bold; font-size: 17px;">${regNo}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666; font-size: 14px; vertical-align: top;">Course Enrolled:</td>
            <td style="padding: 10px 0; color: #333; font-weight: 600; font-size: 15px; line-height: 1.4;">
              ${student.course || 'General Computer Course'}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666; font-size: 14px;">Branch / Centre:</td>
            <td style="padding: 10px 0; color: #333; font-weight: 500; font-size: 15px;">
              ${student.branch || student.centerCode || 'Main Campus'}
            </td>
          </tr>
        </table>
      </div>

      <p style="color: #777; font-size: 14px; line-height: 1.5;">
        <strong>Note:</strong> Please use your Registration Number for all future communications.
      </p>

      <div style="margin-top: 35px; text-align: center;">
        <a href="https://drishteeindia.com" style="background-color: #10b981; color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; font-size: 16px;">
          Go to Student Portal
        </a>
      </div>
    </div>
    <div style="background-color: #f7f7f7; padding: 18px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee;">
      <p style="margin: 0;">This is an automated enrollment notification from Drishtee IT System.</p>
    </div>
  </div>
`;

// ======================================================
// EXAM PERMIT EMAIL
// Sent when admin assigns exam access to student
// ======================================================
export const examPermitTemplate = (student, exam) => {
  const durationValue = exam.duration || 1;
  const durationText = `${durationValue} ${durationValue <= 1 ? 'Hour' : 'Hours'}`;

  // 🔥 DATABASE se aane wala timing format (AM/PM)
  // startTime manual hota hai, endTime calculate ho chuka hai
  const examDate = exam.date || "As per Schedule";

  // Start Time ko AM/PM mein convert karne ka safe check (agar DB mein raw 24hr format ho toh)
  let formattedStart = exam.startTime;
  try {
    if (exam.startTime && !exam.startTime.includes('M')) { // Agar AM/PM nahi hai toh convert karo
      formattedStart = new Date(`2000-01-01T${exam.startTime}`).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    }
  } catch (e) { formattedStart = exam.startTime; }

  const formattedEnd = exam.endTime || "As per Schedule";

  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); background-color: #fff;">
    
    <div style="background-color: #fc0038; padding: 30px 20px; text-align: center; color: white;">
      <div style="font-size: 40px; margin-bottom: 10px;">📝</div>
      <h2 style="margin: 0; font-size: 26px; letter-spacing: 1.5px; font-weight: 800; text-transform: uppercase;">Examination Permit</h2>
      <p style="margin: 8px 0 0; font-size: 15px; opacity: 0.9; font-weight: 300;">Drishtee Online Examination System</p>
    </div>

    <div style="padding: 35px; background-color: #ffffff;">
      <h3 style="color: #333; margin-top: 0; font-size: 20px;">Dear ${student.name},</h3>
      <p style="color: #555; font-size: 15px; line-height: 1.6;">
        Your exam access has been successfully activated. Please follow the schedule strictly:
      </p>
      
      <div style="background-color: #fff5f6; border: 1px solid #fed7d7; border-left: 6px solid #fc0038; padding: 25px; border-radius: 8px; margin: 25px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #777; font-size: 14px; width: 40%;">Exam Title</td>
            <td style="padding: 10px 0; color: #333; font-weight: 700; font-size: 16px;">${exam.title}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #777; font-size: 14px;">Exam Date</td>
            <td style="padding: 10px 0; color: #333; font-weight: 600;">${examDate}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #777; font-size: 14px;">Log-in Time</td>
            <td style="padding: 10px 0; color: #fc0038; font-weight: 800; font-size: 17px;">${formattedStart}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #777; font-size: 14px;">Closing Time</td>
            <td style="padding: 10px 0; color: #333; font-weight: 600;">${formattedEnd}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #777; font-size: 14px;">Total Duration</td>
            <td style="padding: 10px 0; color: #333; font-weight: 600;">${durationText}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px dashed #ccc; margin-bottom: 25px;">
        <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.5;">
          <strong>Quick Instructions:</strong><br>
          • Ensure you have a stable internet connection.<br>
          • Your portal will automatically close at <strong>${formattedEnd}</strong>.<br>
          • Do not refresh or switch tabs during the exam.
        </p>
      </div>

      <div style="margin-top: 10px; text-align: center;">
        <a href="https://drishteeindia.com/login" style="background-color: #fc0038; color: white; padding: 16px 45px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 5px 15px rgba(252,0,56,0.3); font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
          Start Examination Now
        </a>
      </div>
    </div>

    <div style="background-color: #f7f7f7; padding: 20px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #eee;">
      <p style="margin: 0; font-weight: bold; color: #777;">DRISHTEE COMPUTER CENTRE</p>
      <p style="margin: 5px 0 0;">Notification Date: ${new Date().toLocaleDateString('en-IN')}</p>
    </div>
  </div>
`;
};

// ======================================================
// CERTIFICATE GENERATED EMAIL
// Sent when student completes course and certificate ready
// ======================================================
export const certificateTemplate = (student, percent, issDate) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); background-color: #fff;">
    
    <div style="background-color: #3b82f6; padding: 25px 20px; text-align: center; color: white;">
      <h2 style="margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 700;">CERTIFICATE GENERATED</h2>
      <p style="margin: 8px 0 0; font-size: 15px; opacity: 0.9;">Drishtee Computer Centre</p>
    </div>

    <div style="padding: 35px; background-color: #ffffff;">
      <h3 style="color: #3b82f6; margin-top: 0;">Great Job, ${student.name}!</h3>
      <p style="color: #555; font-size: 15px; line-height: 1.6;">
        We are proud to inform you that your course has been completed and your <strong>Certificate</strong> is now ready for download.
      </p>
      
      <div style="background-color: #f0f7ff; border: 1px solid #d1e3ff; border-left: 5px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">Final Score:</td>
            <td style="padding: 8px 0; color: #3b82f6; font-weight: bold; font-size: 18px;">${percent}%</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Course:</td>
            <td style="padding: 8px 0; color: #333; font-weight: 500;">${student.course || 'General'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Issue Date:</td>
            <td style="padding: 8px 0; color: #333; font-weight: 500;">${issDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Reg No:</td>
            <td style="padding: 8px 0; color: #333;">${student.regNo}</td>
          </tr>
        </table>
      </div>

      <p style="color: #777; font-size: 14px;">You can login to your student portal to view and download your digital certificate.</p>

      <div style="margin-top: 35px; text-align: center;">
        <a href="https://drishteeindia.com/download-certificate" style="background-color: #3b82f6; color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(59,130,246,0.25);">
          Download Certificate
        </a>
      </div>
    </div>

    <div style="background-color: #f7f7f7; padding: 15px; text-align: center; color: #999; font-size: 11px;">
      <p style="margin: 0;">Keep learning, keep growing! - Team Drishtee</p>
    </div>
  </div>
`;

// ======================================================
// EMAIL VERIFICATION (OTP) TEMPLATE
// Sent to STUDENT before admission submission
// ======================================================
export const otpTemplate = (name, otp) => `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <div style="background: #001529; color: #ffca28; padding: 20px; text-align: center;">
      <h2 style="margin: 0; font-size: 20px;">Email Verification</h2>
      <p style="margin: 5px 0 0; color: #fff; font-size: 13px;">Drishtee Computer Centre</p>
    </div>
    <div style="padding: 30px; text-align: center; background: #fff;">
      <p style="color: #444; font-size: 16px;">Hello <b>${name}</b>,</p>
      <p style="color: #666; font-size: 14px;">Your One-Time Password (OTP) for admission is:</p>
      <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; display: inline-block; margin: 15px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #001529;">${otp}</span>
      </div>
      <p style="color: #888; font-size: 12px; margin-top: 20px;">This OTP is valid for 2 minutes. Do not share it with anyone.</p>
    </div>
    <div style="background: #f9f9f9; padding: 15px; text-align: center; color: #bbb; font-size: 11px;">
      &copy; 2026 Drishtee Computer Centre | Online Admission Portal
    </div>
  </div>
`;

// ======================================================
// Sent Fee report 
// ======================================================
export const feePaymentTemplate = (student, payment, summary) => `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #fff;">
    <div style="background-color: #1a237e; padding: 25px; text-align: center; color: white;">
      <h2 style="margin: 0; font-size: 20px; letter-spacing: 1px;">FEE PAYMENT RECEIVED</h2>
      <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.8;">Drishtee Computer Centre</p>
    </div>

    <div style="padding: 30px; color: #333;">
      <p style="font-size: 16px;">Dear <b>${student.name}</b>,</p>
      <p>This is to confirm that we have successfully received your fee payment. Details are as follows:</p>
      
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #eee;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Amount Paid:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #2e7d32; font-size: 18px;">₹${payment.amount}.00</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Date:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 500;">${payment.date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Payment Mode:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 500;">${payment.method}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Payment For:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 500;">${payment.note}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #e8eaf6; padding: 15px; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #1a237e; font-size: 14px;">
          <b>Current Outstanding Balance: ₹${summary.balance}.00</b>
        </p>
      </div>

      <p style="font-size: 13px; color: #777; margin-top: 25px; line-height: 1.5;">
        * This is an automated receipt. You can download the official PDF receipt from your student dashboard.
      </p>

      <div style="text-align: center; margin-top: 30px;">
        <a href="https://www.drishteeindia.com/student/dashboard" style="background-color: #1a237e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
          View My Dashboard
        </a>
      </div>
    </div>

    <div style="background-color: #f1f1f1; padding: 15px; text-align: center; color: #888; font-size: 11px;">
      <p style="margin: 0;">Thank you for choosing Drishtee Computer Centre</p>
    </div>
  </div>
`;


// ======================================================
// FEE DUE REMINDER EMAIL (HINDI)
// Sent automatically to student if monthly fee is overdue
// ======================================================
export const feeDueHindiTemplate = (student, dueInfo) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
    
    <div style="background-color: #d32f2f; padding: 22px 20px; text-align: center; color: white;">
      <h2 style="margin: 0; font-size: 22px; letter-spacing: 1px;">दृष्टि कंप्यूटर सेंटर</h2>
      <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">फीस भुगतान सूचना / Fee Due Reminder</p>
    </div>

    <div style="padding: 28px 25px; color: #333333; line-height: 1.6;">
      <h3 style="color: #d32f2f; margin-top: 0; font-size: 18px;">नमस्ते ${student.name},</h3>
      
      <p style="font-size: 15px; margin-bottom: 20px;">
        यह ईमेल आपको सूचित करने के लिए भेजा गया है कि आपके कंप्यूटर कोर्स (<b>${student.course || 'Enrolled Course'}</b>) की मासिक फीस की नियत तिथि (Due Date) समाप्त हो चुकी है।
      </p>

      <div style="background-color: #fff5f5; border: 1px solid #ffcdd2; border-left: 5px solid #d32f2f; border-radius: 8px; padding: 18px; margin-bottom: 22px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #666; width: 45%;">छात्र का नाम:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #111;">${student.name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">रजिस्ट्रेशन नं:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #d32f2f;">${student.regNo || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">एडमिशन तिथि:</td>
            <td style="padding: 6px 0; font-weight: 500;">${student.admissionDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">फीस देय तिथि (Due Date):</td>
            <td style="padding: 6px 0; font-weight: bold; color: #d32f2f;">${dueInfo.dueDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">कुल बकाया राशि (Dues):</td>
            <td style="padding: 6px 0; font-weight: bold; color: #d32f2f; font-size: 16px;">₹${dueInfo.monthlyFee}.00</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 14px; color: #444;">
        कृपया अपनी कक्षाएं निर्बाध रूप से जारी रखने के लिए जल्द से जल्द सेंटर कार्यालय में जाकर या ऑनलाइन माध्यम से अपनी फीस जमा करें।
      </p>

      <div style="margin-top: 30px; text-align: center;">
        <a href="https://drishteeindia.com" style="background-color: #d32f2f; color: white; padding: 12px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block; font-size: 15px;">
          स्टूडेंट पोर्टल पर जाएं
        </a>
      </div>

      <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; font-size: 13px; color: #777;">
        <p style="margin: 0;"><b>नोट:</b> यदि आप फीस पहले ही जमा कर चुके हैं, तो कृपया कार्यालय में संपर्क करके रसीद अपडेट करवाएं।</p>
      </div>
    </div>

    <div style="background-color: #f7f7f7; padding: 14px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee;">
      <p style="margin: 0;">दृष्टि कंप्यूटर सेंटर - महाराजगंज</p>
    </div>
  </div>
`;