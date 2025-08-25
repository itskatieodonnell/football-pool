// NFL Pick 'Em Pool Manager Application
class PickEmPool {
    constructor() {
        this.initializeData();
        this.bindEvents();
        this.loadFromStorage();
        this.renderCurrentView();
    }

    initializeData() {
        // NFL Teams
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

        this.teamAbbreviations = {
            "Arizona Cardinals": "ARI", "Atlanta Falcons": "ATL", "Baltimore Ravens": "BAL",
            "Buffalo Bills": "BUF", "Carolina Panthers": "CAR", "Chicago Bears": "CHI",
            "Cincinnati Bengals": "CIN", "Cleveland Browns": "CLE", "Dallas Cowboys": "DAL",
            "Denver Broncos": "DEN", "Detroit Lions": "DET", "Green Bay Packers": "GB",
            "Houston Texans": "HOU", "Indianapolis Colts": "IND", "Jacksonville Jaguars": "JAX",
            "Kansas City Chiefs": "KC", "Las Vegas Raiders": "LV", "Los Angeles Chargers": "LAC",
            "Los Angeles Rams": "LAR", "Miami Dolphins": "MIA", "Minnesota Vikings": "MIN",
            "New England Patriots": "NE", "New Orleans Saints": "NO", "New York Giants": "NYG",
            "New York Jets": "NYJ", "Philadelphia Eagles": "PHI", "Pittsburgh Steelers": "PIT",
            "San Francisco 49ers": "SF", "Seattle Seahawks": "SEA", "Tampa Bay Buccaneers": "TB",
            "Tennessee Titans": "TEN", "Washington Commanders": "WSH"
        };

        // Sample schedule for Week 1
        this.schedule = {
            1: [
                {"away": "Dallas Cowboys", "home": "Philadelphia Eagles", "date": "Thu 9/4", "time": "8:20 PM", "result": null},
                {"away": "Kansas City Chiefs", "home": "Los Angeles Chargers", "date": "Fri 9/5", "time": "8:00 PM", "result": null},
                {"away": "Las Vegas Raiders", "home": "New England Patriots", "date": "Sun 9/7", "time": "1:00 PM", "result": null},
                {"away": "Pittsburgh Steelers", "home": "New York Jets", "date": "Sun 9/7", "time": "1:00 PM", "result": null},
                {"away": "Miami Dolphins", "home": "Indianapolis Colts", "date": "Sun 9/7", "time": "1:00 PM", "result": null},
                {"away": "Arizona Cardinals", "home": "New Orleans Saints", "date": "Sun 9/7", "time": "1:00 PM", "result": null},
                {"away": "New York Giants", "home": "Washington Commanders", "date": "Sun 9/7", "time": "1:00 PM", "result": null},
                {"away": "Tampa Bay Buccaneers", "home": "Atlanta Falcons", "date": "Sun 9/7", "time": "1:00 PM", "result": null},
                {"away": "Cincinnati Bengals", "home": "Cleveland Browns", "date": "Sun 9/7", "time": "1:00 PM", "result": null},
                {"away": "Carolina Panthers", "home": "Jacksonville Jaguars", "date": "Sun 9/7", "time": "1:00 PM", "result": null},
                {"away": "Tennessee Titans", "home": "Denver Broncos", "date": "Sun 9/7", "time": "4:05 PM", "result": null},
                {"away": "San Francisco 49ers", "home": "Seattle Seahawks", "date": "Sun 9/7", "time": "4:05 PM", "result": null},
                {"away": "Detroit Lions", "home": "Green Bay Packers", "date": "Sun 9/7", "time": "4:25 PM", "result": null},
                {"away": "Houston Texans", "home": "Los Angeles Rams", "date": "Sun 9/7", "time": "4:25 PM", "result": null},
                {"away": "Baltimore Ravens", "home": "Buffalo Bills", "date": "Sun 9/7", "time": "8:20 PM", "result": null},
                {"away": "Minnesota Vikings", "home": "Chicago Bears", "date": "Mon 9/8", "time": "8:15 PM", "result": null}
            ]
        };

        // Initialize players with sample data
        this.players = [
            {"name": "John Smith", "picks": {"1": "Kansas City Chiefs"}, "points": 0},
            {"name": "Sarah Johnson", "picks": {"1": "Buffalo Bills"}, "points": 0},
            {"name": "Mike Davis", "picks": {"1": "Philadelphia Eagles"}, "points": 0},
            {"name": "Lisa Chen", "picks": {"1": "San Francisco 49ers"}, "points": 0},
            {"name": "Tom Wilson", "picks": {"1": "Green Bay Packers"}, "points": 0},
            {"name": "Emma Rodriguez", "picks": {"1": "Baltimore Ravens"}, "points": 0}
        ];

        this.settings = {
            entryFee: 20,
            prizeStructure: {"first": 0.60, "second": 0.25, "third": 0.15},
            currentWeek: 1,
            seasonWeeks: 18
        };

        this.currentTab = 'picks';
        this.selectedPlayer = null;
    }

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Week navigation
        document.getElementById('prev-week').addEventListener('click', () => {
            if (this.settings.currentWeek > 1) {
                this.settings.currentWeek--;
                this.renderCurrentView();
            }
        });

