import React from 'react';
import styles from './EquipmentSkeleton.module.css';

export const EquipmentItemSkeleton: React.FC = () => {
	return (
		<div className={styles.skeletonItem}>
			<div className={styles.skeletonLeft}>
				<div className={styles.skeletonName} />
				<div className={styles.skeletonMeta} />
			</div>
			<div className={styles.skeletonIcon} />
		</div>
	);
};

export const EquipmentListSkeleton: React.FC<{ count?: number }> = ({ count = 2 }) => {
	return (
		<>
			{Array.from({ length: count }).map((_, index) => (
				<EquipmentItemSkeleton key={index} />
			))}
		</>
	);
};
