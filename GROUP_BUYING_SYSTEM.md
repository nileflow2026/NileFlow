# NileFlow Group Buying System

A full-stack, production-ready **social commerce group buying engine** for the NileFlow platform — inspired by Pinduoduo/Temu. Enables users to collaborate on purchases in real-time to unlock progressively lower prices, driving social virality and conversion.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Data Models](#2-data-models)
3. [Pricing Engine](#3-pricing-engine)
4. [API Reference](#4-api-reference)
5. [Backend Services](#5-backend-services)
6. [Mobile Integration (React Native / Expo)](#6-mobile-integration-react-native--expo)
7. [Web Integration (React)](#7-web-integration-react)
8. [Admin Dashboard](#8-admin-dashboard)
9. [Appwrite Collection Setup](#9-appwrite-collection-setup)
10. [Environment Variables](#10-environment-variables)
11. [Pricing Tier Examples](#11-pricing-tier-examples)
12. [Cron Jobs](#12-cron-jobs)
13. [Notification Events](#13-notification-events)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NileFlow Platform                           │
│                                                                     │
│  ┌──────────────┐   ┌─────────────────┐   ┌────────────────────┐  │
│  │  Mobile App  │   │   Web Platform  │   │  Admin Dashboard   │  │
│  │ (Expo/RN)    │   │  (React 19)     │   │  (React 19)        │  │
│  │              │   │                 │   │                    │  │
│  │GroupBuyCtx.js│   │GroupBuyCtx.jsx  │   │GroupBuyMgmt.jsx    │  │
│  │GroupOrderPage│   │GroupBuyPage.jsx │   │  - Stats cards     │  │
│  │GroupBuyStarter│  │GroupBuySection  │   │  - Activity chart  │  │
│  │PricingTiers  │   │GroupBuyStartModal│  │  - Group table     │  │
│  │ShareButton   │   │GroupBuyCountdown│   │  - Tier editor     │  │
│  │ParticipantList│  │GroupBuyTiers    │   │  /admin/group-buy  │  │
│  └──────┬───────┘   └────────┬────────┘   └─────────┬──────────┘  │
│         │  Appwrite Realtime │  HTTP polling (8s)   │  HTTP       │
│         └────────────────────┴──────────────────────┘             │
│                               │                                    │
│                    ┌──────────▼──────────┐                        │
│                    │   Express Backend   │                        │
│                    │   Node.js 18+ / 5.x │                        │
│                    │                     │                        │
│                    │  groupOrderController│                        │
│                    │  groupOrderUtils    │                        │
│                    │  groupBuyNotif...   │                        │
│                    │  groupBuyCron...    │                        │
│                    └──────────┬──────────┘                        │
│                               │                                    │
│                    ┌──────────▼──────────┐                        │
│                    │   Appwrite BaaS     │                        │
│                    │  - group_orders     │                        │
│                    │  - pricing_tiers    │                        │
│                    │  - group_buy_settings│                       │
│                    │  - notifications    │                        │
│                    └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────┘
```

**Key design principles:**

- **Zero hardcoded logic** — all prices, limits, TTLs, and tier structures are stored in Appwrite and fetched at runtime.
- **Optimistic concurrency** — join operations use a retry loop with exponential backoff to prevent double-join races.
- **Realtime on mobile, polling on web** — Appwrite Realtime WebSocket subscriptions on mobile; 8-second HTTP polling on web for broad browser compatibility.

---

## 2. Data Models

### `group_orders` Collection

| Attribute           | Type     | Description                                                |
| ------------------- | -------- | ---------------------------------------------------------- |
| `productId`         | string   | Appwrite document ID of the product                        |
| `productName`       | string   | Denormalised product name for display                      |
| `productImage`      | string   | URL of product image                                       |
| `basePrice`         | number   | Full retail price (reference)                              |
| `currentPrice`      | number   | Live computed price based on participants                  |
| `maxParticipants`   | number   | Hard cap on group size                                     |
| `participantsCount` | number   | Current number of participants                             |
| `participants`      | string[] | Array of user IDs who joined                               |
| `creatorId`         | string   | User ID of group creator                                   |
| `status`            | string   | `pending` \| `active` \| `completed` \| `expired`          |
| `pricingStrategy`   | string   | `tiered` \| `fixed` \| `linear`                            |
| `tiersJson`         | string   | JSON-serialised array of `{ minParticipants, price }`      |
| `discountPercent`   | number   | Used by `linear` strategy — discount % per new participant |
| `expiresAt`         | string   | ISO-8601 expiry datetime                                   |
| `shareLink`         | string   | Canonical URL for sharing                                  |

### `pricing_tiers` Collection

| Attribute         | Type   | Description                              |
| ----------------- | ------ | ---------------------------------------- |
| `productId`       | string | Links to product                         |
| `minParticipants` | number | Minimum group size to unlock this tier   |
| `price`           | number | Absolute price at this tier              |
| `label`           | string | Human-readable label, e.g. "Group of 5+" |

### `group_buy_settings` Collection

| Attribute         | Type    | Description                                     |
| ----------------- | ------- | ----------------------------------------------- |
| `productId`       | string  | Links to product (unique)                       |
| `enabled`         | boolean | Whether group buying is active for this product |
| `maxGroupSize`    | number  | Override for max participants                   |
| `defaultTtlHours` | number  | Default group lifetime in hours                 |
| `pricingStrategy` | string  | Default strategy for this product               |
| `minDiscount`     | number  | Minimum guaranteed discount %                   |

---

## 3. Pricing Engine

Located in `Backend/utils/groupOrderUtils.js`.

### Strategies

#### `tiered` (recommended)

Uses explicit price tiers stored in `tiersJson`. The highest tier whose `minParticipants ≤ participantsCount` is applied.

```js
tiers = [
  { minParticipants: 1, price: 500 }, // solo — full price
  { minParticipants: 3, price: 420 }, // group of 3+
  { minParticipants: 5, price: 370 }, // group of 5+
  { minParticipants: 10, price: 300 }, // group of 10+
];
// 4 participants → EGP 420
// 7 participants → EGP 370
```

#### `linear`

Each additional participant after the first shaves `discountPercent`% from the base price. Floored at a minimum of 10% of base price.

```
price = basePrice × max(0.10, 1 − (participantsCount − 1) × discountPercent / 100)
```

#### `fixed`

Identical to `tiered` but evaluates using flat discount fractions stored in the tiers array.

### Exported Functions

```js
const {
  computeCurrentPrice, // main dispatcher
  computePriceByTiers, // explicit tier array resolver
  getSavingsAmount, // basePrice - currentPrice
  getSavingsPercent, // "25%" string
  retryUpdateDocumentWithOptimisticLock, // race-safe Appwrite update
} = require("./groupOrderUtils");
```

---

## 4. API Reference

Base URL: `https://nile-flow-backend.onrender.com`  
All group-buy endpoints are prefixed with `/api/group-orders`.

### Create a Group

```http
POST /api/group-orders/create
Content-Type: application/json

{
  "productId": "abc123",
  "productName": "Wireless Earbuds Pro",
  "productImage": "https://cdn.nileflow.com/...",
  "basePrice": 500,
  "maxParticipants": 10,
  "pricingStrategy": "tiered",
  "tiers": [
    { "minParticipants": 1,  "price": 500 },
    { "minParticipants": 3,  "price": 420 },
    { "minParticipants": 5,  "price": 370 },
    { "minParticipants": 10, "price": 300 }
  ],
  "ttlHours": 24,
  "creatorId": "user_xyz"
}
```

**Response `201`:**

```json
{
  "groupOrder": {
    "$id": "grp_...",
    "status": "pending",
    "currentPrice": 500,
    "expiresAt": "2025-08-10T12:00:00.000Z",
    "shareLink": "https://nileflow.com/group/grp_..."
  }
}
```

---

### List Group Orders

```http
GET /api/group-orders?status=pending&productId=abc123&limit=20
```

Supported query params: `status`, `productId`, `creatorId`, `limit`.

**Response `200`:**

```json
{
  "groupOrders": [
    {
      "$id": "grp_...",
      "status": "pending",
      "participantsCount": 4,
      "currentPrice": 420,
      "savingsAmount": 80,
      "savingsPercent": "16.0%",
      "remainingSlots": 6
    }
  ]
}
```

---

### Get Single Group

```http
GET /api/group-orders/:id
```

Returns the full group document enriched with `savingsAmount`, `savingsPercent`, `remainingSlots`, and `shareLink`.

---

### Get Active Groups for a Product

```http
GET /api/group-orders/active?productId=abc123
```

Returns all `pending` groups for a product that have not yet expired — used by the product detail page to show joinable groups.

---

### Join a Group

```http
POST /api/group-orders/:id/join
Content-Type: application/json

{ "userId": "user_xyz" }
```

- Uses optimistic locking (5 retries with exponential backoff) to prevent race conditions.
- Triggers `user_joined` notification immediately via `setImmediate`.
- If `participantsCount` reaches `maxParticipants`, group is auto-completed (`group_completed` notification dispatched).

**Response `200`:**

```json
{
  "message": "Joined group",
  "groupOrder": { ... },
  "currentPrice": 370,
  "savingsPercent": "26.0%"
}
```

---

### Leave a Group

```http
POST /api/group-orders/:id/leave
Content-Type: application/json

{ "userId": "user_xyz" }
```

If the creator leaves, the oldest remaining participant becomes the new creator. Price is recomputed upward.

---

### Update a Group (Admin / Creator)

```http
PATCH /api/group-orders/:id
Content-Type: application/json

{ "maxParticipants": 15, "expiresAt": "2025-08-15T00:00:00.000Z" }
```

---

### Cancel / Delete a Group

```http
DELETE /api/group-orders/:id
```

---

### Expire Overdue Groups (Cron / Internal)

```http
POST /api/group-orders/expire-check
Content-Type: application/json

{ "forceIds": ["grp_abc", "grp_xyz"] }   // optional: force specific IDs
```

Marks all `pending` groups past their `expiresAt` as `expired` and dispatches `group_expired` notifications.

---

### Get Share Data & OG Metadata

```http
GET /api/group-orders/:id/share
```

**Response `200`:**

```json
{
  "shareLink": "https://nileflow.com/group/grp_...",
  "ogTitle": "Join my NileFlow Group Deal — Wireless Earbuds Pro at EGP 370!",
  "ogDescription": "4 people have joined. Only 6 spots left! Pay EGP 370 instead of EGP 500.",
  "ogImage": "https://cdn.nileflow.com/...",
  "messages": {
    "whatsapp": "Join my NileFlow group deal...",
    "telegram": "...",
    "facebook": "...",
    "twitter": "..."
  }
}
```

---

## 5. Backend Services

### `groupBuyNotificationService.js`

```
Backend/services/groupBuyNotificationService.js
```

Dispatches in-app and email notifications for 4 event types:

| Event             | When                           | Recipients                 |
| ----------------- | ------------------------------ | -------------------------- |
| `group_created`   | New group created              | Creator                    |
| `user_joined`     | Someone joins                  | Creator + all participants |
| `group_completed` | Group fills up                 | All participants           |
| `group_expired`   | TTL elapsed without completion | All participants           |

Usage:

```js
const GroupBuyNotificationService = require("./groupBuyNotificationService");

await GroupBuyNotificationService.sendGroupBuyNotification("user_joined", {
  groupId: "grp_...",
  userId: "user_xyz",
  productName: "Wireless Earbuds",
  currentPrice: 370,
  participantsCount: 4,
  maxParticipants: 10,
  participants: ["user_a", "user_b", "user_xyz"],
  shareLink: "https://nileflow.com/group/grp_...",
});
```

---

### `groupBuyCronService.js`

```
Backend/services/groupBuyCronService.js
```

Registers two cron jobs via `node-cron`:

| Job                   | Schedule         | Action                                                |
| --------------------- | ---------------- | ----------------------------------------------------- |
| Expire Overdue Groups | Every 5 minutes  | Marks `pending` groups past `expiresAt` as `expired`  |
| Urgency Reminders     | Every 30 minutes | Notifies participants of groups expiring in < 2 hours |

Initialised in `Backend/src/index.js`:

```js
const GroupBuyCronService = require("../services/groupBuyCronService");
GroupBuyCronService.initialize();
```

---

### `setupGroupBuyCollections.js`

One-time Appwrite collection creation script:

```bash
node Backend/services/setupGroupBuyCollections.js
```

Creates the three collections (`group_orders`, `pricing_tiers`, `group_buy_settings`) in your Appwrite database and prints the resulting collection IDs to add to your `.env` file.

---

## 6. Mobile Integration (React Native / Expo)

### Provider Setup

Wrap your root layout with `GroupBuyProvider`:

```jsx
// app/_layout.jsx
import { GroupBuyProvider } from "../Context/GroupBuyContext";

export default function RootLayout() {
  return (
    <GroupBuyProvider>
      <Stack />
    </GroupBuyProvider>
  );
}
```

### Hook API

```js
const {
  activeGroups, // list of active groups for current product
  currentGroup, // currently viewed group detail
  loading,
  error,
  createGroupBuy, // (params) => Promise<group>
  joinGroupBuy, // (groupId, userId) => Promise<group>
  leaveGroupBuy, // (groupId, userId) => Promise<void>
  fetchGroup, // (groupId) => Promise<group>
  fetchActiveGroups, // (productId) => Promise<group[]>
  getShareData, // (groupId) => Promise<shareData>
  subscribeToGroup, // (groupId) — start Realtime subscription
  unsubscribeFromGroup, // (groupId) — stop subscription
} = useGroupBuy();
```

### Key Components

| Component             | Location                                 | Purpose                             |
| --------------------- | ---------------------------------------- | ----------------------------------- |
| `GroupOrderPage`      | `app/(Screens)/GroupOrderPage.jsx`       | Full group detail screen            |
| `GroupBuyStarter`     | `app/components/GroupBuyStarter.jsx`     | Bottom sheet — start a new group    |
| `GroupBuyCard`        | `app/components/GroupBuyCard.jsx`        | Compact joinable group card         |
| `PricingTiersDisplay` | `app/components/PricingTiersDisplay.jsx` | Visual price ladder                 |
| `CountdownTimer`      | `app/components/CountdownTimer.jsx`      | Live countdown with urgency styling |
| `ParticipantList`     | `app/components/ParticipantList.jsx`     | Avatar list + progress bar          |
| `ShareButton`         | `app/components/ShareButton.jsx`         | WhatsApp / Telegram / native share  |

### Navigate to a Group

```js
import { router } from "expo-router";

router.push({
  pathname: "/(Screens)/GroupOrderPage",
  params: { groupId: group.$id, productId: product.$id },
});
```

### Appwrite Realtime Config

The mobile context subscribes to:

```
databases.<databaseId>.collections.<groupOrderCollectionId>.documents.<groupId>
```

Set `APPWRITE_GROUP_ORDER_COLLECTION_ID` in your `Config/appwriteConfig.js` (or pass it via the `config` object in `GroupBuyContext.js`).

---

## 7. Web Integration (React)

### Provider Setup

`GroupBuyProvider` is registered in `Website/src/App.jsx` inside the `CartProvider`:

```jsx
<CartProvider>
  <GroupBuyProvider>
    <AppContent />
  </GroupBuyProvider>
</CartProvider>
```

### Hook API

Identical surface to the mobile hook. Web uses **HTTP polling every 8 seconds** instead of Appwrite Realtime:

```js
import { useGroupBuy } from "../../Context/GroupBuyContext";

const { createGroupBuy, joinGroupBuy, currentGroup, loading } = useGroupBuy();
```

### Key Components

| Component              | Location                                  | Purpose                                   |
| ---------------------- | ----------------------------------------- | ----------------------------------------- |
| `GroupBuyPage`         | `src/Pages/GroupBuyPage.jsx`              | Standalone page at `/group/:id`           |
| `GroupBuySection`      | `src/components/GroupBuySection.jsx`      | Embeddable section in `ProductDetailPage` |
| `GroupBuyStartModal`   | `src/components/GroupBuyStartModal.jsx`   | Modal for creating a group                |
| `GroupBuyPricingTiers` | `src/components/GroupBuyPricingTiers.jsx` | Price ladder display                      |
| `GroupBuyCountdown`    | `src/components/GroupBuyCountdown.jsx`    | Countdown timer                           |

### Route

```jsx
// Already registered in App.jsx
<Route path="/group/:id" element={<GroupBuyPage />} />
```

### Product Detail Page Integration

`GroupBuySection` is automatically rendered inside `ProductDetailPage.jsx` between the "Add to Cart" block and the reviews section:

```jsx
{
  product && (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-8xl mx-auto">
      <GroupBuySection product={product} />
    </div>
  );
}
```

It displays:

- Current savings banner
- List of all active joinable groups (with countdowns + participant progress)
- "Start a Group" CTA if no active groups exist
- Social proof copy ("X people saved Y% this week")

---

## 8. Admin Dashboard

### Route

```
/admin/group-buy
```

Registered in `AdminDashboard/src/App.jsx`.

### Features

| Section            | Description                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| **Stat Cards**     | Total groups, conversion rate, avg group size, total savings generated   |
| **Activity Chart** | Area chart — groups created vs completed per day (14-day rolling window) |
| **Group Table**    | Full paginated table with status filter, product search, expandable rows |
| **Force Expire**   | Immediately expire a pending group (sends notifications)                 |
| **Delete**         | Hard-delete a group order                                                |
| **Tier Editor**    | Enter a product ID → modal to edit/add/remove pricing tiers              |

### Adding a Nav Link

Add to your admin sidebar component:

```jsx
<NavLink to="/group-buy">
  <Layers className="w-5 h-5" />
  Group Buying
</NavLink>
```

---

## 9. Appwrite Collection Setup

Run the setup script **once** per environment:

```bash
node Backend/services/setupGroupBuyCollections.js
```

This creates:

- `group_orders` — main group buy records
- `pricing_tiers` — per-product tier configurations
- `group_buy_settings` — per-product feature flags and defaults

The script will print the collection IDs:

```
✅ group_orders collection: 6123456789abcdef
✅ pricing_tiers collection: 6123456789abcde0
✅ group_buy_settings collection: 6123456789abcde1
```

Add these to your `.env` file (see next section).

---

## 10. Environment Variables

Add the following to `Backend/.env`:

```env
# ── Group Buying ──────────────────────────────────────────
APPWRITE_GROUP_ORDER_COLLECTION_ID=6123456789abcdef
APPWRITE_PRICING_TIERS_COLLECTION_ID=6123456789abcde0
APPWRITE_GROUP_BUY_SETTINGS_COLLECTION_ID=6123456789abcde1

# ── Existing required vars (for reference) ────────────────
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_NOTIFICATIONS_COLLECTION_ID=your_notifications_collection_id
FRONTEND_URL=https://nileflow.com
```

Also set in the mobile app's `Config/appwriteConfig.js` (or equivalent):

```js
export const Config = {
  // ... existing config
  groupOrderCollectionId: "6123456789abcdef",
};
```

---

## 11. Pricing Tier Examples

### Example 1 — Electronics (Tiered)

```json
{
  "pricingStrategy": "tiered",
  "basePrice": 800,
  "tiers": [
    { "minParticipants": 1, "price": 800 },
    { "minParticipants": 3, "price": 680 },
    { "minParticipants": 5, "price": 600 },
    { "minParticipants": 10, "price": 500 },
    { "minParticipants": 20, "price": 420 }
  ]
}
```

| Group Size | Price   | Savings |
| ---------- | ------- | ------- |
| 1          | EGP 800 | 0%      |
| 3–4        | EGP 680 | 15%     |
| 5–9        | EGP 600 | 25%     |
| 10–19      | EGP 500 | 38%     |
| 20+        | EGP 420 | 48%     |

---

### Example 2 — Fashion (Linear)

```json
{
  "pricingStrategy": "linear",
  "basePrice": 250,
  "discountPercent": 3,
  "maxParticipants": 15
}
```

Each new participant shaves 3% off. At 10 participants: `250 × (1 − 9 × 0.03)` = `EGP 182.50` (27% off).

---

### Example 3 — Food / FMCG (Fixed)

```json
{
  "pricingStrategy": "fixed",
  "basePrice": 120,
  "tiers": [
    { "minParticipants": 5, "discountFraction": 0.1 },
    { "minParticipants": 10, "discountFraction": 0.2 },
    { "minParticipants": 20, "discountFraction": 0.3 }
  ]
}
```

---

## 12. Cron Jobs

| Cron                  | Expression     | Action                                                                  |
| --------------------- | -------------- | ----------------------------------------------------------------------- |
| Expire overdue groups | `*/5 * * * *`  | Marks pending groups past `expiresAt` as `expired`; sends notifications |
| Urgency reminders     | `*/30 * * * *` | Notifies participants of groups expiring within 2 hours                 |

Both jobs are guarded: if `APPWRITE_GROUP_ORDER_COLLECTION_ID` is not set, they skip silently. No startup errors are thrown for missing collection IDs during development.

---

## 13. Notification Events

All notifications are stored in the `notifications` Appwrite collection and optionally emailed via Resend.

| Event Type        | Title                             | Recipients                 |
| ----------------- | --------------------------------- | -------------------------- |
| `group_created`   | "Your Group Deal is Live! 🎉"     | Creator                    |
| `user_joined`     | "{user} joined your group deal!"  | Creator + all participants |
| `group_completed` | "Your Group Deal is Complete! 🎯" | All participants           |
| `group_expired`   | "Your Group Deal Expired 😔"      | All participants           |

### Notification Payload Shape

```json
{
  "userId": "user_xyz",
  "title": "Your Group Deal is Complete! 🎯",
  "body": "10 people joined. Your Wireless Earbuds Pro is now EGP 300 — EGP 200 savings!",
  "type": "group_buy",
  "metadata": {
    "groupId": "grp_...",
    "productId": "prod_...",
    "productName": "Wireless Earbuds Pro",
    "currentPrice": 300,
    "shareLink": "https://nileflow.com/group/grp_..."
  },
  "read": false
}
```

---

## Files Created / Modified

### Backend

| File                                                           | Status                                                  |
| -------------------------------------------------------------- | ------------------------------------------------------- |
| `Backend/utils/groupOrderUtils.js`                             | ✏️ Rewritten — 5 exports, 3 pricing strategies          |
| `Backend/controllers/AdminControllers/groupOrderController.js` | ✏️ Rewritten — proper Appwrite queries, 2 new endpoints |
| `Backend/routes/groupOrderRoutes.js`                           | ✏️ Updated — 10 routes total                            |
| `Backend/src/env.js`                                           | ✏️ Updated — 3 new collection ID vars                   |
| `Backend/src/index.js`                                         | ✏️ Updated — GroupBuyCronService.initialize()           |
| `Backend/services/groupBuyNotificationService.js`              | 🆕 New                                                  |
| `Backend/services/groupBuyCronService.js`                      | 🆕 New                                                  |
| `Backend/services/setupGroupBuyCollections.js`                 | 🆕 New                                                  |

### Mobile App

| File                                               | Status       |
| -------------------------------------------------- | ------------ |
| `Mobileapp/Context/GroupBuyContext.js`             | 🆕 New       |
| `Mobileapp/app/components/CountdownTimer.jsx`      | ✏️ Rewritten |
| `Mobileapp/app/components/ShareButton.jsx`         | ✏️ Rewritten |
| `Mobileapp/app/components/ParticipantList.jsx`     | ✏️ Rewritten |
| `Mobileapp/app/components/PricingTiersDisplay.jsx` | 🆕 New       |
| `Mobileapp/app/components/GroupBuyCard.jsx`        | 🆕 New       |
| `Mobileapp/app/components/GroupBuyStarter.jsx`     | 🆕 New       |
| `Mobileapp/app/(Screens)/GroupOrderPage.jsx`       | ✏️ Rewritten |

### Web

| File                                              | Status                                   |
| ------------------------------------------------- | ---------------------------------------- |
| `Website/Context/GroupBuyContext.jsx`             | 🆕 New                                   |
| `Website/src/components/GroupBuyCountdown.jsx`    | 🆕 New                                   |
| `Website/src/components/GroupBuyPricingTiers.jsx` | 🆕 New                                   |
| `Website/src/components/GroupBuySection.jsx`      | 🆕 New                                   |
| `Website/src/components/GroupBuyStartModal.jsx`   | 🆕 New                                   |
| `Website/src/Pages/GroupBuyPage.jsx`              | 🆕 New                                   |
| `Website/src/Pages/ProductDetailPage.jsx`         | ✏️ Updated — GroupBuySection injected    |
| `Website/src/App.jsx`                             | ✏️ Updated — route + provider registered |

### Admin Dashboard

| File                                              | Status                                        |
| ------------------------------------------------- | --------------------------------------------- |
| `AdminDashboard/src/Pages/GroupBuyManagement.jsx` | 🆕 New                                        |
| `AdminDashboard/src/App.jsx`                      | ✏️ Updated — route registered at `/group-buy` |

---

_Generated for NileFlow Platform — Group Buying System v1.0_
