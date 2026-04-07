const express = require("express");
const router = express.Router();
const {
  createGroupOrder,
  listGroupOrders,
  getGroupOrder,
  updateGroupOrder,
  cancelGroupOrder,
  joinGroupOrder,
  leaveGroupOrder,
  expireGroupOrders,
  getActiveGroupsForProduct,
  getGroupShareData,
} = require("../controllers/AdminControllers/groupOrderController");

// ── Public / customer endpoints ───────────────────────────────────────────────

// GET  /api/group-orders/active?productId=XYZ   — active groups for a product
router.get("/active", getActiveGroupsForProduct);

// GET  /api/group-orders/:id/share              — share link + OG metadata
router.get("/:id/share", getGroupShareData);

// POST /api/group-orders/create                 — create a new group buy
router.post("/create", createGroupOrder);

// POST /api/group-orders/                       — alias for create
router.post("/", createGroupOrder);

// GET  /api/group-orders/                       — list (filter: productId, status, creatorId)
router.get("/", listGroupOrders);

// GET  /api/group-orders/:id                    — single group order detail
router.get("/:id", getGroupOrder);

// PATCH /api/group-orders/:id                   — admin / owner update
router.patch("/:id", updateGroupOrder);

// DELETE /api/group-orders/:id                  — admin / owner cancel
router.delete("/:id", cancelGroupOrder);

// POST /api/group-orders/:id/join               — join a group
router.post("/:id/join", joinGroupOrder);

// POST /api/group-orders/:id/leave              — leave a group
router.post("/:id/leave", leaveGroupOrder);

// ── Internal / cron endpoints ─────────────────────────────────────────────────

// POST /api/group-orders/expire-check           — trigger expiry (called by cron)
router.post("/expire-check", expireGroupOrders);

module.exports = router;
