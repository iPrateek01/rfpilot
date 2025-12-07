import nodemailer from 'nodemailer';
import { config } from '../../config/env.js';
import logger from '../../config/logger.js';

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, body, inReplyTo = null, references = null }) => {
  try {
    const mailOptions = {
      from: `"${config.company.name}" <${config.company.email}>`,
      to,
      subject,
      text: body,
      ...(inReplyTo && { inReplyTo }),
      ...(references && { references }),
    };

    const info = await getTransporter().sendMail(mailOptions);
    
    logger.info(`Email sent to ${to}:`, info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export const sendRFPToVendor = async (rfp, vendor, emailTemplate) => {
  try {
    const result = await sendEmail({
      to: vendor.email,
      subject: emailTemplate.subject,
      body: emailTemplate.body,
    });

    return result;
  } catch (error) {
    logger.error(`Error sending RFP to vendor ${vendor.email}:`, error);
    throw error;
  }
};