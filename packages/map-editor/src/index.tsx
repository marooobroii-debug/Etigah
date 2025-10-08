

import { useRef, useState } from 'react';

export const MapEditor: React.FC = () => {
	const [floorplan, setFloorplan] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (ev) => {
				setFloorplan(ev.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="map-editor-root">
			<aside className="map-editor-sidebar">
				<h3>Map Layers</h3>
				<button className="upload-btn" onClick={handleUploadClick}>Upload Floorplan</button>
				<input
					type="file"
					accept="image/*,image/svg+xml"
					style={{ display: 'none' }}
					ref={fileInputRef}
					onChange={handleFileChange}
				/>
				<div className="sidebar-section">
					<h4>Nodes</h4>
					<ul className="node-list">
						{/* Node items will go here */}
					</ul>
					<button className="add-btn">Add Node</button>
				</div>
				<div className="sidebar-section">
					<h4>Edges</h4>
					<ul className="edge-list">
						{/* Edge items will go here */}
					</ul>
					<button className="add-btn">Add Edge</button>
				</div>
				<div className="sidebar-section">
					<h4>QR Codes</h4>
					<button className="qr-btn">Generate All</button>
				</div>
			</aside>
			<section className="map-editor-canvas">
				{floorplan ? (
					<img src={floorplan} alt="Floorplan" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '1rem', boxShadow: '0 2px 16px #cbd5e1' }} />
				) : (
					<div className="canvas-placeholder">
						<span>Upload a floorplan to start editing</span>
					</div>
				)}
			</section>
		</div>
	);
};
