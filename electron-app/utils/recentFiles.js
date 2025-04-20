// Utility functions for managing recent files
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

const RECENT_FILES_PATH = path.join(app.getPath('userData'), 'recent-files.json');
const MAX_RECENT_FILES = 10;

function loadRecentFiles() {
	try {
		if (fs.existsSync(RECENT_FILES_PATH)) {
			const data = fs.readFileSync(RECENT_FILES_PATH, 'utf-8');
			return JSON.parse(data);
		}
	} catch (err) {
		console.error('Failed to load recent files:', err);
	}
	return [];
}

function saveRecentFiles(list) {
	try {
		fs.writeFileSync(RECENT_FILES_PATH, JSON.stringify(list.slice(0, MAX_RECENT_FILES)), 'utf-8');
	} catch (err) {
		console.error('Failed to save recent files:', err);
	}
}

function addRecentFile(filePath) {
	let list = loadRecentFiles();
	list = list.filter(f => f !== filePath);
	list.unshift(filePath);
	saveRecentFiles(list);
}

function getShortRecentName(file) {
	return path.basename(file);
}

module.exports = {
	loadRecentFiles,
	saveRecentFiles,
	addRecentFile,
	getShortRecentName,
};
