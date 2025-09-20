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

export function generateOrderConfirmationEmail(data: OrderEmailData): string {
  const baseUrl =
    process.env.WEBSITE_URL || "https://dehlimirchmasalajaat.com/";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Dehli Mirch</title>
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
            <h1 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px;">Order Confirmed! 🎉</h1>
            
            <p style="font-size: 16px; color: #4a5568; margin-bottom: 24px; line-height: 1.7;">
                Thank you for your order, ${
                  data.customerName
                }! We're excited to bring authentic South Asian flavors to your kitchen. 
                Your order has been confirmed and is being prepared with care.
            </p>
            
            <div style="background-color: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px;">Order Details</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 14px; color: #6b7280; font-weight: 500;">Order ID:</span>
                    <span style="font-size: 14px; color: #1a1a1a; font-weight: 600;">#${
                      data.orderId
                    }</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 14px; color: #6b7280; font-weight: 500;">Reference ID:</span>
                    <span style="font-size: 14px; color: #1a1a1a; font-weight: 600;">#${
                      data.refId
                    }</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 14px; color: #6b7280; font-weight: 500;">Order Date:</span>
                    <span style="font-size: 14px; color: #1a1a1a; font-weight: 600;">${
                      data.orderDate
                    }</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 14px; color: #6b7280; font-weight: 500;">Status:</span>
                    <span style="font-size: 14px; color: #1a1a1a; font-weight: 600;">${
                      data.status
                    }</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 14px; color: #6b7280; font-weight: 500;">Payment:</span>
                    <span style="font-size: 14px; color: #1a1a1a; font-weight: 600;">${
                      data.paymentMethod
                    }</span>
                </div>
            </div>
            
            <!-- Items Section -->
            <div style="margin: 24px 0;">
                <h3 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px;">Items Ordered</h3>
                ${data.items
                  .map(
                    (item) => `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                        <img src="${item.image || "/placeholder.svg"}" alt="${
                      item.title
                    }" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; background-color: #f3f4f6;" />
                        <div style="flex: 1;">
                            <div style="font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">${
                              item.title
                            }</div>
                            ${
                              item.variantLabel
                                ? `<div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">${item.variantLabel}</div>`
                                : ""
                            }
                            <div style="font-size: 12px; color: #6b7280;">Quantity: ${
                              item.quantity
                            }</div>
                        </div>
                        <div style="font-size: 14px; font-weight: 600; color: #1a1a1a;">${formatCurrency(
                          item.priceAtPurchase * item.quantity
                        )}</div>
                    </div>
                `
                  )
                  .join("")}
            </div>
            
            <!-- Totals Section -->
            <div style="background-color: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px;">Order Summary</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 14px; color: #6b7280;">Subtotal (${
                      data.items.length
                    } items)</span>
                    <span style="font-size: 14px; color: #1a1a1a; font-weight: 500;">${formatCurrency(
                      data.subtotal
                    )}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 14px; color: #6b7280;">Shipping</span>
                    <span style="font-size: 14px; color: #1a1a1a; font-weight: 500;">${
                      data.shippingFee === 0
                        ? "FREE"
                        : formatCurrency(data.shippingFee)
                    }</span>
                </div>
                ${
                  data.tcsFee && data.tcsFee > 0
                    ? `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 14px; color: #6b7280;">TCS Charges</span>
                        <span style="font-size: 14px; color: #1a1a1a; font-weight: 500;">${formatCurrency(
                          data.tcsFee
                        )}</span>
                    </div>
                `
                    : ""
                }
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0; padding-top: 8px; border-top: 1px solid #e2e8f0; font-weight: 600; font-size: 16px;">
                    <span style="color: #1a1a1a;">Total</span>
                    <span style="color: #1a1a1a; font-weight: 700; font-size: 16px;">${formatCurrency(
                      data.total
                    )}</span>
                </div>
            </div>
            
            <!-- Shipping Information -->
            <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <h3 style="font-size: 16px; font-weight: 600; color: #1e40af; margin-bottom: 8px;">Shipping Information</h3>
                <div style="font-size: 14px; color: #1e40af; line-height: 1.5;">
                    <strong>Delivery Address:</strong><br>
                    ${data.shippingAddress.firstName} ${
    data.shippingAddress.lastName
  }<br>
                    ${data.shippingAddress.address}<br>
                    ${data.shippingAddress.city}${
    data.shippingAddress.postalCode
      ? ", " + data.shippingAddress.postalCode
      : ""
  }<br>
                    Phone: ${data.shippingAddress.phone}<br><br>
                    <strong>Shipping Method:</strong> ${data.shippingMethod}<br>
                    ${
                      data.estimatedDelivery
                        ? `<strong>Estimated Delivery:</strong> ${data.estimatedDelivery}`
                        : ""
                    }
                    ${
                      data.tcsInfo
                        ? `<br><br><strong>TCS Consignment Number:</strong> ${
                            data.tcsInfo.consignmentNumber
                          }<br><strong>TCS Delivery:</strong> ${
                            data.tcsInfo.isOutsideLahore
                              ? "Outside Lahore"
                              : "Within Lahore"
                          }`
                        : ""
                    }
                </div>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${baseUrl}/track-order?orderId=${
    data.orderId
  }" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Track Your Order
                </a>
            </div>
            
            <p style="font-size: 16px; color: #4a5568; margin-bottom: 24px; line-height: 1.7;">
                We'll send you another email when your order ships. In the meantime, explore our collection of 
                premium spices, masalas, pickles, and snacks!
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <div style="font-size: 18px; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 8px;">
                <span style="color: #dc2626;">Dehli</span> <span style="color: #16a34a;">Mirch</span>
            </div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">Authentic Spices, Pickles, Snacks</div>
            
            <div style="display: flex; justify-content: center; gap: 24px; margin-bottom: 16px;">
                <a href="${baseUrl}/category/spices" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Spices</a>
                <a href="${baseUrl}/category/masalas" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Masalas</a>
                <a href="${baseUrl}/category/pickles" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Pickles</a>
                <a href="${baseUrl}/category/snacks" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Snacks</a>
            </div>
            
            <div style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
                This email was sent to ${
                  data.email
                }. If you have any questions, please contact us at support@dehlimirchmasalajaat.com
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Password Reset Email Template
export interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
  expiresIn: string;
}

export function generatePasswordResetEmail(
  data: PasswordResetEmailData
): string {
  const baseUrl =
    process.env.WEBSITE_URL || "https://dehlimirchmasalajaat.com/";

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
            
            <p style="font-size: 16px; color: #4a5568; margin-bottom: 24px; line-height: 1.7;">
                Hello ${
                  data.userName
                }! We received a request to reset your password for your Dehli Mirch account.
            </p>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <div style="font-size: 20px; margin-right: 8px;">⚠️</div>
                    <h3 style="font-size: 16px; font-weight: 600; color: #92400e; margin: 0;">Important Security Notice</h3>
                </div>
                <p style="font-size: 14px; color: #92400e; margin: 0; line-height: 1.5;">
                    This password reset link will expire in <strong>${
                      data.expiresIn
                    }</strong>. If you didn't request this reset, please ignore this email and your password will remain unchanged.
                </p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${
                  data.resetUrl
                }" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.3);">
                    Reset My Password
                </a>
            </div>
            
            <div style="background-color: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px;">Security Tips</h3>
                <ul style="font-size: 14px; color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.6;">
                    <li>Choose a strong password with at least 8 characters</li>
                    <li>Use a combination of letters, numbers, and symbols</li>
                    <li>Don't reuse passwords from other accounts</li>
                    <li>Never share your password with anyone</li>
                </ul>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px; line-height: 1.6;">
                If the button above doesn't work, you can copy and paste this link into your browser:<br>
                <a href="${
                  data.resetUrl
                }" style="color: #dc2626; word-break: break-all;">${
    data.resetUrl
  }</a>
            </p>
            
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 0; line-height: 1.6;">
                If you didn't request this password reset, please contact our support team immediately at 
                <a href="mailto:support@dehlimirchmasalajaat.com" style="color: #dc2626;">support@dehlimirchmasalajaat.com</a>
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <div style="font-size: 18px; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 8px;">
                <span style="color: #dc2626;">Dehli</span> <span style="color: #16a34a;">Mirch</span>
            </div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">Authentic Spices, Pickles, Snacks</div>
            
            <div style="display: flex; justify-content: center; gap: 24px; margin-bottom: 16px;">
                <a href="${baseUrl}" style="color: #6b7280; text-decoration: none; font-size: 14px;">Website</a>
                <a href="${baseUrl}/contact" style="color: #6b7280; text-decoration: none; font-size: 14px;">Contact</a>
                <a href="${baseUrl}/privacy" style="color: #6b7280; text-decoration: none; font-size: 14px;">Privacy</a>
            </div>
            
            <div style="font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Dehli Mirch. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Helper function to format currency (you can import this from your existing utils)
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
