# ImageUploader Component

A reusable React component for uploading images to ImgBB and automatically generating URLs for forms.

## Features

- **Easy Integration**: Just import and use in any form
- **Auto URL Generation**: Automatically fills the target input field with the generated URL
- **Visual Feedback**: Loading states, success/error messages, and copy-to-clipboard functionality
- **Responsive Design**: Works well on all screen sizes
- **Type Safe**: Written in TypeScript with proper type definitions

## Usage

### Basic Usage

```tsx
import ImageUploader from '@/components/ui/ImageUploader';

// In your component
const [imageUrl, setImageUrl] = useState('');

const handleImageUrlGenerated = (url: string) => {
  setImageUrl(url);
  // You can also update form data directly
  setFormData(prev => ({
    ...prev,
    image: url
  }));
};

// In your JSX
<div className="flex items-center space-x-2">
  <input 
    type="text"
    value={imageUrl}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border border-gray-300 rounded"
    placeholder="Enter image URL"
  />
  <ImageUploader 
    onImageUrlGenerated={handleImageUrlGenerated}
    disabled={isLoading}
  />
</div>
```

### Integration with Form Fields

The component is designed to work seamlessly with existing form input fields. When an image is uploaded, the generated URL is automatically passed to the `onImageUrlGenerated` callback.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onImageUrlGenerated` | `(url: string) => void` | - | Callback function called when image upload is successful |
| `className` | `string` | `''` | Additional CSS classes for styling |
| `disabled` | `boolean` | `false` | Disables the upload functionality |
| `hideUrlDisplay` | `boolean` | `false` | Hides the generated URL display section below the button |

## Setup

### Environment Variables

Add your ImgBB API key to `.env.local`:

```env
NEXT_PUBLIC_IMGBB_API_KEY=your_api_key_here
```

### Dependencies

The component uses:
- React hooks (useState, useRef)
- ImgBB API for image hosting
- Tailwind CSS for styling

## Examples

### 1. Pre-Leased Property Form
Already implemented in `/admin/Pre-Leased/new`

### 2. Vacant Property Form
```tsx
// In vacant property form
<div className="col-span-8">
  <input 
    type="text"
    id="image"
    name="image"
    value={formData.image}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded"
    placeholder="Enter image URL"
  />
</div>
<div className="col-span-2">
  <ImageUploader 
    onImageUrlGenerated={(url) => setFormData(prev => ({...prev, image: url}))}
    disabled={isLoading}
    hideUrlDisplay={true}
  />
</div>
```

### 3. Edit Forms (Hide URL Display)
```tsx
// For edit forms where the URL is shown in the main input
<div className="flex space-x-2">
  <input 
    type="text"
    value={property.image}
    onChange={handleChange}
    className="w-full p-2 border border-gray-300 rounded"
  />
  <ImageUploader 
    onImageUrlGenerated={handleImageUpload}
    hideUrlDisplay={true}
    disabled={saving}
  />
</div>
```

### 4. Plot Property Form
```tsx
// For plot properties
const handleImageUpload = (url: string) => {
  setPlotData(prev => ({
    ...prev,
    image: url
  }));
};

<ImageUploader 
  onImageUrlGenerated={handleImageUpload}
  className="ml-2"
/>
```

## Customization

### Styling
The component uses Tailwind CSS classes and can be customized by:
1. Passing additional classes via `className` prop
2. Modifying the component's internal styles
3. Using CSS modules for more specific styling

### API Integration
To use a different image hosting service:
1. Modify the `API_KEY` and upload URL in the component
2. Update the response handling logic
3. Adjust the `UploadResponse` interface accordingly

## Error Handling

The component includes:
- Network error handling
- Upload failure feedback
- Visual loading states
- Automatic error message clearing

## Browser Support

- Modern browsers with fetch API support
- Clipboard API for copy functionality (with fallback)
- File API for image selection

## Notes

- The component automatically clears the file input after upload
- Generated URLs are immediately available for copying
- Upload progress is shown with a loading spinner
- Success messages auto-disappear after 3 seconds