

import { useRef, useState } from 'react';

export const MapEditor: React.FC = () => {
	const [floorplan, setFloorplan] = useState<string | null>(null);
	const [nodes, setNodes] = useState<{ id: string; x: number; y: number }[]>([]);
	const [draggedNode, setDraggedNode] = useState<string | null>(null);
	const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
	const fileInputRef = useRef<HTMLInputElement>(null);
	const canvasRef = useRef<HTMLDivElement>(null);

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

	// Add node on click
	const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (!floorplan || draggedNode) return;
		const rect = (e.target as HTMLDivElement).getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		setNodes((prev: { id: string; x: number; y: number }[]) => [
			...prev,
			{ id: `node-${Date.now()}`, x, y }
		]);
	};

	// Drag node logic
	const handleNodeMouseDown = (id: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.stopPropagation();
		setDraggedNode(id);
		setDragOffset({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
	};
	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (!draggedNode) return;
		const rect = canvasRef.current?.getBoundingClientRect();
		if (!rect) return;
		const x = e.clientX - rect.left - dragOffset.x;
		const y = e.clientY - rect.top - dragOffset.y;
		setNodes((prev: { id: string; x: number; y: number }[]) => prev.map((n: { id: string; x: number; y: number }) => n.id === draggedNode ? { ...n, x, y } : n));
	};
	const handleMouseUp = () => {
		setDraggedNode(null);
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
						{nodes.map((n) => (
							<li key={n.id}>{n.id} ({Math.round(n.x)}, {Math.round(n.y)})</li>
						))}
					</ul>
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
			<section
				className="map-editor-canvas"
				ref={canvasRef}
				onClick={handleCanvasClick}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				style={{ cursor: draggedNode ? 'grabbing' : 'crosshair' }}
			>
				{floorplan ? (
					<>
						<img
							src={floorplan}
							alt="Floorplan"
							style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '1rem', boxShadow: '0 2px 16px #cbd5e1', position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }}
						/>
						{nodes.map((n) => (
							<div
								key={n.id}
								className="editor-node"
								style={{ left: n.x, top: n.y, zIndex: 2, position: 'absolute' }}
								onMouseDown={(e) => handleNodeMouseDown(n.id, e)}
							>
								<span role="img" aria-label="Node">🔵</span>
							</div>
						))}
					</>
				) : (
					<div className="canvas-placeholder">
						<span>Upload a floorplan to start editing</span>
					</div>
				)}
			</section>
		</div>
	);
};
