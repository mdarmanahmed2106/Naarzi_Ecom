import PolicyPage from '@/components/PolicyPage';

export const metadata = {
  title: 'Exchange Policy | Naarzi',
  description: 'Naarzi’s exchange-only policy: size and colour exchanges within 14 days of delivery, eligibility, and how to request one.',
};

// From "NAARZI Shipping and Exchange Policies (Updated)", effective 30 October 2026
export default function ExchangePolicyPage() {
  return (
    <PolicyPage
      title="Exchange Policy"
      effective="30 October 2026"
      intro={[
        'At NAARZI, we want you to feel confident about every piece you choose. If you need a different size or colour, or receive a defective or incorrect product, you may request an exchange in accordance with the conditions outlined below.',
        'NAARZI follows an exchange-only policy. We do not offer standard returns or refunds for change of mind or size and colour preferences, except where a refund or other remedy is required under applicable law.',
      ]}
      sections={[
        {
          heading: '1. Exchange Window',
          blocks: [
            'Exchange requests must be submitted within 14 days from the date of delivery.',
            'Requests submitted after this period may not be accepted, except where otherwise required by applicable law.',
          ],
        },
        {
          heading: '2. Eligible Reasons for Exchange',
          blocks: [
            'Exchange requests may be considered for the following reasons:',
            {
              list: [
                'Size exchange: You need a different size.',
                'Colour exchange: You would like a different colour, subject to availability.',
                'Defective product: The product received has a manufacturing defect or damage.',
                'Incorrect product: The product delivered does not match your order.',
              ],
            },
            'All exchange requests are subject to review and approval by NAARZI.',
          ],
        },
        {
          heading: '3. Product Condition and Eligibility',
          blocks: [
            'To qualify for an exchange, the product must meet the following conditions:',
            {
              list: [
                'The product must be unused and unwashed.',
                'Original tags must remain attached.',
                'Original packaging must be intact.',
                'The product must be free from stains, damage, alterations, or signs of wear.',
                'The product must be returned with all original components, where applicable.',
              ],
            },
            'Customers may try on clothing to check the fit, but products showing signs of use beyond a reasonable try-on may not qualify for an exchange.',
            'NAARZI reserves the right to inspect returned products before approving an exchange, subject to applicable law.',
          ],
        },
        {
          heading: '4. Products Excluded from Exchanges',
          blocks: [
            'Discounted, promotional, and products explicitly marked as Final Sale are generally not eligible for exchanges.',
            'However, this exclusion does not apply where a remedy is required for a defective or incorrectly supplied product under applicable law.',
          ],
        },
        {
          heading: '5. How to Request an Exchange',
          blocks: [
            'To initiate an exchange, follow these steps:',
            { h3: 'Step 1: Email Us' },
            'Contact support@naarzi.com within 14 days of delivery.',
            { h3: 'Step 2: Share Your Details' },
            'Include:',
            {
              list: [
                'Your order number.',
                'The product you wish to exchange.',
                'The reason for the exchange.',
                'The preferred replacement size or colour, where applicable.',
                'Clear photographs of the product if it is damaged, defective, or incorrect.',
              ],
            },
            { h3: 'Step 3: Wait for Approval' },
            'Our team will review your request and communicate the outcome and return instructions by email.',
            { h3: 'Step 4: Send the Product Back' },
            'Once your request is approved, follow the return shipping instructions provided by NAARZI. Please do not send products back before receiving approval and instructions.',
            { h3: 'Step 5: Receive Your Replacement' },
            'After we receive and inspect the returned product, the replacement will generally be dispatched within 7–10 business days, subject to product availability and completion of the required checks.',
          ],
        },
        {
          heading: '6. Exchange Shipping Charges',
          blocks: [
            'Shipping charges for exchanges are handled as follows:',
            {
              list: [
                'Size or colour exchanges: The customer is responsible for the applicable exchange shipping charges.',
                'Defective or incorrect products: NAARZI will cover the applicable shipping costs once the issue has been reviewed and confirmed.',
              ],
            },
            'The applicable shipping arrangements and charges will be communicated by email after the exchange request has been approved.',
          ],
        },
        {
          heading: '7. Exchange Pickup and Return Shipping',
          blocks: [
            'Depending on your location and courier service availability, NAARZI will determine whether a reverse pickup can be arranged or whether you need to ship the product back using the instructions provided by our team.',
            'Customers must follow the approved return shipping process to ensure the exchange can be tracked and processed correctly.',
          ],
        },
        {
          heading: '8. Product Availability',
          blocks: [
            'All exchanges are subject to stock availability.',
            'If your requested size or colour is unavailable, NAARZI will review the request and may offer an alternative if one is available.',
            'If a suitable replacement is unavailable, our team will contact you to discuss the available options. Any resolution will be handled in accordance with applicable law.',
          ],
        },
        {
          heading: '9. One Exchange per Order',
          blocks: [
            'NAARZI permits one exchange per order.',
            'Once an exchange has been completed, further exchange requests for the same order will generally not be accepted, except where required by applicable law.',
          ],
        },
        {
          heading: '10. Returns and Refunds',
          blocks: [
            'NAARZI does not offer standard returns or refunds for change of mind, size preferences, or colour preferences.',
            'Where an exchange is unavailable, refunds or other remedies will not be offered solely because of stock unavailability, except where required by applicable law.',
            'Nothing in this policy limits any consumer rights or remedies available under applicable Indian law.',
          ],
        },
        {
          heading: '11. Damaged, Defective, or Incorrect Products',
          blocks: [
            'If you receive a damaged, defective, or incorrect product, please notify us within 48 hours of delivery by emailing support@naarzi.com.',
            'Please include your order number, a description of the issue, and clear photographs showing the product and the reported defect or discrepancy.',
            'Our team will review your request and communicate the next steps.',
          ],
        },
        {
          heading: '12. Contact Us',
          blocks: [
            'For exchange requests and assistance, contact:',
            'Email: support@naarzi.com',
            'Brand: NAARZI',
            'Please include your order number in all correspondence so our team can assist you efficiently.',
          ],
        },
      ]}
      closing={['This policy is subject to applicable consumer protection and e-commerce laws in India. Where a legal right or remedy conflicts with this policy, applicable law will prevail.']}
      related={{ href: '/shipping-policy', label: 'Shipping Policy' }}
    />
  );
}
