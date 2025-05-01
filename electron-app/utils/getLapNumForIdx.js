// Utility to find lap number for a given point index
export function getLapNumForIdx(idx, lapMesgs) {
	for (let i = 0; i < lapMesgs.length; i++) {
		const lap = lapMesgs[i];
		if (
			lap.start_index != null &&
			lap.end_index != null &&
			idx >= lap.start_index &&
			idx <= lap.end_index
		) {
			return i + 1;
		}
	}
	return null;
}
