import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: `"No Reply BookStore " <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(" Email sent to:", to);
  } catch (error) {
    console.error(" Error sending email:", error);
  }
};

export default sendEmail;



// const sendEmail = async (to, subject, html) => {
//   // ✅ 1. Basic validation
//   if (!to || !subject || !html) {
//     console.warn("⚠️ Missing required email parameters.");
//     return;
//   }

//   try {
//     // ✅ 2. Create reusable transporter object (mail server connection)
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     // ✅ 3. Define email content and metadata
//     const mailOptions = {
//       from: {
//         name: "No Reply - BookStore 📚",
//         address: process.env.EMAIL_USER,
//       },
//       to,
//       subject,
//       html,
//     };

//     // ✅ 4. Send the email
//     const info = await transporter.sendMail(mailOptions);

//     // ✅ 5. Log success
//     console.log(`✅ Email successfully sent to: ${to}`);
//     console.log(`📨 Message ID: ${info.messageId}`);

//   } catch (error) {
//     // ✅ 6. Detailed error logging
//     console.error("❌ Failed to send email.");
//     console.error("Reason:", error.message);

//     if (error.response) {
//       console.error("Server response:", error.response);
//     }
//   }
// };

