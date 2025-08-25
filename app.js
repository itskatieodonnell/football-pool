// NFL Pick 'Em Pool Manager - Secure Version
class PickEmPool {
    constructor() {
        this.currentWeek = 1;
        this.players = [
            { name: "John Smith", picks: { week1: "Kansas City Chiefs" }, points: 0 },
            { name: "Sarah Johnson", picks: { week1: "Buffalo Bills" }, points: 0 },
            { name: "Mike Davis", picks: { week1: "Philadelphia Eagles" }, points: 0 },
            { name: "Lisa Chen", picks: { week1: "San Francisco 49ers" }, points: 0 },
            { name: "Tom Wilson", picks: { week1: "Green Bay Packers" }, points: 0 },
            { name: "Emma Rodriguez", picks: { week1: "Baltimore Ravens" }, points: 0 }
        ];

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

    init() {
        this.bindEvents();
        this.updatePoolInfo();
        this.loadPlayerDropdown();
    }

    // Check if user is trying to access admin via URL hash
    checkAdminAccess() {
        if (window.location.hash === '#admin') {
            // Show admin tab and activate it
            document.getElementById('admin-tab').style.display = 'inline-block';
            this.switchTab('admin');

            // Add a subtle indicator that admin mode is active
            const header = document.querySelector('.header h1');
            header.innerHTML += ' <span style="font-size: 0.5em; color: #666;">[ADMIN MODE]</span>';
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
        document.getElementById('current-player').addEventListener('change', (e) => {
            this.showPlayerConstraints(e.target.value);
        });

        // Pick buttons
        document.querySelectorAll('.pick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectTeam(e.target);
            });
        });

        // Submit pick
        document.getElementById('submit-pick').addEventListener('click', () => {
            this.submitPick();
        });
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
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    updatePoolInfo() {
        const totalPlayers = this.players.length;
        const totalPot = totalPlayers * 20;

        document.getElementById('pool-size').textContent = totalPlayers;
        document.getElementById('total-pot').textContent = `$${totalPot}`;
        document.getElementById('first-prize').textContent = `$${Math.floor(totalPot * 0.6)}`;
        document.getElementById('second-prize').textContent = `$${Math.floor(totalPot * 0.25)}`;
        document.getElementById('third-prize').textContent = `$${Math.floor(totalPot * 0.15)}`;
    }

    loadPlayerDropdown() {
        const select = document.getElementById('current-player');
        select.innerHTML = '<option value="">Choose a player...</option>';

        this.players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.name;
            option.textContent = player.name;
            select.appendChild(option);
        });
    }

    showPlayerConstraints(playerName) {
        if (!playerName) {
            document.querySelector('.used-teams').innerHTML = '<em>Select a player above to see their used teams</em>';
            return;
        }

        const player = this.players.find(p => p.name === playerName);
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

        // Update player's pick
        const player = this.players.find(p => p.name === playerName);
        const weekKey = `week${this.currentWeek}`;
        player.picks[weekKey] = this.selectedTeam;

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
