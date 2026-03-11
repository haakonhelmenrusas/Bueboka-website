'use client';

import React from 'react';
import { Input } from '@/components/common/Input/Input';

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
	label: string;
	helpText?: string;
	errorMessage?: string;
	containerClassName?: string;
	labelClassName?: string;
	inputClassName?: string;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
	({ label, helpText, errorMessage, containerClassName, labelClassName, inputClassName, ...props }, ref) => {
		return (
			<Input
				ref={ref}
				label={label}
				type="date"
				helpText={helpText}
				errorMessage={errorMessage}
				containerClassName={containerClassName}
				labelClassName={labelClassName}
				inputClassName={inputClassName}
				{...props}
			/>
		);
	}
);

DateInput.displayName = 'DateInput';
