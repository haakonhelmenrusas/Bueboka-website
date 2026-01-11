import { Button } from '@/components';
import styles from './SocialAuthButtons.module.css';

type Provider = 'google' | 'apple';

type Props = {
	provider: Provider;
	label: string;
	onClick: () => void;
};

const GoogleIcon = ({ size = 18 }: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
		<path
			fill="#FFC107"
			d="M43.611 20.083H42V20H24v8h11.303C33.637 32.657 29.185 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.845 1.154 7.974 3.026l5.657-5.657C34.048 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
		/>
		<path
			fill="#FF3D00"
			d="M6.306 14.691l6.571 4.819C14.655 16.108 19.001 12 24 12c3.059 0 5.845 1.154 7.974 3.026l5.657-5.657C34.048 6.053 29.268 4 24 4c-7.682 0-14.35 4.327-17.694 10.691z"
		/>
		<path
			fill="#4CAF50"
			d="M24 44c5.082 0 9.78-1.947 13.325-5.116l-6.15-5.198C29.169 35.091 26.715 36 24 36c-5.163 0-9.606-3.319-11.26-7.941l-6.522 5.025C9.52 39.556 16.227 44 24 44z"
		/>
		<path
			fill="#1976D2"
			d="M43.611 20.083H42V20H24v8h11.303c-.793 2.24-2.231 4.148-4.128 5.406l.003-.002 6.15 5.198C36.892 39 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
		/>
	</svg>
);

const AppleIcon = ({ size = 18 }: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 384 512" aria-hidden="true" focusable="false">
		<path
			fill="currentColor"
			d="M318.7 268.6c.2 32.4 14.5 57.6 43.2 75.2-5.4 15.8-12.6 30.6-21.6 44.4-12.2 18.8-24.9 37.5-44.8 37.9-19.1.4-25.2-11.4-47-11.4s-28.5 11-46.6 11.8c-19.1.7-33.6-19.2-45.9-38-25.1-38.4-44.3-108.6-18.5-156.1 12.8-23.5 35.7-38.4 60.6-38.8 18.9-.4 36.7 12.7 47 12.7 10.2 0 29.5-15.7 49.8-13.4 8.5.4 32.3 3.4 47.6 25.9-1.2.7-28.4 16.6-28.1 49.9zM259.7 120.6c10.2-12.4 17.1-29.7 15.2-47-14.7.6-32.5 9.8-43 22.2-9.4 10.9-17.7 28.4-15.5 45.1 16.4 1.3 33.1-8.3 43.3-20.3z"
		/>
	</svg>
);

export function SocialAuthButtons({ provider, label, onClick }: Props) {
	const icon = provider === 'google' ? <GoogleIcon /> : <AppleIcon />;

	return (
		<Button
			type="button"
			label={label}
			onClick={onClick}
			buttonType="outline"
			icon={icon}
			width="100%"
			buttonStyle={
				provider === 'google'
					? { backgroundColor: 'var(--white)', borderColor: 'rgba(0,0,0,0.15)', color: 'var(--black)' }
					: { backgroundColor: 'var(--black)', borderColor: 'var(--black)', color: 'var(--white)' }
			}
			textStyle={{ fontWeight: 600 }}
			className={styles.socialButton}
		/>
	);
}
