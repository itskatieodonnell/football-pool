// NFL Pick 'Em Pool Manager - Secure Version with Working Player Management
class PickEmPool {
    constructor() {
        this.currentWeek = 1;
        this.entryFee = 20;

        // Load data from localStorage or use defaults
        this.loadData();

        this.teams = [
            "Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills",
            "Carolina Panthers", "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns",
            "Dallas Cowboys", "Denver Broncos", "Detroit Lions", "Green Bay Packers",
            "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs",
            "Las Vegas Raiders", "Los Angeles Chargers", "Los Angeles Rams", "Miami Dolphins",
            "Minnesota Vikings", "New England Patriots", "New Orleans Saints", "New York Giants",
            "New York Jets", "Philadelphia Eagles", "Pittsburgh Steelers", "San Francisco 49ers",
            "Seattle Seahawks", "Tampa Bay Buccaneers", "Tennessee Titans", "Washington Commanders"
        ];

        this.init();
        this.checkAdminAccess();
    }

    loadData() {
        // Try to load from localStorage, otherwise use sample data
        const savedData = localStorage.getItem('nflPickEmData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.players = data.players || [];
            this.currentWeek = data.currentWeek || 1;
            this.entryFee = data.entryFee || 20;
        } else {
            // Default sample players
            this.players = [
                { name: "John Smith", picks: { week1: "Kansas City Chiefs" }, points: 0 },
                { name: "Sarah Johnson", picks: { week1: "Buffalo Bills" }, points: 0 },
                { name: "Mike Davis", picks: { week1: "Philadelphia Eagles" }, points: 0 },
                { name: "Lisa Chen", picks: { week1: "San Francisco 49ers" }, points: 0 },
                { name: "Tom Wilson", picks: { week1: "Green Bay Packers" }, points: 0 },
                { name: "Emma Rodriguez", picks: { week1: "Baltimore Ravens" }, points: 0 }
            ];
        }
    }

    saveData() {
        const data = {
            players: this.players,
            currentWeek: this.currentWeek,
            entryFee: this.entryFee
        };
        localStorage.setItem('nflPickEmData', JSON.stringify(data));
    }

    init() {
        this.bindEvents();
        this.updatePoolInfo();
        this.loadPlayerDropdown();
        this.refreshPlayerList();
        this.updateStandings();
    }

