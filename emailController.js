const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Функция отправки приветственного письма при регистрации
exports.sendWelcomeEmail = async (email) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to the Portfolio App!',
    text: 'Thank you for registering! Welcome to the Portfolio App. We are glad to have you here!'
  });
};

// Функция отправки кода для двухфакторной аутентификации
exports.sendVerificationCode = async (email, code) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${code}. It will expire in 1 minute.`
  });
};

// Функция отправки уведомления о действиях с айтемами
exports.sendActionNotification = async (email, action, details) => {
  try {
    const subject = `Action Notification: ${action}`;
    const text = `An action was performed on the Portfolio App:\n\n${details}\n\nBest Regards,\nPortfolio App Team`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text
    });
    console.log(`Notification email sent for action: ${action}`);
  } catch (error) {
    console.error('Failed to send notification email:', error.message);
  }
};
