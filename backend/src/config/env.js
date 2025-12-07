import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  cors_origin: process.env.CORS_ORIGIN,
  
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  
  imap: {
    host: process.env.IMAP_HOST,
    port: parseInt(process.env.IMAP_PORT),
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASS,
    tls: process.env.IMAP_TLS === 'true',
  },
  
//   company: {
//     email: process.env.COMPANY_EMAIL,
//     name: process.env.COMPANY_NAME,
//   },
};