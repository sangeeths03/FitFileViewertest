/* global L */
// Utility to create Leaflet icons for start and end markers
export function createStartIcon() {
	return L.icon({
		iconUrl: 'https://i.gyazo.com/71a575e54ca160ae139e68f7771f1c42.png',
		iconSize: [32, 32],
		iconAnchor: [16, 32],
		popupAnchor: [0, -32],
	});
}

export function createEndIcon() {
	return L.icon({
		iconUrl: 'https://i.gyazo.com/56eb532007a2a739753c131840994f02.png',
		iconSize: [32, 32],
		iconAnchor: [16, 32],
		popupAnchor: [0, -32],
	});
}
