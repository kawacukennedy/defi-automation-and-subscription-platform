#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running FlowFi Backend Tests...\n');

// Check if we're in the backend directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Must run from backend directory');
  process.exit(1);
}

// Run the integration tests
try {
  console.log('📋 Running integration tests...');
  execSync('npx jest __tests__/integration.test.js', { stdio: 'inherit' });
  console.log('✅ Integration tests passed!\n');
} catch (error) {
  console.log('❌ Integration tests failed\n');
  process.exit(1);
}

// Run service unit tests
const serviceTests = [
  'workflowService.test.js',
  'subscriptionService.test.js',
  'nftService.test.js',
  'analyticsService.test.js',
  'notificationService.test.js',
  'monitoringService.test.js'
];

for (const testFile of serviceTests) {
  if (fs.existsSync(`__tests__/${testFile}`)) {
    try {
      console.log(`🔧 Running ${testFile}...`);
      execSync(`npx jest __tests__/${testFile}`, { stdio: 'inherit' });
      console.log(`✅ ${testFile} passed!\n`);
    } catch (error) {
      console.log(`❌ ${testFile} failed\n`);
      process.exit(1);
    }
  }
}

// Check for syntax errors in all JS files
console.log('🔍 Checking syntax in all JavaScript files...');
const jsFiles = [
  'index.js',
  'routes/workflows.js',
  'routes/subscriptions.js',
  'routes/analytics.js',
  'routes/notifications.js',
  'routes/community.js',
  'services/workflowService.js',
  'services/subscriptionService.js',
  'services/analyticsService.js',
  'services/notificationService.js',
  'services/nftService.js',
  'services/flowService.js',
  'models/User.js',
  'models/Workflow.js',
  'models/Subscription.js',
  'models/Analytics.js',
  'models/Notification.js',
  'middleware/auth.js',
  'middleware/validation.js'
];

let syntaxErrors = 0;
for (const file of jsFiles) {
  if (fs.existsSync(file)) {
    try {
      execSync(`node -c ${file}`, { stdio: 'pipe' });
      console.log(`✅ ${file}`);
    } catch (error) {
      console.log(`❌ ${file} - Syntax error`);
      syntaxErrors++;
    }
  } else {
    console.log(`⚠️  ${file} - File not found`);
  }
}

if (syntaxErrors > 0) {
  console.log(`\n❌ Found ${syntaxErrors} syntax errors`);
  process.exit(1);
} else {
  console.log('\n✅ All files passed syntax check!');
}

// Check for required environment variables
console.log('\n🔐 Checking environment configuration...');
const requiredEnvVars = [
  'MONGODB_URI',
  'FLOW_ACCESS_NODE',
  'PORT'
];

let missingEnvVars = 0;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.log(`⚠️  ${envVar} not set`);
    missingEnvVars++;
  } else {
    console.log(`✅ ${envVar} configured`);
  }
}

if (missingEnvVars > 0) {
  console.log(`\n⚠️  ${missingEnvVars} environment variables not configured`);
  console.log('   Make sure to set them in your .env file');
} else {
  console.log('\n✅ All required environment variables configured!');
}

console.log('\n🎉 All tests completed successfully!');
console.log('\n📊 Test Summary:');
console.log('   ✅ Integration tests passed');
console.log('   ✅ Service unit tests passed');
console.log('   ✅ Syntax validation passed');
console.log('   ✅ Environment check completed');
console.log('\n🚀 Ready for deployment!');