    // Check if user is trying to access admin via URL hash
    checkAdminAccess() {
        if (window.location.hash === '#admin') {
            // Show admin tab and activate it
            document.getElementById('admin-tab').style.display = 'inline-block';
            this.switchTab('admin');

            // Add a subtle indicator that admin mode is active
            const header = document.querySelector('.header h1');
            if (!header.innerHTML.includes('[ADMIN MODE]')) {
                header.innerHTML += ' <span style="font-size: 0.5em; color: #666;">[ADMIN MODE]</span>';
            }
        }

        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#admin') {
                document.getElementById('admin-tab').style.display = 'inline-block';
                this.switchTab('admin');
            } else {
                document.getElementById('admin-tab').style.display = 'none';
                if (document.querySelector('.nav-tab[data-tab="admin"]').classList.contains('active')) {
                    this.switchTab('picks');
                }
            }
        });
    }

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Player selection
        const playerSelect = document.getElementById('current-player');
        if (playerSelect) {
            playerSelect.addEventListener('change', (e) => {
                this.showPlayerConstraints(e.target.value);
            });
        }

        // Pick buttons
        document.querySelectorAll('.pick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectTeam(e.target);
            });
        });

        // Submit pick
        const submitBtn = document.getElementById('submit-pick');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.submitPick();
            });
        }

        // Admin - Add player
        const addPlayerBtn = document.getElementById('add-player');
        if (addPlayerBtn) {
            addPlayerBtn.addEventListener('click', () => {
                this.addPlayer();
            });
        }

        // Admin - Update settings
        const updateSettingsBtn = document.getElementById('update-settings');
        if (updateSettingsBtn) {
            updateSettingsBtn.addEventListener('click', () => {
                this.updateSettings();
            });
        }

        // Enter key for adding players
        const newPlayerInput = document.getElementById('new-player-name');
        if (newPlayerInput) {
            newPlayerInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addPlayer();
                }
            });
        }
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab
        const targetTab = document.getElementById(tabName);
        const targetNavTab = document.querySelector(`[data-tab="${tabName}"]`);

        if (targetTab) targetTab.classList.add('active');
        if (targetNavTab) targetNavTab.classList.add('active');

        // Refresh content based on tab
        if (tabName === 'admin') {
            this.refreshPlayerList();
        } else if (tabName === 'standings') {
            this.updateStandings();
        } else if (tabName === 'team-tracker') {
            this.updateTeamTracker();
        }
    }

    updatePoolInfo() {
        const totalPlayers = this.players.length;
        const totalPot = totalPlayers * this.entryFee;

        document.getElementById('pool-size').textContent = totalPlayers;
        document.getElementById('total-pot').textContent = `$${totalPot}`;
        document.getElementById('first-prize').textContent = `$${Math.floor(totalPot * 0.6)}`;
        document.getElementById('second-prize').textContent = `$${Math.floor(totalPot * 0.25)}`;
        document.getElementById('third-prize').textContent = `$${Math.floor(totalPot * 0.15)}`;
    }

    loadPlayerDropdown() {
        const select = document.getElementById('current-player');
        if (!select) return;

        select.innerHTML = '<option value="">Choose a player...</option>';

        this.players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.name;
            option.textContent = player.name;
            select.appendChild(option);
        });
    }

    refreshPlayerList() {
        const playerList = document.getElementById('player-list');
        if (!playerList) return;

        if (this.players.length === 0) {
            playerList.innerHTML = '<p><em>No players added yet. Add some players to get started!</em></p>';
            return;
        }

        playerList.innerHTML = '';

        this.players.forEach((player, index) => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            playerItem.innerHTML = `
                <span><strong>${player.name}</strong> - ${player.points || 0} points</span>
                <button class="btn btn--danger btn--sm remove-player-btn" data-index="${index}">Remove</button>
            `;
            playerList.appendChild(playerItem);
        });

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-player-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removePlayer(index);
            });
        });
    }

    addPlayer() {
        const nameInput = document.getElementById('new-player-name');
        if (!nameInput) return;

        const name = nameInput.value.trim();
        if (!name) {
            alert('Please enter a player name');
            return;
        }

        // Check if player already exists
        if (this.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            alert('Player already exists!');
            return;
        }

        // Add new player
        this.players.push({
            name: name,
            picks: {},
            points: 0
        });

        nameInput.value = '';

        this.saveData();
        this.refreshPlayerList();
        this.loadPlayerDropdown();
        this.updatePoolInfo();
        this.updateStandings();

        alert(`${name} has been added to the pool!`);
    }

    removePlayer(index) {
        if (index < 0 || index >= this.players.length) return;

        const player = this.players[index];
        const confirmMessage = `Are you sure you want to remove ${player.name} from the pool?`;

        if (confirm(confirmMessage)) {
            this.players.splice(index, 1);

            this.saveData();
            this.refreshPlayerList();
            this.loadPlayerDropdown();
            this.updatePoolInfo();
            this.updateStandings();

            alert(`${player.name} has been removed from the pool.`);
        }
    }

    updateSettings() {
        const entryFeeInput = document.getElementById('entry-fee');
        const currentWeekInput = document.getElementById('admin-current-week');

        if (entryFeeInput) {
            this.entryFee = parseInt(entryFeeInput.value) || 20;
        }

        if (currentWeekInput) {
            this.currentWeek = parseInt(currentWeekInput.value) || 1;
            document.getElementById('current-week-display').textContent = this.currentWeek;
            document.getElementById('week-number').textContent = this.currentWeek;
        }

        this.saveData();
        this.updatePoolInfo();

        alert('Settings updated successfully!');
    }

    updateStandings() {
        const tbody = document.getElementById('standings-tbody');
        if (!tbody) return;

        // Sort players by points (descending)
        const sortedPlayers = [...this.players].sort((a, b) => (b.points || 0) - (a.points || 0));

        tbody.innerHTML = '';

        if (sortedPlayers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4"><em>No players in pool yet</em></td></tr>';
            return;
        }

        sortedPlayers.forEach((player, index) => {
            const row = document.createElement('tr');
            const lastPick = this.getLastPick(player);

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${player.name}</td>
                <td>${player.points || 0}</td>
                <td>${lastPick || 'No picks yet'}</td>
            `;
            tbody.appendChild(row);
        });
    }

    updateTeamTracker() {
        // This would update the team tracking matrix
        // Implementation would go here for the team tracker tab
    }

    getLastPick(player) {
        const picks = player.picks || {};
        const weeks = Object.keys(picks).sort();
        return weeks.length > 0 ? picks[weeks[weeks.length - 1]] : null;
    }

    showPlayerConstraints(playerName) {
        if (!playerName) {
            document.querySelector('.used-teams').innerHTML = '<em>Select a player above to see their used teams</em>';
            return;
        }

        const player = this.players.find(p => p.name === playerName);
        if (!player) return;

        const usedTeams = Object.values(player.picks || {});

        if (usedTeams.length === 0) {
            document.querySelector('.used-teams').innerHTML = '<em>No teams used yet this season</em>';
        } else {
            document.querySelector('.used-teams').innerHTML = usedTeams.map(team => 
                `<span class="used-team">${team}</span>`
            ).join('');
        }

        // Disable buttons for used teams
        document.querySelectorAll('.pick-btn').forEach(btn => {
            const team = btn.dataset.team;
            if (usedTeams.includes(team)) {
                btn.disabled = true;
                btn.classList.add('disabled');
                btn.title = `${playerName} already picked ${team}`;
            } else {
                btn.disabled = false;
                btn.classList.remove('disabled');
                btn.title = '';
            }
        });
    }

    selectTeam(button) {
        // Clear previous selections
        document.querySelectorAll('.pick-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Select current team
        button.classList.add('selected');
        this.selectedTeam = button.dataset.team;
    }

    submitPick() {
        const playerName = document.getElementById('current-player').value;

        if (!playerName) {
            alert('Please select a player first!');
            return;
        }

        if (!this.selectedTeam) {
            alert('Please select a team first!');
            return;
        }

        // Find player and update pick
        const player = this.players.find(p => p.name === playerName);
        if (!player) return;

        const weekKey = `week${this.currentWeek}`;
        player.picks[weekKey] = this.selectedTeam;

        this.saveData();
        this.updateStandings();

        alert(`Pick submitted! ${playerName} picked ${this.selectedTeam} for Week ${this.currentWeek}`);

        // Clear selection
        document.querySelectorAll('.pick-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        this.selectedTeam = null;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new PickEmPool();
});
