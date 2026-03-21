const fs = require('fs');
const path = require('path');

const MEMORY_DIR = '/root/projects/SYNDICATE/core/memory';
const LOCK_DIR = path.join(MEMORY_DIR, 'locks');
const HEARTBEAT_FILE = path.join(MEMORY_DIR, 'heartbeat.json');

/**
 * SYN-SYNC: Syndicate Agent Synchronization Library
 * Handles distributed locking and agent status tracking.
 */

class SynSync {
  constructor(agentName) {
    this.agentName = agentName;
    if (!fs.existsSync(LOCK_DIR)) {
      fs.mkdirSync(LOCK_DIR, { recursive: true });
    }
  }

  /**
   * Update the heartbeat for this agent.
   * @param {string} status - Current status of the agent.
   */
  async heartbeat(status = 'active') {
    let data = { agents: {} };
    if (fs.existsSync(HEARTBEAT_FILE)) {
      try {
        data = JSON.parse(fs.readFileSync(HEARTBEAT_FILE, 'utf8'));
      } catch (e) {
        console.error('Failed to parse heartbeat.json, resetting...');
      }
    }

    if (!data.agents) data.agents = {};

    data.agents[this.agentName] = {
      lastSeen: new Date().toISOString(),
      status: status,
      pid: process.pid
    };

    fs.writeFileSync(HEARTBEAT_FILE, JSON.stringify(data, null, 2));
  }

  /**
   * Acquire a lock on a specific resource.
   * @param {string} resourceName - Name of the resource to lock.
   * @returns {boolean} - True if lock acquired, False otherwise.
   */
  acquireLock(resourceName) {
    const lockFile = path.join(LOCK_DIR, `${resourceName}.lock`);
    if (fs.existsSync(lockFile)) {
      // Check if the lock is stale (optional, but good for robustness)
      const stats = fs.statSync(lockFile);
      const now = new Date().getTime();
      const lockTime = new Date(stats.mtime).getTime();
      if (now - lockTime > 60000) { // 60 seconds timeout
        console.warn(`Stale lock detected for ${resourceName}, overriding...`);
        fs.unlinkSync(lockFile);
      } else {
        return false;
      }
    }

    fs.writeFileSync(lockFile, JSON.stringify({
      agent: this.agentName,
      acquiredAt: new Date().toISOString(),
      pid: process.pid
    }));
    return true;
  }

  /**
   * Release a lock on a specific resource.
   * @param {string} resourceName - Name of the resource to unlock.
   */
  releaseLock(resourceName) {
    const lockFile = path.join(LOCK_DIR, `${resourceName}.lock`);
    if (fs.existsSync(lockFile)) {
      try {
        const lockData = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
        if (lockData.agent === this.agentName) {
          fs.unlinkSync(lockFile);
        }
      } catch (e) {
        // If file can't be read, just try to delete it
        fs.unlinkSync(lockFile);
      }
    }
  }

  /**
   * List all active agents.
   */
  static getActiveAgents() {
    if (!fs.existsSync(HEARTBEAT_FILE)) return {};
    return JSON.parse(fs.readFileSync(HEARTBEAT_FILE, 'utf8')).agents;
  }
}

module.exports = SynSync;
