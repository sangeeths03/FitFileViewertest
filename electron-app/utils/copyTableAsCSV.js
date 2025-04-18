export function copyTableAsCSV(table, title) {
	const rows = table.objects().map((row) => {
		const newRow = {};
		Object.keys(row).forEach((key) => {
			const cell = row[key];
			newRow[key] =
				typeof cell === 'object' && cell !== null ? JSON.stringify(cell) : cell;
		});
		return newRow;
	});
	const flattenedTable = window.aq.from(rows);
	const csvString = flattenedTable.toCSV({ header: true });
	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard
			.writeText(csvString)
			.then(() => console.log('Copied CSV to clipboard!'))
			.catch((err) => console.error('Failed to copy CSV:', err));
	} else {
		// Fallback mechanism
		const textarea = document.createElement('textarea');
		textarea.value = csvString;
		textarea.style.position = 'fixed'; // Prevent scrolling to the bottom
		textarea.style.opacity = '0';
		document.body.appendChild(textarea);
		textarea.focus();
		textarea.select();
		try {
			document.execCommand('copy');
			console.log('Copied CSV to clipboard using fallback!');
		} catch (err) {
			console.error('Failed to copy CSV using fallback:', err);
		}
		document.body.removeChild(textarea);
	}
}
