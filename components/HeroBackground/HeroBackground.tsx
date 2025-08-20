'use client';

import React, { useEffect, useRef } from 'react';
import styles from './HeroBackground.module.css';

const svgPaths = {
	p15a63d90:
		'M584.79 524.078C537.135 514.763 489.614 497.888 443.984 472.643C338.819 414.727 263.083 324.41 224.473 223.834C203.413 168.888 207.733 106.247 235.138 53.461L262.948 0.000183566C259.168 34.0207 259.438 68.3112 263.353 102.332C275.773 210.333 325.994 315.905 406.859 400.011C444.794 439.432 489.614 474.263 540.375 502.208C554.955 510.308 569.805 517.598 584.655 524.078H584.79Z',
	p18412d80:
		'M408.334 572.815C356.247 562.633 304.308 544.189 254.434 516.596C139.489 453.294 56.7105 354.578 14.5098 244.649C-8.5088 184.593 -3.78705 116.127 26.1666 58.4324L56.563 0C52.4314 37.1843 52.7265 74.6636 57.0056 111.848C70.5807 229.893 125.471 345.282 213.857 437.21C255.32 480.297 304.308 518.366 359.789 548.911C375.725 557.764 391.956 565.732 408.187 572.815H408.334Z',
	p1ecea700:
		'M795.602 283.032C767.684 342.526 729.877 398.99 682.083 450.299C572.247 568.278 430.286 636.068 287.712 651.12C209.68 659.405 130.523 631.527 71.5581 576.71L11.8607 521.107C54.3438 538.088 98.6833 549.986 144.019 556.799C287.463 578.619 440.437 550.022 575.885 473.312C639.416 437.342 699.221 390.685 752.365 333.641C767.628 317.169 782.058 300.367 795.4 283.082L795.602 283.032Z',
	p24207c00:
		'M515.643 589.931C455.736 586.242 394.796 572.962 335.036 549.501C197.367 495.495 90.9798 396.927 28.8592 280.062C-5.22606 216.17 -9.06248 138.851 17.0548 69.9418L43.3196 0C43.6147 42.2012 48.9266 84.1073 58.9604 125.276C90.0945 255.273 167.266 376.564 279.113 466.574C331.495 508.775 391.697 544.189 458.244 570.306C477.426 577.832 496.609 584.324 515.938 590.079L515.643 589.931Z',
	p2650f400:
		'M577.636 586.179C517.83 592.39 455.73 589.42 392.955 576.189C248.639 545.814 128.489 466.568 49.3781 361.941C6.04291 304.7 -9.48217 229.504 5.6379 157.413L21.028 84.3766C27.778 125.687 39.3881 166.053 55.4531 204.799C106.078 327.515 200.714 433.897 324.779 503.828C382.965 536.634 447.765 561.474 517.56 576.189C537.676 580.374 557.656 583.749 577.501 586.044L577.636 586.179Z',
	ped1ff00:
		'M578.31 555.534C523.5 552.159 467.745 540.009 413.07 518.544C287.114 469.133 189.778 378.952 132.943 272.03C101.758 213.574 98.248 142.833 122.143 79.7869L146.173 15.7959C146.443 54.4065 151.303 92.7471 160.483 130.413C188.968 249.35 259.574 360.321 361.904 442.673C409.83 481.283 464.91 513.684 525.795 537.579C543.345 544.464 560.895 550.404 578.58 555.669L578.31 555.534Z',
};

export function HeroBackground() {
	const layer1Ref = useRef<HTMLDivElement | null>(null);
	const layer2Ref = useRef<HTMLDivElement | null>(null);

	// Map scrollY [0, 1000] -> translateY [0, -200] and [0, -100]
	useEffect(() => {
		if (typeof window === 'undefined') return;

		let raf = 0;
		const maxScroll = 1000;
		const map = (value: number, inMax: number, outMin: number, outMax: number) => {
			const t = Math.max(0, Math.min(value, inMax)) / inMax;
			return outMin + (outMax - outMin) * t;
		};

		const onScroll = () => {
			if (raf) return;
			raf = window.requestAnimationFrame(() => {
				const y = window.scrollY || 0;
				const y1 = map(y, maxScroll, 0, -200);
				const y2 = map(y, maxScroll, 0, -100);

				if (layer1Ref.current) layer1Ref.current.style.transform = `translateY(${y1}px)`;
				if (layer2Ref.current) layer2Ref.current.style.transform = `translateY(${y2}px)`;

				raf = 0;
			});
		};

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
			if (raf) cancelAnimationFrame(raf);
		};
	}, []);

	return (
		<div className={styles.wrapper} aria-hidden="true">
			<div ref={layer1Ref} className={styles.layer1}>
				<svg className={styles.svg} fill="none" preserveAspectRatio="none" viewBox="0 0 799 826">
					<path d={svgPaths.p1ecea700} fill="#FFBF00" />
				</svg>
			</div>

			<div ref={layer2Ref} className={styles.layer2}>
				<svg className={styles.svg} fill="none" preserveAspectRatio="none" viewBox="0 0 585 590">
					<path d={svgPaths.p2650f400} fill="#FFBF00" />
					<path d={svgPaths.ped1ff00} fill="#C01C24" />
					<path d={svgPaths.p15a63d90} fill="#1D6E89" />
				</svg>
			</div>
		</div>
	);
}
