# Inventory Error Debug Guide

## Changes Made to Fix Inventory Errors

### 1. ✅ Enhanced Error Handling in Resolvers
- Added try-catch blocks around all inventory operations
- Replaced `requireHouseAccess` with inline access checks for better error visibility
- Added detailed logging for debugging

### 2. ✅ Improved Frontend Error Handling
- Enhanced cache fallback mechanism
- Better GraphQL error handling
- More detailed error logging

### 3. ✅ Database Access Verification
- Added explicit house ownership checks
- Improved error messages for debugging

## Debug Steps to Follow

### Step 1: Check Backend Server
```bash
cd smart-home
npm run dev
```

Look for any startup errors in the console.

### Step 2: Test Health Endpoint
Open browser or use curl:
```bash
curl http://192.168.29.65:4000/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected",
  "version": "1.0.0"
}
```

### Step 3: Test GraphQL Endpoint
```bash
curl -X POST http://192.168.29.65:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'
```

### Step 4: Check Database Connection
```bash
cd smart-home
npx prisma db push
npx prisma generate
```

### Step 5: Test Authentication
1. Login to the app
2. Check if JWT token is stored in AsyncStorage
3. Verify token is being sent with requests

### Step 6: Test House Selection
1. Make sure a house is selected
2. Check AsyncStorage for 'selectedHouseId'
3. Verify the house belongs to the logged-in user

## Common Issues and Solutions

### Issue 1: "Network request failed: 400"
**Possible Causes:**
- GraphQL syntax error
- Missing required variables
- Authentication failure
- Database connection issue

**Debug:**
1. Check backend console for error details
2. Verify GraphQL query syntax
3. Check if user is authenticated
4. Verify house ID exists and belongs to user

### Issue 2: "House not found or access denied"
**Possible Causes:**
- No house selected
- House doesn't belong to user
- Invalid house ID

**Debug:**
1. Check AsyncStorage for 'selectedHouseId'
2. Verify house exists in database
3. Check house ownership

### Issue 3: Database Connection Issues
**Possible Causes:**
- PostgreSQL not running
- Wrong DATABASE_URL
- Missing migrations

**Debug:**
1. Check if PostgreSQL is running
2. Verify .env DATABASE_URL
3. Run migrations: `npx prisma db push`

## Test Queries for Debugging

### Test 1: Basic GraphQL Schema
```graphql
query {
  __schema {
    types {
      name
    }
  }
}
```

### Test 2: Houses Query (requires auth)
```graphql
query {
  houses {
    id
    name
    description
  }
}
```

### Test 3: Inventory Query (requires auth + house)
```graphql
query GetInventoryItems($houseId: ID!) {
  inventoryItems(houseId: $houseId) {
    id
    name
    category
    location
    quantity
    unit
  }
}
```

## Backend Console Logs to Look For

### Successful Request:
```
✅ Found X inventory items for house [houseId]
```

### Authentication Error:
```
Error in inventoryItems query: Authentication required
```

### House Access Error:
```
Error in inventoryItems query: House not found or access denied for house ID: [houseId]
```

### Database Error:
```
Error in inventoryItems query: [Prisma error details]
```

## Frontend Console Logs to Look For

### Successful Request:
```
📦 Fetching inventory for house: [houseId]
✅ Loaded X inventory items
```

### Network Error:
```
GraphQL Error: Network request failed: 400
📦 Loaded X items from cache (GraphQL failed)
```

### No House Selected:
```
No house selected
```

### No Auth Token:
```
No auth token, skipping inventory fetch
```

## Quick Fix Checklist

- [ ] Backend server is running on port 4000
- [ ] Health endpoint returns "ok"
- [ ] Database is connected
- [ ] User is logged in
- [ ] House is selected
- [ ] House belongs to user
- [ ] Network connectivity is working
- [ ] No GraphQL syntax errors

## If All Else Fails

1. **Clear App Data:**
   - Clear AsyncStorage
   - Logout and login again
   - Select house again

2. **Reset Database:**
   ```bash
   cd smart-home
   npx prisma db push --force-reset
   ```

3. **Check Network:**
   - Try localhost instead of IP
   - Check firewall settings
   - Verify device is on same network

4. **Enable Debug Mode:**
   - Set NODE_ENV=development
   - Check all console logs
   - Use GraphQL Playground if available