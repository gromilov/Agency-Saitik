const SynSync = require('./index');

async function test() {
  console.log('--- SYN-SYNC VERIFICATION START ---');

  // Test 1: Heartbeat
  const nebula = new SynSync('Nebula');
  console.log('Sending heartbeat for Nebula...');
  await nebula.heartbeat('initializing');
  
  const agents = SynSync.getActiveAgents();
  console.log('Active agents:', JSON.stringify(agents, null, 2));

  if (agents.Nebula) {
    console.log('✓ Heartbeat verification successful.');
  } else {
    throw new Error('Heartbeat verification failed.');
  }

  // Test 2: Locking
  console.log('Testing locking mechanism...');
  const kashlak = new SynSync('Kashlak');
  
  const lock1 = nebula.acquireLock('syndicate_core');
  console.log('Nebula acquiring core lock:', lock1 ? 'SUCCESS' : 'FAILURE');

  const lock2 = kashlak.acquireLock('syndicate_core');
  console.log('Kashlak acquiring core lock (should fail):', lock2 ? 'SUCCESS' : 'FAILURE');

  if (lock1 && !lock2) {
    console.log('✓ Locking verification successful.');
  } else {
    throw new Error('Locking verification failed.');
  }

  // Test 3: Release and Re-acquire
  console.log('Releasing lock...');
  nebula.releaseLock('syndicate_core');
  
  const lock3 = kashlak.acquireLock('syndicate_core');
  console.log('Kashlak acquiring released lock:', lock3 ? 'SUCCESS' : 'FAILURE');

  if (lock3) {
    console.log('✓ Release and Re-acquire successful.');
  } else {
    throw new Error('Release and Re-acquire failed.');
  }

  kashlak.releaseLock('syndicate_core');
  console.log('--- SYN-SYNC VERIFICATION COMPLETE ---');
}

test().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
