/**
 * Compresses and resizes an image file.
 *
 * @param file - The image file to compress.
 * @param maxWidth - The maximum width of the output image. Default is 800px.
 * @param maxHeight - The maximum height of the output image. Default is 800px.
 * @param quality - The quality of the output image (0 to 1). Default is 0.7.
 * @returns A promise that resolves to the compressed image as a base64 string.
 */
export async function compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (event) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement('canvas');
				let width = img.width;
				let height = img.height;

				// Calculate aspect ratio and resize if needed
				const ratio = Math.min(maxWidth / width, maxHeight / height);

				if (ratio < 1) {
					width = Math.round(width * ratio);
					height = Math.round(height * ratio);
				}

				canvas.width = width;
				canvas.height = height;

				const ctx = canvas.getContext('2d');
				if (!ctx) {
					reject(new Error('Could not get canvas context'));
					return;
				}

				// Draw image on canvas
				ctx.drawImage(img, 0, 0, width, height);

				// Convert canvas to base64 string
				// Try WebP first
				let dataUrl = canvas.toDataURL('image/webp', quality);

				// Fallback to JPEG if WebP is not supported or returns PNG (some browsers return PNG for unsupported types)
				if (dataUrl.startsWith('data:image/png')) {
					dataUrl = canvas.toDataURL('image/jpeg', quality);
				}

				resolve(dataUrl);
			};

			img.onerror = (error) => reject(error);

			img.src = event.target?.result as string;
		};

		reader.onerror = (error) => reject(error);

		reader.readAsDataURL(file);
	});
}
