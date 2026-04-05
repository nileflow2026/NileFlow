# Maintenance Mode Implementation

This implementation provides a comprehensive maintenance mode system for the NileFlow Vendor Dashboard that disables site functionality during inspection periods.

## Features

### Frontend (React)

- **Maintenance Page**: Professional maintenance page with animations and clear messaging
- **Configuration**: Easy toggle via config file
- **Bypass Logic**: Support for allowing specific users to bypass maintenance mode

### Backend (Express.js)

- **API Protection**: All API endpoints return 503 during maintenance
- **Health Checks**: Health endpoints remain accessible
- **Admin Controls**: REST API endpoints to toggle maintenance mode
- **Logging**: Comprehensive logging of maintenance mode changes

## How It Works

### Current Status

🔒 **MAINTENANCE MODE IS CURRENTLY ENABLED**

Both frontend and backend are configured to block normal functionality:

- Frontend shows maintenance page instead of the dashboard
- Backend returns 503 errors for all API requests (except health checks)

### Frontend Implementation

**Configuration**: `src/config/maintenance.js`

```javascript
MAINTENANCE_MODE: true; // Set to false to disable
```

**Components**:

- `MaintenancePage.jsx`: Professional maintenance page with animations
- `App.jsx`: Modified to check maintenance mode before rendering

### Backend Implementation

**Middleware**: `Backend/middleware/maintenance.js`

- Blocks all API requests except health checks
- Returns 503 status with maintenance message
- Configurable allowed endpoints

**Admin Routes**: `Backend/routes/maintenanceRoutes.js`

- `/api/maintenance/status` - Check current status
- `/api/maintenance/toggle` - Toggle mode (requires admin key)
- `/api/maintenance/enable/:key` - Quick enable
- `/api/maintenance/disable/:key` - Quick disable

## Quick Control Methods

### Method 1: Configuration Files

**Frontend**: Edit `src/config/maintenance.js`

```javascript
MAINTENANCE_MODE: false; // Disable maintenance mode
```

**Backend**: Edit `Backend/middleware/maintenance.js`

```javascript
MAINTENANCE_MODE: false; // Disable API maintenance mode
```

### Method 2: CLI Script

From the Backend directory:

```bash
# Check status
node toggle-maintenance.js status

# Enable maintenance mode
node toggle-maintenance.js enable

# Disable maintenance mode
node toggle-maintenance.js disable
```

### Method 3: API Endpoints

```bash
# Check status
curl http://localhost:3000/api/maintenance/status

# Enable (replace 'admin123' with actual admin key)
curl http://localhost:3000/api/maintenance/enable/admin123

# Disable
curl http://localhost:3000/api/maintenance/disable/admin123
```

### Method 4: POST API

```bash
curl -X POST http://localhost:3000/api/maintenance/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": false, "adminKey": "admin123"}'
```

## To Restore Normal Operation

### Quick Restore (Recommended)

1. Edit `src/config/maintenance.js` - set `MAINTENANCE_MODE: false`
2. Edit `Backend/middleware/maintenance.js` - set `MAINTENANCE_MODE: false`
3. Restart both frontend and backend applications

### Via API (if server is running)

```bash
curl http://localhost:3000/api/maintenance/disable/admin123
```

### Via CLI Script

```bash
cd Backend
node toggle-maintenance.js disable
```

## Security Features

- **Admin Key Protection**: API endpoints require admin key (configurable via env var)
- **IP Whitelisting**: Support for allowing specific IPs to bypass
- **Role-based Bypass**: Framework for allowing admin users to bypass

## Environment Variables

Add to your `.env` file:

```env
MAINTENANCE_ADMIN_KEY=your-secure-admin-key-here
```

## Monitoring

The system provides comprehensive logging:

- Maintenance mode changes
- Blocked requests during maintenance
- Admin access attempts

## Files Modified/Created

### Frontend

- `src/pages/MaintenancePage.jsx` ✨ New
- `src/config/maintenance.js` ✨ New
- `src/App.jsx` 🔧 Modified
- `src/App.css` 🔧 Modified

### Backend

- `Backend/middleware/maintenance.js` ✨ New
- `Backend/routes/maintenanceRoutes.js` ✨ New
- `Backend/src/index.js` 🔧 Modified
- `Backend/toggle-maintenance.js` ✨ New

## Testing

1. **Enable maintenance mode**
2. **Visit the website** - Should show maintenance page
3. **Test API endpoints** - Should return 503 errors
4. **Test health endpoints** - Should still work
5. **Disable maintenance mode**
6. **Verify normal operation**

---

**Note**: Remember to disable maintenance mode when inspection is complete to restore normal site functionality.
