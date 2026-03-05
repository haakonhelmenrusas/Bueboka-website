/**
 * Export data to CSV file
 * @param headers - Array of column headers
 * @param rows - Array of row data arrays
 * @param filename - Name of the file (without extension)
 */
export function exportToCSV(headers: string[], rows: (string | number)[][], filename: string): void {
	const csv: string[] = [];

	// Add header row
	csv.push(headers.join(','));

	// Add data rows
	rows.forEach((row) => {
		csv.push(row.join(','));
	});

	// Create blob and trigger download
	const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute('download', `${filename}.csv`);
	link.style.visibility = 'hidden';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Clean up the URL object
	URL.revokeObjectURL(url);
}
