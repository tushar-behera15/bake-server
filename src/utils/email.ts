// import nodemailer from "nodemailer"
// import path from "path";

// // Create a test account or replace with real credentials.
// export const transporter = nodemailer.createTransport({
//     host: config.email.host,
//     port: config.email.port,
//     secure: false,
//     auth: {
//         user: config.email.user,
//         pass: config.email.password,
//     },
// });



// export const registerEmail = async ({ to, url }: {
//     to: string,
//     url: string
// }) => {
//     const info = await transporter.sendMail({
//         from: `"${config.email.senderName}" <${config.email.address}>`,
//         to: to,
//         subject: "Email Verification",
//         text: `Verify Your email. click the link to verify:${url}`,
//         html: html,
//     });
//     return info
// };