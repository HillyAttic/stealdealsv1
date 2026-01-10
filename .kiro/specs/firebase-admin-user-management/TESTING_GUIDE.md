# Testing Guide: Firebase Admin User Management

This guide will help you test the newly implemented Firebase Admin User Management system.

## Prerequisites

1. You must be logged in as a **superuser** to access the admin management features
2. Your dev server should be running (`npm run dev`)

## Test Scenarios

### 🧪 Test 1: Access the Firebase Admin User Management Page

**Steps:**
1. Navigate to `/admin/subusers` in your browser
2. You should see the "Firebase Admin User Management" page

**Expected Results:**
- ✅ Page loads successfully
- ✅ Shows statistics: Total Admins, Superusers, Subusers
- ✅ Shows a "Create New Admin" button
- ✅ Shows a table listing all existing Firebase admin users

**If you see an error:**
- Check if you're logged in as a superuser
- Check the browser console for errors
- Verify `/api/admin/firebase-users` endpoint is accessible

---

### 🧪 Test 2: Create a New Subuser with Limited Permissions

**Steps:**
1. Click the "Create New Admin" button
2. Fill in the form:
   - **Name:** Test Subuser
   - **Email:** testsubuser@example.com
   - **Password:** test123456
   - **Role:** Subuser (Limited Access)
3. Under "Page Access", check only **Vacant** and **Plots**
4. Under "Property Permissions":
   - ✅ Check "View properties created by others"
   - ❌ Leave "Edit properties created by others" unchecked
5. Click "Create Admin User"

**Expected Results:**
- ✅ Success message appears: "Successfully created admin user: testsubuser@example.com"
- ✅ Form closes after 2 seconds
- ✅ New user appears in the user list
- ✅ User shows as "Subuser" role
- ✅ Permissions summary shows "2 pages, View Others"

---

### 🧪 Test 3: Create a Superuser

**Steps:**
1. Click "Create New Admin" again
2. Fill in the form:
   - **Name:** Test Superuser
   - **Email:** testsuperuser@example.com
   - **Password:** super123456
   - **Role:** Superuser (Full Access)
3. Notice that all permissions are automatically checked and disabled
4. Click "Create Admin User"

**Expected Results:**
- ✅ Success message appears
- ✅ New superuser appears in the list
- ✅ User shows as "Superuser" role
- ✅ Permissions summary shows "Full Access"

---

### 🧪 Test 4: Test Subuser Login and Permissions

**Steps:**
1. Log out from your current superuser account
2. Navigate to `/admin/login`
3. Log in with the subuser credentials:
   - Email: testsubuser@example.com
   - Password: test123456
4. After login, check the navigation sidebar

**Expected Results:**
- ✅ Dashboard is visible
- ✅ Users is visible
- ✅ Wishlist Analytics is visible
- ✅ **Vacant** is visible (we gave permission)
- ✅ **Plots** is visible (we gave permission)
- ❌ **Franchise** is NOT visible (no permission)
- ❌ **Pre-Leased** is NOT visible (no permission)
- ❌ **Manage Admins** is NOT visible (not a superuser)

---

### 🧪 Test 5: Test Property Ownership Filtering

**Steps:**
1. While logged in as the subuser (testsubuser@example.com)
2. Navigate to `/admin/vacant`
3. Note the properties you see
4. Create a new vacant property
5. Log out and log back in as your original superuser
6. Navigate to `/admin/vacant`

**Expected Results:**
- ✅ Subuser sees ALL properties (because we gave "View properties created by others" permission)
- ✅ Subuser can create a new property
- ✅ Superuser sees ALL properties including the one created by subuser

**Alternative Test (if you want to test restricted view):**
1. As superuser, go to `/admin/subusers`
2. Create another subuser WITHOUT "View properties created by others" permission
3. Log in as that new subuser
4. Navigate to `/admin/vacant`
5. You should ONLY see properties created by that specific subuser

---

### 🧪 Test 6: Test Property Edit Permissions

**Steps:**
1. As superuser, create a vacant property
2. Note the property ID
3. Log out and log in as testsubuser@example.com (who does NOT have "Edit properties created by others")
4. Try to edit the property created by the superuser
5. Try to edit a property created by the subuser themselves

**Expected Results:**
- ❌ Subuser CANNOT edit properties created by superuser (should get 403 error)
- ✅ Subuser CAN edit properties they created themselves

**Alternative Test (with edit permission):**
1. Create a subuser WITH "Edit properties created by others" permission
2. Log in as that subuser
3. Try to edit any property
4. Should succeed

---

### 🧪 Test 7: Test Superuser Override

**Steps:**
1. Log in as a superuser
2. Navigate to any property page
3. Try to edit ANY property (regardless of who created it)

**Expected Results:**
- ✅ Superuser can edit ALL properties
- ✅ Superuser can delete ALL properties
- ✅ Superuser can access ALL pages

---

## 🐛 Common Issues and Solutions

### Issue: "Failed to fetch admin users"
**Solution:** Check that Firebase Admin SDK is properly configured and the database rules allow access

### Issue: "Permission denied" when creating users
**Solution:** Ensure you're logged in as a superuser, not a subuser

### Issue: Can't see the "Manage Admins" link
**Solution:** Only superusers can see this link. Check your role.

### Issue: Properties not filtering correctly
**Solution:** 
- Check the browser console for errors
- Verify the `createdBy` field exists on properties
- Clear your browser cache and cookies

### Issue: Permission changes not taking effect
**Solution:** Permissions are cached for 5 minutes. Wait or restart the server to clear cache.

---

## 📊 Verification Checklist

After testing, verify:

- [ ] Can create subusers with custom permissions
- [ ] Can create superusers with full access
- [ ] Subusers only see allowed pages in navigation
- [ ] Subusers are redirected when accessing restricted pages
- [ ] Property ownership filtering works correctly
- [ ] Edit permissions are enforced properly
- [ ] Superusers have full access to everything
- [ ] User list displays correctly with roles and permissions
- [ ] Form validation works (try invalid emails, short passwords)
- [ ] Error messages are clear and helpful

---

## 🎯 Next Steps After Testing

1. **If everything works:** Mark tasks 4 and 11.1 as complete in tasks.md
2. **If issues found:** Document them and fix before proceeding
3. **Consider adding:** 
   - User editing functionality (update permissions)
   - User deletion functionality
   - Password reset for admin users
   - Audit log for admin actions

---

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check the server logs for API errors
3. Verify Firebase configuration in `.env` file
4. Ensure all dependencies are installed (`npm install`)
