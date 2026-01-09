import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	buttonStyle?: React.CSSProperties;
	textStyle?: React.CSSProperties;
	label: string;
	width?: number | string;
	/**
	 * FontAwesome icon component to render inside the button (optional)
	 */
	icon?: React.ReactNode;
	disabled?: boolean;
	buttonType?: 'filled' | 'outline';
	loading?: boolean;
	iconPosition?: 'left' | 'right';
	variant?: 'standard' | 'warning';
	size?: 'small' | 'normal';
}

export const Button: React.FC<ButtonProps> = ({
	buttonStyle,
	textStyle,
	label,
	icon,
	width = 'auto',
	disabled,
	buttonType = 'filled',
	loading = false,
	iconPosition = 'left',
	variant = 'standard',
	size = 'normal',
	...props
}) => {
	const getColors = () => {
		switch (variant) {
			case 'warning':
				return {
					main: buttonType === 'outline' ? 'var(--transparent)' : 'var(--error)',
					text: buttonType === 'outline' ? 'var(--error)' : 'var(--white)',
				};
			case 'standard':
			default:
				return {
					main: buttonType === 'outline' ? 'var(--transparent)' : 'var(--primary)',
					text: buttonType === 'outline' ? 'var(--primary)' : 'var(--white)',
				};
		}
	};

	const getSizeStyles = () => {
		switch (size) {
			case 'small':
				return {
					height: 32,
					padding: '4px 16px',
					fontSize: 14,
					iconSize: 12,
				};
			case 'normal':
			default:
				return {
					height: 48,
					padding: '8px 24px',
					fontSize: 16,
					iconSize: 16,
				};
		}
	};

	const { main: buttonColor, text: textColor } = getColors();
	const sizeStyles = getSizeStyles();

	const renderContent = () => {
		const content: React.ReactNode[] = [];

		if (loading) {
			content.push(<span key="loader" className={styles.spinner} style={{ width: sizeStyles.iconSize, height: sizeStyles.iconSize }} />);
		} else {
			if (icon && iconPosition === 'left') {
				content.push(
					<span key="icon-left" style={{ marginRight: 8 }}>
						{icon}
					</span>
				);
			}

			content.push(
				<span key="label" style={textStyle}>
					{label}
				</span>
			);

			if (icon && iconPosition === 'right') {
				content.push(
					<span key="icon-right" style={{ marginLeft: 8 }}>
						{icon}
					</span>
				);
			}
		}

		return content;
	};

	return (
		<button
			className={styles.button}
			style={{
				backgroundColor: buttonType === 'outline' ? 'var(--transparent)' : buttonColor,
				color: textColor,
				border: buttonType === 'outline' ? `1px solid ${buttonColor}` : 'none',
				padding: sizeStyles.padding,
				height: sizeStyles.height,
				width,
				fontSize: sizeStyles.fontSize,
				borderRadius: 8,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 8,
				cursor: disabled || loading ? 'not-allowed' : 'pointer',
				opacity: disabled || loading ? 0.6 : 1,
				transition: 'opacity 0.2s',
				...buttonStyle,
			}}
			disabled={disabled || loading}
			{...props}
		>
			{renderContent()}
		</button>
	);
};
