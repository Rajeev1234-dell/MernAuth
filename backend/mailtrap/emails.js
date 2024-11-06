import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { mailTrapClient, sender } from "./mailtrap.config.js";

export const senderVerificationEmail = async (email, verificationToken) => {  
    const recipient = [{email}]
    try {
        const response = await mailTrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify Your Email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        })
        console.log("Email sent successfully", response);
    } catch (error) {
        console.error(`Error sending verification`, error);
        throw new Error(`Error sending verification email:${error}`);
    }
 }

 export const sendWelcomeEmail = async(email, name) => {
    const recipient = [{email}]
    try {
        const response = await mailTrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "00f23795-0412-48bc-a4da-d5639eca6747",
            template_variables: {
                company_info_name: "Auth Company",
                name: name,
            }
        })
        console.log("Welcome email sent successfully", response);
    } catch (error) {
        console.log("Error sending welcome email", error);
        throw new Error(`Error sending welcome email:${error}`);
    }
 }

 export const sendPasswordResetEmail = async (email, resetURL) => {
    const recipient = [{email}];

    try {
        const response = await mailTrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset Your Password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password Reset"
        })
    } catch (error) {
        console.log(`Error sending password reset email`, error);
        throw new Error(`Error sending password reset email: ${error}`);
    }
 }

 export const sendResetSuccessEmail = async (email) => {
    const recipients = [{email}]

    try {
        const response = await mailTrapClient.send({
            from: sender,
            to: recipients,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset"
        })
        console.log("Password reset email sent successfully", response);
    } catch (error) {
        console.error(`Error sending password reset success email`, error)
        throw new Error(`Error sending password reset success email: ${error}`)
    }
 }