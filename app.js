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
