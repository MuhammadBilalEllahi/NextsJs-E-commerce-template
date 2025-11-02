// Email templates for marketing campaigns

import { CURRENCY } from "./constants";

export const emailTemplates = {
  default: {
    name: "Default Template",
    description: "Clean and simple template for general communications",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #ea580c, #16a34a); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">
            <span style="color: #dc2626;">Dehli</span> 
            <span style="color: #16a34a;">Mirch</span>
          </h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Heat you can taste, tradition you can trust</p>
        </div>
        
        <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb;">
          {{content}}
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px;">
          <p>You received this email because you subscribed to our newsletter.</p>
          <p>
            <a href="{{unsubscribeUrl}}" style="color: #6b7280; text-decoration: none;">Unsubscribe</a> | 
            <a href="{{baseUrl}}" style="color: #6b7280; text-decoration: none;">Visit our website</a>
          </p>
          <p>&copy; {{year}} Dehli Mirch. All rights reserved.</p>
        </div>
      </div>
    `,
  },

  promotional: {
    name: "Promotional Template",
    description: "Eye-catching template for sales and promotions",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #ea580c, #16a34a); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">
            <span style="color: #dc2626;">Dehli</span> 
            <span style="color: #16a34a;">Mirch</span>
          </h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Heat you can taste, tradition you can trust</p>
        </div>
        
        <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb;">
          <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h2 style="color: #92400e; margin: 0; font-size: 20px;">🔥 Special Offer Inside! 🔥</h2>
          </div>
          {{content}}
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px;">
          <p>You received this email because you subscribed to our newsletter.</p>
          <p>
            <a href="{{unsubscribeUrl}}" style="color: #6b7280; text-decoration: none;">Unsubscribe</a> | 
            <a href="{{baseUrl}}" style="color: #6b7280; text-decoration: none;">Visit our website</a>
          </p>
          <p>&copy; {{year}} Dehli Mirch. All rights reserved.</p>
        </div>
      </div>
    `,
  },

  newsletter: {
    name: "Newsletter Template",
    description: "Structured template for regular newsletters",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #ea580c, #16a34a); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">
            <span style="color: #dc2626;">Dehli</span> 
            <span style="color: #16a34a;">Mirch</span>
          </h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Heat you can taste, tradition you can trust</p>
        </div>
        
        <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb;">
          <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 20px;">
            <h2 style="color: #dc2626; margin: 0; font-size: 18px;">📧 Newsletter</h2>
            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">{{date}}</p>
          </div>
          {{content}}
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px;">
          <p>You received this email because you subscribed to our newsletter.</p>
          <p>
            <a href="{{unsubscribeUrl}}" style="color: #6b7280; text-decoration: none;">Unsubscribe</a> | 
            <a href="{{baseUrl}}" style="color: #6b7280; text-decoration: none;">Visit our website</a>
          </p>
          <p>&copy; {{year}} Dehli Mirch. All rights reserved.</p>
        </div>
      </div>
    `,
  },
};

export function renderTemplate(
  templateName: string,
  variables: Record<string, string>
): string {
  const template =
    emailTemplates[templateName as keyof typeof emailTemplates] ||
    emailTemplates.default;

  let html = template.html;

  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    html = html.replace(regex, value);
  });

  return html;
}

// Order Email Data interface
export interface OrderEmailData {
  orderId: string;
  refId: string;
  email: string;
  customerName: string;
  items: Array<{
    title: string;
    variantLabel?: string;
    quantity: number;
    priceAtPurchase: number;
    image?: string;
  }>;
  subtotal: number;
  shippingFee: number;
  tcsFee?: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode?: string;
    phone: string;
    country: string;
  };
  shippingMethod: string;
  paymentMethod: string;
  orderDate: string;
  estimatedDelivery?: string;
  status: string;
  tcsInfo?: {
    consignmentNumber: string;
    estimatedDelivery: string;
    isOutsideLahore: boolean;
  };
}

// Password Reset Email Data interface
export interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
  expiresIn: string;
}

// Generate order confirmation email
export function generateOrderConfirmationEmail(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; vertical-align: top;">
            ${
              item.image
                ? `<img src="${item.image}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">`
                : ""
            }
          </td>
          <td style="padding: 12px 0; vertical-align: top;">
            <div style="font-weight: 600; color: #1a1a1a;">${item.title}</div>
            ${
              item.variantLabel
                ? `<div style="font-size: 14px; color: #6b7280;">${item.variantLabel}</div>`
                : ""
            }
            <div style="font-size: 14px; color: #6b7280;">Qty: ${
              item.quantity
            }</div>
          </td>
          <td style="padding: 12px 0; text-align: right; vertical-align: top;">
            <div style="font-weight: 600; color: #1a1a1a;"> ${
              CURRENCY.SYMBOL
            } ${item.priceAtPurchase.toLocaleString()}</div>
          </td>
        </tr>
      `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation #${data.orderId} - Dehli Mirch</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #16a34a 100%); padding: 32px 24px; text-align: center;">
            <div style="font-size: 28px; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 8px;">
                <span style="color: #ffffff;">Dehli</span> <span style="color: #ffffff;">Mirch</span>
            </div>
            <div style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">Heat you can taste, tradition you can trust.</div>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
                <h1 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px;">Order Confirmation 🔥</h1>
                
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                        <div style="width: 8px; height: 8px; background-color: #16a34a; border-radius: 50%; margin-right: 8px;"></div>
                        <span style="font-weight: 600; color: #15803d;">Order #${
                          data.orderId
                        } Confirmed!</span>
                </div>
                    <p style="margin: 0; color: #166534; font-size: 14px;">Thank you for your order, ${
                      data.customerName
                    }! We're preparing your spices with care.</p>
                </div>

                <!-- Order Details -->
                <div style="background-color: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <h3 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px;">Order Details</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div>
                            <strong style="color: #dc2626;">Order ID:</strong> ${
                              data.orderId
                            }
                </div>
                        <div>
                            <strong style="color: #dc2626;">Reference ID:</strong> ${
                              data.refId
                            }
                </div>
                        <div>
                            <strong style="color: #dc2626;">Order Date:</strong> ${new Date(
                              data.orderDate
                            ).toLocaleDateString()}
                </div>
                        <div>
                            <strong style="color: #dc2626;">Status:</strong> ${
                              data.status
                            }
                        </div>
                    </div>
            </div>
            
                <!-- Items -->
                <div style="margin: 24px 0;">
                    <h3 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px;">Order Items</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid #e5e7eb;">
                                <th style="text-align: left; padding: 8px 0; font-weight: 600; color: #6b7280;">Image</th>
                                <th style="text-align: left; padding: 8px 0; font-weight: 600; color: #6b7280;">Product</th>
                                <th style="text-align: right; padding: 8px 0; font-weight: 600; color: #6b7280;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                </div>

                <!-- Order Summary -->
                <div style="background-color: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <h3 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px;">Order Summary</h3>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Subtotal:</span>
                        <span>${
                          CURRENCY.SYMBOL
                        } ${data.subtotal.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Shipping (${data.shippingMethod}):</span>
                        <span>${
                          CURRENCY.SYMBOL
                        } ${data.shippingFee.toLocaleString()}</span>
                    </div>
                    ${
                      data.tcsFee
                        ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>TCS Fee:</span>
                        <span>${
                          CURRENCY.SYMBOL
                        } ${data.tcsFee.toLocaleString()}</span>
                    </div>
                    `
                        : ""
                    }
                    <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 18px; color: #dc2626; border-top: 2px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
                        <span>Total:</span>
                        <span>${
                          CURRENCY.SYMBOL
                        } ${data.total.toLocaleString()}</span>
                    </div>
                </div>

                <!-- Shipping Address -->
                <div style="background-color: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <h3 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px;">Shipping Address</h3>
                    <div style="color: #6b7280;">
                        <div>${data.shippingAddress.firstName} ${
    data.shippingAddress.lastName
  }</div>
                        <div>${data.shippingAddress.address}</div>
                        <div>${data.shippingAddress.city}${
    data.shippingAddress.postalCode
      ? `, ${data.shippingAddress.postalCode}`
      : ""
  }</div>
                        <div>${data.shippingAddress.country}</div>
                        <div>Phone: ${data.shippingAddress.phone}</div>
                    </div>
                </div>

                ${
                  data.tcsInfo
                    ? `
                <!-- TCS Information -->
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <h3 style="font-size: 18px; font-weight: 600; color: #92400e; margin-bottom: 16px;">🚚 Shipping Information</h3>
                    <div style="color: #92400e;">
                        <div><strong>Consignment Number:</strong> ${
                          data.tcsInfo.consignmentNumber
                        }</div>
                        <div><strong>Estimated Delivery:</strong> ${
                          data.tcsInfo.estimatedDelivery
                        }</div>
                        <div><strong>Delivery Area:</strong> ${
                          data.tcsInfo.isOutsideLahore
                            ? "Outside Lahore"
                            : "Lahore"
                        }</div>
            </div>
                </div>
                `
                    : ""
                }
            
            <div style="text-align: center; margin: 32px 0;">
                    <a href="${
                      process.env.NEXT_PUBLIC_BASE_URL ||
                      "http://localhost:3000"
                    }/track-order?orderId=${data.orderId}" 
                       style="display: inline-block; background: linear-gradient(135deg, #dc2626, #16a34a); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Track Your Order
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <div style="font-size: 18px; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 8px;">
                <span style="color: #dc2626;">Dehli</span> <span style="color: #16a34a;">Mirch</span>
            </div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">Authentic Spices, Pickles, Snacks</div>
                <div style="font-size: 12px; color: #9ca3af;">
                    Thank you for choosing Dehli Mirch! We appreciate your business.
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Generate password reset email
export function generatePasswordResetEmail(
  data: PasswordResetEmailData
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Dehli Mirch</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #16a34a 100%); padding: 32px 24px; text-align: center;">
            <div style="font-size: 28px; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 8px;">
                <span style="color: #ffffff;">Dehli</span> <span style="color: #ffffff;">Mirch</span>
            </div>
            <div style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">Heat you can taste, tradition you can trust.</div>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
            <h1 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px;">Reset Your Password 🔐</h1>
            
                <p style="color: #6b7280; margin-bottom: 24px;">Hello ${data.userName},</p>
                
                <p style="color: #6b7280; margin-bottom: 24px;">
                    We received a request to reset your password for your Dehli Mirch account. 
                    Click the button below to create a new password:
                </p>
            
            <div style="text-align: center; margin: 32px 0;">
                    <a href="${data.resetUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #dc2626, #16a34a); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Reset Password
                </a>
            </div>
            
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                        <div style="width: 8px; height: 8px; background-color: #f59e0b; border-radius: 50%; margin-right: 8px;"></div>
                        <span style="font-weight: 600; color: #92400e;">Important Security Notice</span>
                    </div>
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                        This link will expire in ${data.expiresIn}. If you didn't request this password reset, 
                        please ignore this email and your password will remain unchanged.
                    </p>
            </div>
            
                <p style="color: #6b7280; margin-bottom: 24px;">
                    If the button above doesn't work, you can copy and paste this link into your browser:
                </p>
                
                <div style="background-color: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0; word-break: break-all;">
                    <code style="color: #dc2626; font-size: 14px;">${data.resetUrl}</code>
                </div>

                <p style="color: #6b7280; margin-bottom: 24px;">
                    For security reasons, this link can only be used once. If you need to reset your password again, 
                    please request a new password reset from our website.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <div style="font-size: 18px; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 8px;">
                <span style="color: #dc2626;">Dehli</span> <span style="color: #16a34a;">Mirch</span>
            </div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">Authentic Spices, Pickles, Snacks</div>
                <div style="font-size: 12px; color: #9ca3af;">
                    This email was sent from a secure system. Please do not reply to this email.
            </div>
        </div>
    </div>
</body>
</html>
  `;
}
