# ProfileEditModal Component

A feature-rich modal component for editing user profiles, adding bows, and managing arrows in the Bueboka application.

## Features

- **Profile Editing**: Update user club information
- **Bow Management**: Add new bows with type selection
- **Arrow Management**: Add new arrows with material selection
- **Tab Navigation**: Easy switching between different forms
- **User Feedback**: Success and error messages for all operations
- **Loading States**: Disabled buttons and visual feedback during operations
- **Responsive Design**: Mobile-friendly layout

## Component Structure

### Files

```
components/
  ProfileEditModal/
    ProfileEditModal.tsx          # Main component
    ProfileEditModal.module.css   # Component styles
    ProfileEditModal.test.tsx     # Test suite
```

## API Integration

The component communicates with the following endpoints:

### POST /api/users (PATCH)

Update user profile information (club, name)

**Request Body:**

```json
{
	"club": "My Club Name",
	"name": "User Name"
}
```

**Response:**

```json
{
	"user": {
		"id": "...",
		"email": "...",
		"name": "...",
		"club": "..."
	}
}
```

### POST /api/bows

Create a new bow

**Request Body:**

```json
{
	"name": "My Recurve Bow",
	"type": "RECURVE"
}
```

**Supported Types:** RECURVE, COMPOUND, LONGBOW, BAREBOW, HORSEBOW, TRADITIONAL, OTHER

**Response:**

```json
{
	"bow": {
		"id": "...",
		"userId": "...",
		"name": "...",
		"type": "..."
	}
}
```

### POST /api/arrows

Create new arrows

**Request Body:**

```json
{
	"name": "My Carbon Arrows",
	"material": "KARBON"
}
```

**Supported Materials:** KARBON, ALUMINIUM, TREVERK

**Response:**

```json
{
	"arrows": {
		"id": "...",
		"userId": "...",
		"name": "...",
		"material": "..."
	}
}
```

## Component Props

```typescript
interface ProfileEditModalProps {
	isOpen: boolean; // Controls modal visibility
	onClose: () => void; // Called when user closes modal
	user: {
		id: string;
		name: string | null;
		email: string;
		club: string | null;
	};
	onProfileUpdate?: () => void; // Called after successful updates
}
```

## Usage

```tsx
import { ProfileEditModal } from '@/components';
import { useState } from 'react';

export function MyProfile() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			<button onClick={() => setIsModalOpen(true)}>Edit Profile</button>

			<ProfileEditModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				user={{
					id: '123',
					name: 'John Doe',
					email: 'john@example.com',
					club: 'My Archery Club',
				}}
				onProfileUpdate={() => {
					// Refresh user data
					fetchUser();
				}}
			/>
		</>
	);
}
```

## Styling

The component uses CSS Modules for scoped styling. Key classes:

- `.overlay` - Semi-transparent backdrop
- `.modal` - Modal container with gradient background
- `.tabs` - Tab navigation area
- `.form` - Form container
- `.input` - Text input and select elements
- `.submitBtn` - Primary action button
- `.message` - Success/error message display

### Customization

To customize colors and styling, modify `ProfileEditModal.module.css`:

```css
.modal {
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 250, 0.98) 100%);
	/* Adjust gradient colors here */
}

.submitBtn {
	background: #053546; /* Change button color */
}
```

## Testing

The component includes comprehensive test coverage using Jest and React Testing Library.

### Running Tests

```bash
npm test ProfileEditModal.test.tsx
```

### Test Categories

1. **Modal Visibility**: Opens/closes correctly, overlay clicks handled
2. **Tab Navigation**: Switching between profile, bow, and arrows tabs
3. **Profile Form**: Input validation, submission, success/error handling
4. **Bow Form**: Type selection, form submission
5. **Arrows Form**: Material selection, form submission
6. **Error Handling**: Network errors, validation errors

### Example Test

```typescript
it('should submit profile form successfully', async () => {
  const user = userEvent.setup();
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

  render(
    <ProfileEditModal
      isOpen={true}
      onClose={mockOnClose}
      user={mockUser}
      onProfileUpdate={mockOnProfileUpdate}
    />
  );

  const clubInput = screen.getByPlaceholderText('Din klubb');
  await user.clear(clubInput);
  await user.type(clubInput, 'Updated Club');

  const submitBtn = screen.getByText('Lagre');
  await user.click(submitBtn);

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith('/api/users', expect.any(Object));
  });
});
```

## Accessibility

The component includes proper accessibility features:

- ARIA labels on buttons (`aria-label`)
- Semantic HTML (form elements, labels)
- Keyboard navigation support
- Focus management
- Color contrast compliance

## Error Handling

All API calls include error handling:

- Network failures are caught and displayed
- Server errors return appropriate messages
- Form submission is disabled during loading
- User receives visual feedback for all operations

## Integration with Min Side Page

The component is integrated into the user dashboard (`/min-side`):

```tsx
import { ProfileEditModal } from '@/components';

export default function MyPage() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return <ProfileEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={userData} onProfileUpdate={fetchUser} />;
}
```

## Performance

- Uses lazy state management
- Only re-renders when necessary
- CSS Module scoping prevents style conflicts
- Optimized form submissions with loading states

## Browser Support

- Chrome/Edge 88+
- Firefox 87+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- [ ] Image upload for profile picture
- [ ] Edit existing bows/arrows
- [ ] Delete bows/arrows
- [ ] Advanced bow/arrow specifications
- [ ] Form validation enhancements
- [ ] Keyboard shortcuts
- [ ] Dark mode support
