// ...existing code...

// In electron-app/renderer.js
document.getElementById('openFileBtn').addEventListener('click', async () => {
	const filePath = await window.electronAPI.openFile();
	if (filePath) {
		try {
			const arrayBuffer = await window.electronAPI.readFile(filePath);
			const result = await window.electronAPI.parseFitFile(arrayBuffer);
			console.log('[DEBUG] FIT parse result:', result); // <-- Add this line
			if (result && result.error) {
				alert(`Error: ${result.error}\n${result.details || ''}`);
			} else {
				window.showFitData(result, filePath); // Pass filePath to showFitData
			}
		} catch (err) {
			alert(`Error reading or parsing file: ${err}`);
		}
	}
});

// ...existing code...
