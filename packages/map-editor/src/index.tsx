

import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';


export const MapEditor = forwardRef((_props, ref) => {
	const [floorplan, setFloorplan] = useState<string | null>(null);
	const [nodes, setNodes] = useState<{ id: string; x: number; y: number }[]>([]);
	const [edges, setEdges] = useState<{ from: string; to: string }[]>([]);
		const [draggedNode, setDraggedNode] = useState<string | null>(null);
		const [qrImages, setQrImages] = useState<Record<string, string>>({});
		// Generate QR codes for all nodes
		const handleGenerateQRCodes = async () => {
		const images: Record<string, string> = {};
		for (const node of nodes) {
			// Example QR data: { n: nodeId, b: 'BLDG_A', f: 1 }
			const data = JSON.stringify({ n: node.id, b: 'BLDG_A', f: 1 });
			images[node.id] = await QRCode.toDataURL(data, { width: 128, margin: 1 });
		}
		setQrImages(images);
	};

		// Export all QR codes as PDF
		const handleExportQRCodesPDF = async () => {
	useImperativeHandle(ref, () => ({
		handleGenerateQRCodes,
		handleExportQRCodesPDF
	}));
		if (Object.keys(qrImages).length === 0) await handleGenerateQRCodes();
		const doc = new jsPDF();
		let y = 10;
		let count = 0;
		for (const nodeId of Object.keys(qrImages)) {
			if (count > 0 && count % 4 === 0) {
				doc.addPage();
				y = 10;
			}
			doc.text(nodeId, 10, y + 5);
			doc.addImage(qrImages[nodeId], 'PNG', 10, y + 10, 40, 40);
			y += 55;
			count++;
		}
		doc.save('etigah-qrcodes.pdf');
	};
	const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
	const [edgeSelection, setEdgeSelection] = useState<string[]>([]);
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
		setNodes((prev) => [
			...prev,
			{ id: `node-${Date.now()}`, x, y }
		]);
	};

	// Drag node logic
	const handleNodeMouseDown = (id: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.stopPropagation();
		setDraggedNode(id);
		setDragOffset({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
		// Edge selection logic
		if (edgeSelection.length === 0) {
			setEdgeSelection([id]);
		} else if (edgeSelection.length === 1 && edgeSelection[0] !== id) {
			setEdges((prev) => [...prev, { from: edgeSelection[0], to: id }]);
			setEdgeSelection([]);
		} else {
			setEdgeSelection([]);
		}
	};
	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (!draggedNode) return;
		const rect = canvasRef.current?.getBoundingClientRect();
		if (!rect) return;
		const x = e.clientX - rect.left - dragOffset.x;
		const y = e.clientY - rect.top - dragOffset.y;
		setNodes((prev) => prev.map((n) => n.id === draggedNode ? { ...n, x, y } : n));
	};
	const handleMouseUp = () => {
		setDraggedNode(null);
	};

	// Add edge button handler (reset selection)
	const handleAddEdge = () => setEdgeSelection([]);

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
									{edges.map((e, i) => (
										<li key={i}>{e.from} ↔ {e.to}</li>
									))}
									{edges.length === 0 && <li>No edges yet</li>}
								</ul>
								<button className="add-btn" onClick={handleAddEdge} style={{marginTop:4}}>Add Edge</button>
				</div>
						<div className="sidebar-section">
							<h4>QR Codes</h4>
							<button className="qr-btn" onClick={handleGenerateQRCodes}>Generate All</button>
							<button className="qr-btn" onClick={handleExportQRCodesPDF} style={{marginTop:4}}>Export as PDF</button>
							<div style={{marginTop:8, display:'flex', flexWrap:'wrap', gap:8}}>
								{Object.entries(qrImages).map(([id, url]) => (
									<div key={id} style={{textAlign:'center'}}>
										<img src={url} alt={`QR for ${id}`} style={{width:48, height:48}} />
										<div style={{fontSize:10}}>{id}</div>
									</div>
								))}
							</div>
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
								{/* Draw edges as SVG lines */}
								<svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
									{edges.map((e, i) => {
										const from = nodes.find(n => n.id === e.from);
										const to = nodes.find(n => n.id === e.to);
										if (!from || !to) return null;
										return (
											<line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#2563eb" strokeWidth={4} />
										);
									})}
								</svg>
								{nodes.map((n) => (
									<div
										key={n.id}
										className="editor-node"
										style={{ left: n.x, top: n.y, zIndex: 2, position: 'absolute', border: edgeSelection.includes(n.id) ? '2px solid #fbbf24' : undefined }}
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
});
