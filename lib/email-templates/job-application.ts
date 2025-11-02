// Job Application Email Templates

export interface JobApplicationEmailData {
  applicantName: string;
  jobTitle: string;
  companyName: string;
  status: string;
  customMessage?: string;
  nextSteps?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export const getJobApplicationEmailTemplate = (
  data: JobApplicationEmailData,
  templateType: "shortlisted" | "rejected" | "hired" | "interview" | "custom"
) => {
  const baseTemplate = {
    subject: "",
    html: "",
  };

  switch (templateType) {
    case "shortlisted":
      return {
        subject: `Congratulations! You've been shortlisted for ${data.jobTitle} at ${data.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Congratulations!</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">You've been shortlisted</p>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">Dear ${
                data.applicantName
              },</h2>
              
              <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
                We are pleased to inform you that your application for the position of <strong>${
                  data.jobTitle
                }</strong> at ${data.companyName} has been shortlisted!
              </p>
              
              <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
                Your qualifications and experience have impressed our hiring team, and we would like to move forward with the next steps in our selection process.
              </p>
              
              ${
                data.customMessage
                  ? `
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                  <p style="color: #374151; line-height: 1.6; margin: 0; font-style: italic;">
                    "${data.customMessage}"
                  </p>
                </div>
              `
                  : ""
              }
              
              ${
                data.nextSteps
                  ? `
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1f2937; margin: 0 0 15px 0;">Next Steps:</h3>
                  <p style="color: #374151; line-height: 1.6; margin: 0;">${data.nextSteps}</p>
                </div>
              `
                  : `
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1f2937; margin: 0 0 15px 0;">Next Steps:</h3>
                  <p style="color: #374151; line-height: 1.6; margin: 0;">
                    Our team will be in touch with you within the next few days to schedule the next phase of our interview process. 
                    Please keep an eye on your email for further communication.
                  </p>
                </div>
              `
              }
              
              <p style="color: #374151; line-height: 1.6; margin: 20px 0 0 0;">
                Thank you for your interest in joining our team. We look forward to speaking with you soon!
              </p>
            </div>
            
            <div style="text-align: center; color: #6b7280; font-size: 14px;">
              <p style="margin: 0;">Best regards,<br>The ${
                data.companyName
              } Hiring Team</p>
              ${
                data.contactEmail
                  ? `<p style="margin: 10px 0 0 0;">Email: ${data.contactEmail}</p>`
                  : ""
              }
              ${
                data.contactPhone
                  ? `<p style="margin: 5px 0 0 0;">Phone: ${data.contactPhone}</p>`
                  : ""
              }
            </div>
          </div>
        `,
      };

    case "rejected":
      return {
        subject: `Update on your application for ${data.jobTitle} at ${data.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f3f4f6; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: #374151; margin: 0; font-size: 28px;">Application Update</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">Thank you for your interest</p>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">Dear ${
                data.applicantName
              },</h2>
              
              <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for your interest in the <strong>${
                  data.jobTitle
                }</strong> position at ${
          data.companyName
        } and for taking the time to submit your application.
              </p>
              
              <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
                After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs for this position.
              </p>
              
              ${
                data.customMessage
                  ? `
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #6b7280; margin: 20px 0;">
                  <p style="color: #374151; line-height: 1.6; margin: 0; font-style: italic;">
                    "${data.customMessage}"
                  </p>
                </div>
              `
                  : ""
              }
              
              <p style="color: #374151; line-height: 1.6; margin: 20px 0 0 0;">
                We encourage you to continue monitoring our career opportunities and to apply for positions that align with your skills and interests. 
                We appreciate your understanding and wish you the best in your job search.
              </p>
            </div>
            
            <div style="text-align: center; color: #6b7280; font-size: 14px;">
              <p style="margin: 0;">Best regards,<br>The ${
                data.companyName
              } Hiring Team</p>
              ${
                data.contactEmail
                  ? `<p style="margin: 10px 0 0 0;">Email: ${data.contactEmail}</p>`
                  : ""
              }
            </div>
          </div>
        `,
      };

    case "hired":
      return {
        subject: `Welcome to the team! Job offer for ${data.jobTitle} at ${data.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to the Team!</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">You're hired!</p>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">Dear ${
                data.applicantName
              },</h2>
              
              <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
                We are thrilled to offer you the position of <strong>${
                  data.jobTitle
                }</strong> at ${data.companyName}!
              </p>
              
              <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
                After reviewing your application and conducting our interview process, we are confident that you will be a valuable addition to our team.
              </p>
              
              ${
                data.customMessage
                  ? `
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; margin: 20px 0;">
                  <p style="color: #374151; line-height: 1.6; margin: 0; font-style: italic;">
                    "${data.customMessage}"
                  </p>
                </div>
              `
                  : ""
              }
              
              ${
                data.nextSteps
                  ? `
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1f2937; margin: 0 0 15px 0;">Next Steps:</h3>
                  <p style="color: #374151; line-height: 1.6; margin: 0;">${data.nextSteps}</p>
                </div>
              `
                  : `
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1f2937; margin: 0 0 15px 0;">Next Steps:</h3>
                  <p style="color: #374151; line-height: 1.6; margin: 0;">
                    Our HR team will be in touch with you shortly to discuss the details of your employment, including start date, 
                    compensation, and onboarding process. Please keep an eye on your email for the formal offer letter and additional documentation.
                  </p>
                </div>
              `
              }
              
              <p style="color: #374151; line-height: 1.6; margin: 20px 0 0 0;">
                We are excited to have you join our team and look forward to working with you!
              </p>
            </div>
            
            <div style="text-align: center; color: #6b7280; font-size: 14px;">
              <p style="margin: 0;">Best regards,<br>The ${
                data.companyName
              } Hiring Team</p>
              ${
                data.contactEmail
                  ? `<p style="margin: 10px 0 0 0;">Email: ${data.contactEmail}</p>`
                  : ""
              }
              ${
                data.contactPhone
                  ? `<p style="margin: 5px 0 0 0;">Phone: ${data.contactPhone}</p>`
                  : ""
              }
            </div>
          </div>
        `,
      };

    case "interview":
      return {
        subject: `Interview Invitation for ${data.jobTitle} at ${data.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Interview Invitation</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Let's discuss your application</p>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">Dear ${
                data.applicantName
              },</h2>
              
              <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for your interest in the <strong>${
                  data.jobTitle
                }</strong> position at ${data.companyName}. 
                We were impressed with your application and would like to invite you for an interview.
              </p>
              
              ${
                data.customMessage
                  ? `
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                  <p style="color: #374151; line-height: 1.6; margin: 0; font-style: italic;">
                    "${data.customMessage}"
                  </p>
                </div>
              `
                  : ""
              }
              
              ${
                data.nextSteps
                  ? `
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1f2937; margin: 0 0 15px 0;">Interview Details:</h3>
                  <p style="color: #374151; line-height: 1.6; margin: 0;">${data.nextSteps}</p>
                </div>
              `
                  : `
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1f2937; margin: 0 0 15px 0;">Next Steps:</h3>
                  <p style="color: #374151; line-height: 1.6; margin: 0;">
                    Our team will be in touch with you shortly to schedule a convenient time for your interview. 
                    Please prepare to discuss your experience and how it relates to this position.
                  </p>
                </div>
              `
              }
              
              <p style="color: #374151; line-height: 1.6; margin: 20px 0 0 0;">
                We look forward to meeting you and learning more about your background and interest in this role.
              </p>
            </div>
            
            <div style="text-align: center; color: #6b7280; font-size: 14px;">
              <p style="margin: 0;">Best regards,<br>The ${
                data.companyName
              } Hiring Team</p>
              ${
                data.contactEmail
                  ? `<p style="margin: 10px 0 0 0;">Email: ${data.contactEmail}</p>`
                  : ""
              }
              ${
                data.contactPhone
                  ? `<p style="margin: 5px 0 0 0;">Phone: ${data.contactPhone}</p>`
                  : ""
              }
            </div>
          </div>
        `,
      };

    case "custom":
      return {
        subject: `Update on your application for ${data.jobTitle} at ${data.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f3f4f6; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: #374151; margin: 0; font-size: 28px;">Application Update</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">Message from ${
                data.companyName
              }</p>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">Dear ${
                data.applicantName
              },</h2>
              
              <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for your application for the <strong>${
                  data.jobTitle
                }</strong> position at ${data.companyName}.
              </p>
              
              ${
                data.customMessage
                  ? `
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #6b7280; margin: 20px 0;">
                  <p style="color: #374151; line-height: 1.6; margin: 0;">
                    ${data.customMessage}
                  </p>
                </div>
              `
                  : ""
              }
              
              <p style="color: #374151; line-height: 1.6; margin: 20px 0 0 0;">
                If you have any questions, please don't hesitate to reach out to us.
              </p>
            </div>
            
            <div style="text-align: center; color: #6b7280; font-size: 14px;">
              <p style="margin: 0;">Best regards,<br>The ${
                data.companyName
              } Hiring Team</p>
              ${
                data.contactEmail
                  ? `<p style="margin: 10px 0 0 0;">Email: ${data.contactEmail}</p>`
                  : ""
              }
              ${
                data.contactPhone
                  ? `<p style="margin: 5px 0 0 0;">Phone: ${data.contactPhone}</p>`
                  : ""
              }
            </div>
          </div>
        `,
      };

    default:
      return baseTemplate;
  }
};

