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
}

export function generateOrderConfirmationEmail(data: OrderEmailData): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dehlimirch.com';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Dehli Mirch</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #f8f9fa;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #16a34a 100%);
            padding: 32px 24px;
            text-align: center;
        }
        
        .logo {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.025em;
            margin-bottom: 8px;
        }
        
        .logo-red {
            color: #ffffff;
        }
        
        .logo-green {
            color: #ffffff;
        }
        
        .tagline {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            font-weight: 500;
        }
        
        .content {
            padding: 32px 24px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 16px;
        }
        
        .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 24px;
            line-height: 1.7;
        }
        
        .order-card {
            background-color: #f8f9fa;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }
        
        .order-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 12px;
        }
        
        .order-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .order-label {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
        }
        
        .order-value {
            font-size: 14px;
            color: #1a1a1a;
            font-weight: 600;
        }
        
        .items-section {
            margin: 24px 0;
        }
        
        .items-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 16px;
        }
        
        .item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .item:last-child {
            border-bottom: none;
        }
        
        .item-image {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            object-fit: cover;
            background-color: #f3f4f6;
        }
        
        .item-details {
            flex: 1;
        }
        
        .item-title {
            font-size: 14px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 4px;
        }
        
        .item-variant {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 2px;
        }
        
        .item-quantity {
            font-size: 12px;
            color: #6b7280;
        }
        
        .item-price {
            font-size: 14px;
            font-weight: 600;
            color: #1a1a1a;
        }
        
        .totals-section {
            background-color: #f8f9fa;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }
        
        .totals-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 16px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .total-row:last-child {
            margin-bottom: 0;
            padding-top: 8px;
            border-top: 1px solid #e2e8f0;
            font-weight: 600;
            font-size: 16px;
        }
        
        .total-label {
            font-size: 14px;
            color: #6b7280;
        }
        
        .total-value {
            font-size: 14px;
            color: #1a1a1a;
            font-weight: 500;
        }
        
        .total-row:last-child .total-value {
            font-weight: 700;
            font-size: 16px;
        }
        
        .shipping-info {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
        }
        
        .shipping-title {
            font-size: 16px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 8px;
        }
        
        .shipping-details {
            font-size: 14px;
            color: #1e40af;
            line-height: 1.5;
        }
        
        .cta-section {
            text-align: center;
            margin: 32px 0;
        }
        
        .cta-button {
            display: inline-block;
            background-color: #dc2626;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.2s;
        }
        
        .cta-button:hover {
            background-color: #b91c1c;
        }
        
        .footer {
            background-color: #f8f9fa;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-brand {
            font-size: 18px;
            font-weight: 800;
            letter-spacing: -0.025em;
            margin-bottom: 8px;
        }
        
        .footer-tagline {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 16px;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 24px;
            margin-bottom: 16px;
        }
        
        .footer-link {
            color: #6b7280;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
        }
        
        .footer-link:hover {
            color: #dc2626;
        }
        
        .footer-note {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 16px;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 24px 16px;
            }
            
            .logo {
                font-size: 24px;
            }
            
            .greeting {
                font-size: 20px;
            }
            
            .footer-links {
                flex-direction: column;
                gap: 12px;
            }
            
            .item {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
            
            .item-image {
                width: 80px;
                height: 80px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <span class="logo-red">Dehli</span> <span class="logo-green">Mirch</span>
            </div>
            <div class="tagline">Heat you can taste, tradition you can trust.</div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <h1 class="greeting">Order Confirmed! 🎉</h1>
            
            <p class="message">
                Thank you for your order, ${data.customerName}! We're excited to bring authentic South Asian flavors to your kitchen. 
                Your order has been confirmed and is being prepared with care.
            </p>
            
            <div class="order-card">
                <h3 class="order-title">Order Details</h3>
                <div class="order-details">
                    <span class="order-label">Order ID:</span>
                    <span class="order-value">#${data.orderId}</span>
                </div>
                <div class="order-details">
                    <span class="order-label">Reference ID:</span>
                    <span class="order-value">#${data.refId}</span>
                </div>
                <div class="order-details">
                    <span class="order-label">Order Date:</span>
                    <span class="order-value">${data.orderDate}</span>
                </div>
                <div class="order-details">
                    <span class="order-label">Status:</span>
                    <span class="order-value">Confirmed</span>
                </div>
                <div class="order-details">
                    <span class="order-label">Payment:</span>
                    <span class="order-value">${data.paymentMethod}</span>
                </div>
            </div>
            
            <!-- Items Section -->
            <div class="items-section">
                <h3 class="items-title">Items Ordered</h3>
                ${data.items.map(item => `
                    <div class="item">
                        <img src="${item.image || '/placeholder.svg'}" alt="${item.title}" class="item-image" />
                        <div class="item-details">
                            <div class="item-title">${item.title}</div>
                            ${item.variantLabel ? `<div class="item-variant">${item.variantLabel}</div>` : ''}
                            <div class="item-quantity">Quantity: ${item.quantity}</div>
                        </div>
                        <div class="item-price">${formatCurrency(item.priceAtPurchase * item.quantity)}</div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Totals Section -->
            <div class="totals-section">
                <h3 class="totals-title">Order Summary</h3>
                <div class="total-row">
                    <span class="total-label">Subtotal (${data.items.length} items)</span>
                    <span class="total-value">${formatCurrency(data.subtotal)}</span>
                </div>
                <div class="total-row">
                    <span class="total-label">Shipping</span>
                    <span class="total-value">${data.shippingFee === 0 ? 'FREE' : formatCurrency(data.shippingFee)}</span>
                </div>
                ${data.tcsFee && data.tcsFee > 0 ? `
                    <div class="total-row">
                        <span class="total-label">TCS Charges</span>
                        <span class="total-value">${formatCurrency(data.tcsFee)}</span>
                    </div>
                ` : ''}
                <div class="total-row">
                    <span class="total-label">Total</span>
                    <span class="total-value">${formatCurrency(data.total)}</span>
                </div>
            </div>
            
            <!-- Shipping Information -->
            <div class="shipping-info">
                <h3 class="shipping-title">Shipping Information</h3>
                <div class="shipping-details">
                    <strong>Delivery Address:</strong><br>
                    ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br>
                    ${data.shippingAddress.address}<br>
                    ${data.shippingAddress.city}${data.shippingAddress.postalCode ? ', ' + data.shippingAddress.postalCode : ''}<br>
                    Phone: ${data.shippingAddress.phone}<br><br>
                    <strong>Shipping Method:</strong> ${data.shippingMethod}<br>
                    ${data.estimatedDelivery ? `<strong>Estimated Delivery:</strong> ${data.estimatedDelivery}` : ''}
                </div>
            </div>
            
            <div class="cta-section">
                <a href="${baseUrl}/track-order" class="cta-button">
                    Track Your Order
                </a>
            </div>
            
            <p class="message">
                We'll send you another email when your order ships. In the meantime, explore our collection of 
                premium spices, masalas, pickles, and snacks!
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-brand">
                <span style="color: #dc2626;">Dehli</span> <span style="color: #16a34a;">Mirch</span>
            </div>
            <div class="footer-tagline">Authentic Spices, Pickles, Snacks</div>
            
            <div class="footer-links">
                <a href="${baseUrl}/category/spices" class="footer-link">Spices</a>
                <a href="${baseUrl}/category/masalas" class="footer-link">Masalas</a>
                <a href="${baseUrl}/category/pickles" class="footer-link">Pickles</a>
                <a href="${baseUrl}/category/snacks" class="footer-link">Snacks</a>
            </div>
            
            <div class="footer-note">
                This email was sent to ${data.email}. If you have any questions, please contact us at support@dehlimirch.com
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Helper function to format currency (you can import this from your existing utils)
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