        document.getElementById('next-week').addEventListener('click', () => {
            if (this.settings.currentWeek < this.settings.seasonWeeks) {
                this.settings.currentWeek++;
                this.renderCurrentView();
            }
        });

        // Player selection
        document.getElementById('player-select').addEventListener('change', (e) => {
            this.selectedPlayer = e.target.value;
            this.renderPlayerPicksInterface();
        });

        // Admin functions
        document.getElementById('add-player').addEventListener('click', () => {
            this.addPlayer();
        });

        document.getElementById('new-player-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addPlayer();
            }
        });

        document.getElementById('reset-season').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the entire season? This cannot be undone.')) {
                this.resetSeason();
            }
        });

        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('results-week-select').addEventListener('change', (e) => {
            this.renderResultsInterface(parseInt(e.target.value));
        });
    }

    switchTab(tabName) {
        console.log('Switching to tab:', tabName);
        
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Show/hide content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeContent = document.getElementById(tabName);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        this.currentTab = tabName;
        this.renderTabContent(tabName);
    }

    renderTabContent(tabName) {
        switch(tabName) {
            case 'picks':
                this.renderPicksTab();
                break;
            case 'standings':
                this.renderStandingsTab();
                break;
            case 'team-tracker':
                this.renderTeamTrackerTab();
                break;
            case 'admin':
                this.renderAdminTab();
                break;
        }
    }

    renderCurrentView() {
        this.updateHeader();
        this.renderTabContent(this.currentTab);
        this.saveToStorage();
    }

    updateHeader() {
        const poolSize = this.players.length;
        const totalPot = poolSize * this.settings.entryFee;
        
        document.getElementById('pool-size').textContent = poolSize;
        document.getElementById('total-pot').textContent = `$${totalPot}`;
        document.getElementById('current-week-display').textContent = this.settings.currentWeek;
        
        // Update prizes
        document.getElementById('first-prize').textContent = `$${Math.floor(totalPot * this.settings.prizeStructure.first)}`;
        document.getElementById('second-prize').textContent = `$${Math.floor(totalPot * this.settings.prizeStructure.second)}`;
        document.getElementById('third-prize').textContent = `$${Math.floor(totalPot * this.settings.prizeStructure.third)}`;
    }

    renderPicksTab() {
        document.getElementById('week-title').textContent = `Week ${this.settings.currentWeek} Games`;
        
        // Render games list
        this.renderGamesList();
        
        // Update player selector
        this.renderPlayerSelector();
        
        // Render picks interface if player selected
        if (this.selectedPlayer) {
            this.renderPlayerPicksInterface();
        }
    }

    renderGamesList() {
        const gamesContainer = document.getElementById('games-list');
        const games = this.schedule[this.settings.currentWeek] || [];
        
        if (games.length === 0) {
            gamesContainer.innerHTML = '<div class="status-message info">No games scheduled for this week.</div>';
            return;
        }

        gamesContainer.innerHTML = games.map(game => {
            let resultHtml = '';
            if (game.result) {
                resultHtml = `
                    <div class="game-result ${game.result === game.away ? 'win' : 'loss'}">${this.teamAbbreviations[game.away]}</div>
                    <div class="game-result ${game.result === game.home ? 'win' : 'loss'}">${this.teamAbbreviations[game.home]}</div>
                `;
            } else {
                resultHtml = `<div class="game-time">${game.date}<br>${game.time}</div>`;
            }
            
            return `
                <div class="game-item">
                    <div class="game-teams">
                        ${this.teamAbbreviations[game.away]} @ ${this.teamAbbreviations[game.home]}
                    </div>
                    ${resultHtml}
                </div>
            `;
        }).join('');
    }

    renderPlayerSelector() {
        const selector = document.getElementById('player-select');
        selector.innerHTML = '<option value="">Select a player...</option>' +
            this.players.map(player => `<option value="${player.name}" ${player.name === this.selectedPlayer ? 'selected' : ''}>${player.name}</option>`).join('');
    }

    renderPlayerPicksInterface() {
        const container = document.getElementById('player-picks-interface');
        
        if (!this.selectedPlayer) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');
        
        const player = this.players.find(p => p.name === this.selectedPlayer);
        const usedTeams = Object.values(player.picks || {});
        const currentWeekPick = player.picks?.[this.settings.currentWeek];
        
        // Render used teams
        document.getElementById('used-teams-list').innerHTML = usedTeams.length > 0 
            ? usedTeams.map(team => `<span class="used-team">${this.teamAbbreviations[team]}</span>`).join('')
            : '<span class="status-message info" style="padding: 8px; margin: 0;">No teams used yet</span>';
        
        // Render available picks
        this.renderAvailablePicks(player, currentWeekPick);
    }

    renderAvailablePicks(player, currentWeekPick) {
        const container = document.getElementById('available-picks-list');
        const games = this.schedule[this.settings.currentWeek] || [];
        const usedTeams = Object.values(player.picks || {});
        
        if (currentWeekPick) {
            container.innerHTML = `
                <div class="current-pick">
                    <strong>Your Pick for Week ${this.settings.currentWeek}:</strong><br>
                    ${currentWeekPick} (${this.teamAbbreviations[currentWeekPick]})
                    <button class="btn btn--sm btn--outline" onclick="pickEmPool.changePick('${player.name}', ${this.settings.currentWeek})" style="margin-left: 16px;">Change Pick</button>
                </div>
            `;
            return;
        }

        const availableOptions = [];
        games.forEach(game => {
            [game.away, game.home].forEach(team => {
                if (!usedTeams.includes(team)) {
                    availableOptions.push({
                        team: team,
                        opponent: team === game.away ? game.home : game.away,
                        game: game
                    });
                }
            });
        });

        if (availableOptions.length === 0) {
            container.innerHTML = '<div class="status-message error">No available teams for this week. All teams in this week\'s games have been used.</div>';
            return;
        }

        container.innerHTML = availableOptions.map(option => `
            <div class="pick-option" onclick="pickEmPool.makePick('${player.name}', ${this.settings.currentWeek}, '${option.team}')">
                <div class="pick-teams">
                    <strong>${option.team}</strong> vs ${option.opponent}
                </div>
                <div class="pick-game-time">${option.game.date} ${option.game.time}</div>
            </div>
        `).join('');
    }

    makePick(playerName, week, team) {
        const player = this.players.find(p => p.name === playerName);
        if (!player) return;

        if (!player.picks) player.picks = {};
        player.picks[week] = team;
        
        this.renderPlayerPicksInterface();
        this.showMessage(`Pick saved: ${team} for Week ${week}`, 'success');
        this.saveToStorage();
    }

    changePick(playerName, week) {
        const player = this.players.find(p => p.name === playerName);
        if (!player || !player.picks) return;

        delete player.picks[week];
        this.renderPlayerPicksInterface();
        this.saveToStorage();
    }

    renderStandingsTab() {
        document.getElementById('standings-week').textContent = this.settings.currentWeek;
        
        const standings = this.calculateStandings();
        const container = document.getElementById('standings-table');
        
        container.innerHTML = `
            <div class="standings-row header">
                <div class="standings-rank">Rank</div>
                <div class="standings-name">Player</div>
                <div class="standings-points">Points</div>
                <div class="standings-record">Record</div>
                <div class="standings-trend">Trend</div>
            </div>
            ${standings.map((player, index) => `
                <div class="standings-row">
                    <div class="standings-rank">${index + 1}</div>
                    <div class="standings-name">${player.name}</div>
                    <div class="standings-points">${player.points}</div>
                    <div class="standings-record">${player.wins}-${player.losses}</div>
                    <div class="standings-trend">${this.getTrendIcon(player.trend)}</div>
                </div>
            `).join('')}
        `;
    }

    calculateStandings() {
        return this.players.map(player => {
            let points = 0;
            let wins = 0;
            let losses = 0;
            let trend = [];

            for (let week = 1; week <= this.settings.currentWeek; week++) {
                const pick = player.picks?.[week];
                if (pick) {
                    const games = this.schedule[week] || [];
                    const game = games.find(g => g.away === pick || g.home === pick);
                    
                    if (game && game.result) {
                        if (game.result === pick) {
                            points++;
                            wins++;
                            trend.push('W');
                        } else {
                            losses++;
                            trend.push('L');
                        }
                    }
                }
            }

            return {
                name: player.name,
                points,
                wins,
                losses,
                trend: trend.slice(-3) // Last 3 games
            };
        }).sort((a, b) => b.points - a.points);
    }

    getTrendIcon(trend) {
        return trend.map(result => result === 'W' ? '🟢' : '🔴').join('');
    }

    renderTeamTrackerTab() {
        const container = document.getElementById('team-matrix');
        
        // Create matrix header
        const headerHtml = `
            <div class="matrix-header">
                <div class="matrix-player-name">Player</div>
                ${this.teams.map(team => `<div class="matrix-team-header">${this.teamAbbreviations[team]}</div>`).join('')}
            </div>
        `;

        // Create matrix rows
        const rowsHtml = this.players.map(player => {
            const usedTeams = Object.values(player.picks || {});
            return `
                <div class="matrix-row">
                    <div class="matrix-player-name">${player.name}</div>
                    ${this.teams.map(team => {
                        const used = usedTeams.includes(team);
                        const week = used ? Object.keys(player.picks || {}).find(w => player.picks[w] === team) : null;
                        return `<div class="matrix-cell ${used ? 'used' : 'available'}">${used ? week : ''}</div>`;
                    }).join('')}
                </div>
            `;
        }).join('');

        container.innerHTML = headerHtml + rowsHtml;
    }

    renderAdminTab() {
        this.renderPlayersList();
        this.renderResultsInterface(this.settings.currentWeek);
        this.populateResultsWeekSelector();
    }

    renderPlayersList() {
        const container = document.getElementById('players-list');
        container.innerHTML = this.players.map(player => {
            const usedTeamsCount = Object.keys(player.picks || {}).length;
            return `
                <div class="player-item">
                    <div>
                        <div class="player-info">${player.name}</div>
                        <div class="player-stats">${player.points} points • ${usedTeamsCount} teams used</div>
                    </div>
                    <button class="btn btn--sm btn--outline" onclick="pickEmPool.removePlayer('${player.name}')">Remove</button>
                </div>
            `;
        }).join('');
    }

    addPlayer() {
        const nameInput = document.getElementById('new-player-name');
        const name = nameInput.value.trim();
        
        if (!name) {
            this.showMessage('Please enter a player name', 'error');
            return;
        }

        if (this.players.find(p => p.name === name)) {
            this.showMessage('Player with this name already exists', 'error');
            return;
        }

        this.players.push({
            name: name,
            picks: {},
            points: 0
        });

        nameInput.value = '';
        this.renderCurrentView();
        this.showMessage(`Player ${name} added successfully`, 'success');
    }

    removePlayer(name) {
        if (confirm(`Are you sure you want to remove ${name} from the pool?`)) {
            this.players = this.players.filter(p => p.name !== name);
            if (this.selectedPlayer === name) {
                this.selectedPlayer = null;
            }
            this.renderCurrentView();
            this.showMessage(`Player ${name} removed`, 'success');
        }
    }

    populateResultsWeekSelector() {
        const selector = document.getElementById('results-week-select');
        selector.innerHTML = '';
        for (let week = 1; week <= this.settings.seasonWeeks; week++) {
            const option = document.createElement('option');
            option.value = week;
            option.textContent = `Week ${week}`;
            if (week === this.settings.currentWeek) {
                option.selected = true;
            }
            selector.appendChild(option);
        }
    }

    renderResultsInterface(week) {
        const container = document.getElementById('results-interface');
        const games = this.schedule[week] || [];
        
        if (games.length === 0) {
            container.innerHTML = '<div class="status-message info">No games for this week.</div>';
            return;
        }

        container.innerHTML = games.map((game, index) => `
            <div class="result-item">
                <div class="result-game">
                    ${game.away} @ ${game.home}<br>
                    <small>${game.date} ${game.time}</small>
                </div>
                <div class="result-controls">
                    <button class="result-btn away ${game.result === game.away ? 'selected' : ''}" 
                            onclick="pickEmPool.setGameResult(${week}, ${index}, '${game.away}')">
                        ${this.teamAbbreviations[game.away]}
                    </button>
                    <button class="result-btn home ${game.result === game.home ? 'selected' : ''}" 
                            onclick="pickEmPool.setGameResult(${week}, ${index}, '${game.home}')">
                        ${this.teamAbbreviations[game.home]}
                    </button>
                </div>
            </div>
        `).join('');
    }

    setGameResult(week, gameIndex, winner) {
        if (!this.schedule[week]) return;
        
        this.schedule[week][gameIndex].result = winner;
        this.updatePlayerPoints();
        this.renderResultsInterface(week);
        this.showMessage(`Game result saved: ${winner} wins`, 'success');
        this.saveToStorage();
    }

    updatePlayerPoints() {
        this.players.forEach(player => {
            let points = 0;
            
            for (let week = 1; week <= this.settings.seasonWeeks; week++) {
                const pick = player.picks?.[week];
                if (pick) {
                    const games = this.schedule[week] || [];
                    const game = games.find(g => g.away === pick || g.home === pick);
                    
                    if (game && game.result === pick) {
                        points++;
                    }
                }
            }
            
            player.points = points;
        });
    }

    resetSeason() {
        this.players.forEach(player => {
            player.picks = {};
            player.points = 0;
        });
        
        // Reset all game results
        Object.keys(this.schedule).forEach(week => {
            this.schedule[week].forEach(game => {
                game.result = null;
            });
        });
        
        this.settings.currentWeek = 1;
        this.selectedPlayer = null;
        
        this.renderCurrentView();
        this.showMessage('Season reset successfully', 'success');
    }

    exportData() {
        const data = {
            players: this.players,
            schedule: this.schedule,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nfl-pickem-pool-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('Data exported successfully', 'success');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.status-message');
        existingMessages.forEach(msg => {
            if (msg.parentElement && msg.parentElement.classList.contains('container')) {
                msg.remove();
            }
        });

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `status-message ${type}`;
        messageDiv.textContent = message;
        
        // Insert at top of container
        const container = document.querySelector('.container');
        const header = container.querySelector('.header');
        if (header && header.nextSibling) {
            container.insertBefore(messageDiv, header.nextSibling);
        } else {
            container.insertBefore(messageDiv, container.firstChild);
        }
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }

    saveToStorage() {
        const data = {
            players: this.players,
            schedule: this.schedule,
            settings: this.settings,
            selectedPlayer: this.selectedPlayer
        };
        localStorage.setItem('nfl-pickem-pool', JSON.stringify(data));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('nfl-pickem-pool');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.players = data.players || this.players;
                this.schedule = { ...this.schedule, ...data.schedule };
                this.settings = { ...this.settings, ...data.settings };
                this.selectedPlayer = data.selectedPlayer;
            } catch (e) {
                console.error('Error loading from storage:', e);
            }
        }
    }
}

// Initialize the application
let pickEmPool;
document.addEventListener('DOMContentLoaded', () => {
    pickEmPool = new PickEmPool();
});