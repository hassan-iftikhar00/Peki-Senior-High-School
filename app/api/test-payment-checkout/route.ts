import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Payment Checkout</title>
    </head>
    <body>
      <h1>Test Payment Checkout</h1>
      <p>This is a simulated payment checkout page for testing purposes.</p>
      <button id="completePayment">Complete Payment</button>

      <script>
        document.getElementById('completePayment').addEventListener('click', function() {
          window.opener.postMessage({ type: 'PAYMENT_SUCCESS' }, '*');
          window.close();
        });
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
