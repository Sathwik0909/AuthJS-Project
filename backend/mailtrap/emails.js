  import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
  import { mailtrapClient,sender } from "./mailtrap.config.js";

  export const sendVerificationEmail = async (email,verificationToken)=>{
    const recipient = [{email}];

    try{
      // console.log(sender)
      const response = await mailtrapClient.send({
        from: sender,
        to:recipient,
        subject:"Verify your mail",
        html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}",verificationToken),
        category: "email verification"
      })
    }catch(err){
      console.log("error sending verification",err);
      throw new Error(`Error sending verication mail: ${err}`);
    }
  }


  export const sendWelcomeEmail = async (email,name) =>{
    const recipient = [{email}];
    try{
      const response = await mailtrapClient.send({
        from: sender,
        to: recipient,
        template_uuid: "9cbf74c6-2639-4792-aa8a-68f89941dc12",
        template_variables: {
          "company_info_name": "Auth Company",
          "name": name,
        }
      });

      console.log("Welcome email sent successfully",response);

    }catch(err){
      console.log(" Error sending welcome mail",err);
      throw new Error(`Error sending  welcome email ${err}`);
    }
  }
  

  export const sendPasswordResetMail = async (email,resetURL)=>{
    const recipient = [{email}];
    
    try{
        const response = await mailtrapClient.send({
          from: sender,
          to:recipient,
          subject:"Reset Password",
          html : PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
          category:"Reset Password"
        })
    }catch(err){
        console.log("Error sending reset email",err);
        throw new Error(`Error Sending Reset email ${err}`);
    }
  }

  export const sendResetSuccessMail = async (email)=>{
    const recipient = [{email}];
    try{
        const response = await mailtrapClient.send({
          from:sender,
          to:recipient,
          subject:"Password Reset Suucessful",
          html: PASSWORD_RESET_SUCCESS_TEMPLATE,
          category:"Password Reset"
        });

        console.log("Password reset is Successful",response);

    }catch(err){
      throw new Error(`Error in Password Success ${err}`);
    }
  }