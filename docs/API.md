# FlowFi API Documentation

## Overview

FlowFi provides RESTful APIs for managing workflows, analytics, notifications, community features, and admin operations. All APIs require authentication via wallet signatures.

## Base URL

```
https://your-domain.com/api
```

## Authentication

All API requests require wallet authentication. Include the user's Flow address in the `x-user-address` header.

```javascript
headers: {
  'x-user-address': '0x1234567890abcdef'
}
```

## Endpoints

### Workflows

#### GET /api/workflows
Get all workflows for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "workflowId": "abc123",
      "name": "Staking Workflow",
      "action": "stake",
      "status": "active",
      "executionCount": 5,
      "lastExecution": "2024-01-15T10:00:00Z",
      "nextExecution": "2024-01-16T10:00:00Z"
    }
  ]
}
```

#### POST /api/workflows
Create a new workflow.

**Request Body:**
```json
{
  "name": "My Workflow",
  "description": "Automated staking",
  "action": "stake",
  "token": "FLOW",
  "amount": "10.5",
  "frequency": "daily",
  "trigger": "manual"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workflowId": "new123",
    "status": "created"
  }
}
```

#### GET /api/workflows/:id
Get workflow details by ID.

#### PUT /api/workflows/:id
Update workflow configuration.

#### DELETE /api/workflows/:id
Delete a workflow.

### Analytics

#### GET /api/analytics/user
Get user analytics data.

**Response:**
```json
{
  "success": true,
  "data": {
    "workflows": {
      "total": 5,
      "active": 3
    },
    "executions": {
      "total": 150,
      "successful": 145
    }
  }
}
```

#### GET /api/analytics/overview
Get system-wide analytics (admin only).

### Notifications

#### GET /api/notifications
Get user notifications.

#### POST /api/notifications/:id/read
Mark notification as read.

#### POST /api/notifications/send
Send notification (admin only).

### Community

#### GET /api/community/templates/trending
Get trending workflow templates.

**Query Parameters:**
- `action`: Filter by action type
- `token`: Filter by token

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Staking Template",
      "creator": "User1",
      "votes": 45,
      "forks": 12,
      "action": "stake",
      "token": "FLOW"
    }
  ]
}
```

#### POST /api/community/templates/:id/fork
Fork a template.

#### POST /api/community/templates/:id/vote
Vote on a template.

#### GET /api/community/leaderboard
Get community leaderboard.

### Admin (Admin Only)

#### GET /api/admin/workflows
Get all workflows (admin).

#### POST /api/admin/workflows/:id/retry
Retry a failed workflow.

#### POST /api/admin/workflows/:id/cancel
Cancel a workflow.

#### GET /api/admin/analytics
Get admin analytics.

#### POST /api/admin/features/:feature/toggle
Toggle feature flags.

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `UNAUTHORIZED`: Invalid or missing authentication
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `SERVER_ERROR`: Internal server error

## Rate Limiting

API requests are rate limited to 100 requests per minute per user.

## WebSocket Events

Real-time updates via WebSocket:

```javascript
const ws = new WebSocket('wss://your-domain.com');

// Workflow execution updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'workflow_executed') {
    // Handle workflow execution
  }
};
```

## SDK

FlowFi provides JavaScript SDK for easier integration:

```javascript
import { FlowFiSDK } from 'flowfi-sdk';

const sdk = new FlowFiSDK({
  apiKey: 'your-api-key',
  wallet: userWallet
});

// Create workflow
await sdk.workflows.create({
  name: 'Staking',
  action: 'stake',
  token: 'FLOW',
  amount: '10'
});
```