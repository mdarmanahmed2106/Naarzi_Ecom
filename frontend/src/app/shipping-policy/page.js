import PolicyPage from '@/components/PolicyPage';

export const metadata = {
  title: 'Shipping Policy | Naarzi',
  description: 'How Naarzi processes, ships and delivers orders across India: dispatch times, shipping charges, tracking and cancellations.',
};

// From "NAARZI Shipping and Exchange Policies (Updated)", effective 30 October 2026.
// The free-shipping amount and fee here must match the store settings in the admin.
export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping Policy"
      effective="30 October 2026"
      intro={[
        'At NAARZI, we want your shopping experience to be seamless, from placing your order to receiving your chosen pieces. Please read our shipping policy for information about order processing, delivery, and shipping-related concerns.',
      ]}
      sections={[
        { heading: '1. Shipping Coverage', blocks: ['NAARZI currently ships orders across India.'] },
        {
          heading: '2. Order Processing and Dispatch',
          blocks: [
            'Orders are generally processed and dispatched within 7–10 business days after the order is placed.',
            'Dispatch timelines may vary during peak periods, promotional events, public holidays, or due to circumstances beyond our control.',
            'Once your order has been dispatched, you will receive an email containing your tracking details.',
          ],
        },
        {
          heading: '3. Shipping Charges',
          blocks: [
            'We offer the following shipping rates:',
            { list: ['Orders above ₹5,999: Free shipping.', 'Orders of ₹5,999 or below: A shipping fee of ₹149 applies.'] },
            'Applicable shipping charges will be displayed during checkout before you complete your purchase.',
          ],
        },
        {
          heading: '4. Estimated Delivery Time',
          blocks: [
            'Orders are generally delivered within 3–7 days after dispatch.',
            'Delivery timelines are estimates and may vary depending on the delivery location, courier operations, weather conditions, public holidays, or other unforeseen circumstances.',
            'If a significant delay occurs, NAARZI will notify you by email.',
          ],
        },
        {
          heading: '5. Order Tracking',
          blocks: [
            'Once your order has been dispatched, tracking details will be shared with you via email.',
            'Please check your inbox and spam or junk folder for the tracking email. If you have not received your tracking details, contact us at support@naarzi.com.',
          ],
        },
        {
          heading: '6. Payment Methods',
          blocks: [
            'NAARZI currently accepts prepaid orders only. Cash on Delivery (COD) is not available.',
            'An order is considered confirmed once the payment has been successfully processed.',
          ],
        },
        {
          heading: '7. Incorrect or Incomplete Shipping Address',
          blocks: [
            'Customers are responsible for providing accurate and complete shipping information at checkout.',
            'If we identify an address issue, we will attempt to contact you by email to obtain the necessary corrections. Address corrections may result in delivery delays.',
            'If an order must be re-shipped due to an incorrect or incomplete address provided by the customer, additional shipping charges may apply.',
            'Please review your shipping details carefully before placing your order.',
          ],
        },
        {
          heading: '8. Order Cancellation',
          blocks: [
            'Orders may be cancelled only before dispatch.',
            'Once an order has been dispatched, cancellation requests will not be accepted under this policy.',
            'To request a cancellation before dispatch, contact support@naarzi.com as soon as possible, providing your order number. Cancellation is subject to confirmation that the order has not yet been dispatched.',
            'Any applicable refund for an approved cancellation will be handled in accordance with applicable law and the relevant payment process.',
          ],
        },
        {
          heading: '9. Damaged, Defective, or Incorrect Products',
          blocks: [
            'If you receive a damaged, defective, or incorrect product, please email support@naarzi.com within 48 hours of delivery.',
            'Please include:',
            { list: ['Your order number.', 'A clear description of the issue.', 'Clear photographs of the product and its packaging showing the reported issue.'] },
            'Our team will review the information and contact you with the next steps. Please retain the product and its original packaging until the matter has been reviewed.',
          ],
        },
        {
          heading: '10. Lost Shipments or Orders Marked as Delivered',
          blocks: [
            'If your order appears to be lost in transit or is marked as delivered but has not been received, please contact support@naarzi.com.',
            'NAARZI will investigate the matter with the relevant courier partner and determine an appropriate resolution based on the findings and applicable law.',
          ],
        },
        {
          heading: '11. Contact Us',
          blocks: [
            'For shipping-related questions, delivery concerns, or cancellation requests, contact:',
            'Email: support@naarzi.com',
            'Brand: NAARZI',
            'We appreciate your trust in NAARZI and thank you for shopping with us.',
          ],
        },
      ]}
      closing={['Note: This policy is subject to applicable consumer protection and e-commerce laws in India.']}
      related={{ href: '/exchange-policy', label: 'Exchange Policy' }}
    />
  );
}
