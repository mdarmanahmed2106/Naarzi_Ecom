// Defines which status an order is legally allowed to move to FROM its current status.
// An empty array means that status is terminal — no further transitions allowed.
// Keep in sync with the copy in admin/src/app/page.js (separate app, no shared package).
const ALLOWED_TRANSITIONS = {
  processing: ['shipped', 'cancelled'],
  // A shipped-but-not-delivered order can still be cancelled (return-to-sender, lost in transit)
  shipped: ['delivered', 'cancelled'],
  // Terminal: a delivered order goes through the return/refund process, never a plain status flip
  delivered: [],
  cancelled: [],
};

const getAllowedNextStatuses = (currentStatus) => ALLOWED_TRANSITIONS[currentStatus] || [];

const canTransition = (from, to) => getAllowedNextStatuses(from).includes(to);

module.exports = {
  ALLOWED_TRANSITIONS,
  getAllowedNextStatuses,
  canTransition,
};
