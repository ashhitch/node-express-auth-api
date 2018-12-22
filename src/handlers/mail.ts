import htmlToText from 'html-to-text';
import juice from 'juice';
import nodemailer from 'nodemailer';
import { promisify } from 'es6-promisify';
import pug from 'pug';

const transport = nodemailer.createTransport(({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
} as any));

const generateHTML = (filename: any, options = {}) => {
  const html = pug.renderFile(`${__dirname}/../../views/email/${filename}.pug`, options);
  const inlined = juice(html);
  return inlined;
};

export const send = async (options: any) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);

  const mailOptions = {
    from: `Ash <ash@ashleyhitchcock.com>`,
    to: options.user.email,
    subject: options.subject,
    html,
    text
  };
  const sendMail = promisify(transport.sendMail).bind(transport);
  return sendMail(mailOptions);
};
