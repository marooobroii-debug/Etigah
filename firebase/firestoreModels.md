# Firestore Data Models

## buildings/{buildingId}
- name
- location
- floors: [ {floorId, name, level, imageUrl} ]

## floors/{floorId}
- buildingId
- imageUrl
- nodes: [nodeId]
- edges: [edgeId]

## nodes/{nodeId}
- buildingId
- floorId
- name
- x, y (coordinates)
- type
- connections: [nodeIds]

## users/{uid}
- name
- role
- activeRoute: {startNode, endNode, lastUpdated, status}

## routes/{routeId}
- userId
- path: [nodeIds]
- distance
- createdAt
- completed: boolean
