import { Button } from '@/components';
import styles from './SocialAuthButtons.module.css';

type Props = {
	label: string;
	onClick: () => void;
	disabled?: boolean;
	loading?: boolean;
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

export function SocialAuthButtons({ label, onClick, disabled, loading }: Props) {
	return (
		<Button
			type="button"
			label={label}
			onClick={onClick}
			buttonType="outline"
			icon={<GoogleIcon />}
			width="100%"
			disabled={disabled}
			loading={loading}
			buttonStyle={{ backgroundColor: 'var(--white)', borderColor: 'rgba(0,0,0,0.15)', color: 'var(--black)' }}
			textStyle={{ fontWeight: 600 }}
			className={styles.socialButton}
		/>
	);
}
