# Google Drive URL Implementation for Franchise Investor Discovery Kit

## Overview
Added functionality to upload and link Google Drive URLs for franchise Investor Discovery Kits. When users click the "Investor Discovery Kit" download button on franchise cards, they are now directed to the provided Google Drive link.

## Implementation Details

### 1. Database Schema Updates
- Added `investorDiscoveryKitUrl` field to franchise data structure
- Field type: `string` (optional)
- Stores Google Drive URL or any other document URL

### 2. Admin Interface Changes

#### New Franchise Creation (`/admin/franchise/new`)
- Added "Investor Discovery Kit" URL input field
- Field validation: URL type input with placeholder
- Live preview button that opens the Google Drive link in new tab
- Helpful description text explaining the field purpose

#### Franchise Editing (`/admin/franchise/edit/[id]`)
- Added "Investor Discovery Kit URL" field to existing forms
- Consistent styling with other document fields
- Real-time validation and preview functionality

### 3. Frontend Display Changes

#### Franchise Cards (`FranchiseCard.tsx`)
- Updated "Investor Discovery Kit" button behavior:
  - **With URL**: Clickable link that opens Google Drive in new tab
  - **Without URL**: Disabled state with gray styling
- Prevents modal opening when clicking download button
- Added `stopPropagation()` to prevent card click conflicts

#### Interface Updates
- Updated all Franchise interfaces across the application:
  - `src/app/admin/franchise/page.tsx`
  - `src/app/franchise/page.tsx` 
  - `src/app/franchise/[id]/page.tsx`
  - `src/components/franchise/FranchiseModal.tsx`
  - `src/components/franchise/FranchiseContactModal.tsx`
  - `src/components/franchise/FranchiseCard.tsx`

### 4. User Experience Flow

1. **Admin adds franchise**:
   - Fills out regular franchise details
   - Adds Google Drive URL in "Investor Discovery Kit" field
   - Can preview the link before saving
   - Saves franchise with URL included

2. **User views franchise**:
   - Sees franchise card with "Investor Discovery Kit" button
   - If URL exists: Button is clickable and opens Google Drive
   - If no URL: Button appears disabled/grayed out

3. **Document Access**:
   - Clicking button opens Google Drive in new tab
   - No authentication required on frontend
   - Direct access to shared documents

### 5. Technical Implementation

```typescript
// Franchise interface addition
interface Franchise {
  // ... existing fields
  investorDiscoveryKitUrl?: string;
}

// Button rendering logic
{franchise.investorDiscoveryKitUrl ? (
  <a 
    href={franchise.investorDiscoveryKitUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="w-full flex justify-center items-center bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded transition-colors"
    onClick={(e) => e.stopPropagation()}
  >
    <FaDownload className="mr-2" />
    Investor Discovery Kit
  </a>
) : (
  <div className="w-full flex justify-center items-center bg-gray-400 text-gray-200 py-2 px-4 rounded cursor-not-allowed">
    <FaDownload className="mr-2" />
    Investor Discovery Kit
  </div>
)}
```

### 6. Form Field Implementation

```tsx
{/* Google Drive URL for Investor Discovery Kit */}
<div className="row mb-3 flex">
  <label htmlFor="inputInvestorKit" className="col-sm-2 col-form-label w-1/6 text-gray-700 font-medium">
    Investor Discovery Kit
  </label>
  <div className="col-sm-10 position-relative w-5/6">
    <div className="flex">
      <input 
        type="url" 
        className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
        id="inputInvestorKit"
        name="investorDiscoveryKitUrl"
        value={franchise.investorDiscoveryKitUrl}
        onChange={handleChange} 
        placeholder="https://drive.google.com/file/d/your-file-id/view"
      />
      {franchise.investorDiscoveryKitUrl && (
        <div className="ml-2">
          <a 
            href={franchise.investorDiscoveryKitUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center h-10 w-12 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            title="Preview Google Drive Link"
          >
            <DownloadIcon />
          </a>
        </div>
      )}
    </div>
    <div className="text-xs text-gray-500 mt-1">
      Enter the Google Drive URL for the Investor Discovery Kit (will be used for download button on franchise cards)
    </div>
  </div>
</div>
```

## Usage Instructions

### For Administrators:
1. Navigate to `/admin/franchise/new` or edit existing franchise
2. Scroll to "Investor Discovery Kit" field
3. Enter the Google Drive shareable link
4. Use the preview button to test the link
5. Save the franchise

### For Users:
1. Browse franchises on the main franchise page
2. Look for "Investor Discovery Kit" button on franchise cards
3. Click the button to access documents (if available)
4. Button will be grayed out if no documents are available

## Security Considerations
- Links open in new tabs with `noopener noreferrer`
- No direct file hosting on the platform
- Relies on Google Drive's sharing permissions
- Admin controls what documents are accessible

## Benefits
- Centralized document management through Google Drive
- Easy sharing and permission management
- Professional document presentation
- Reduced server storage requirements
- Real-time document updates without code changes

## Testing Completed
✅ Form field validation (URL type)
✅ Button state management (enabled/disabled)
✅ Link opening in new tab
✅ Interface consistency across all franchise components
✅ No compilation errors
✅ Server running successfully on http://localhost:3001