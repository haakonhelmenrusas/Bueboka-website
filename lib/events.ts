type Listener = () => void;

type Events = {
	'equipment:changed': Listener[];
};

const listeners: Events = {
	'equipment:changed': [],
};

export function onEquipmentChanged(listener: Listener) {
	listeners['equipment:changed'].push(listener);
	return () => {
		listeners['equipment:changed'] = listeners['equipment:changed'].filter((l) => l !== listener);
	};
}

export function emitEquipmentChanged() {
	// clone to avoid issues if listeners unsubscribe during emit
	[...listeners['equipment:changed']].forEach((l) => l());
}
