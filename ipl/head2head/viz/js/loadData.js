function loadData() {
    $.ajax({
        type: "GET",
        url: "data/2018.csv",
        dataType: "text",
        async: false,
        success: function (data) {
            processData(data);
        }
    });
    return result;
}

var teams = [];
var matchCount = {};
var head2head = {};
var allMatches = [];
var winningScore = 5;
var losingScore = 1;
var result = {matches: [], teams: [], matrix: [], uniqueTeams: [], allMatches: allMatches};

function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    allTextLines[0].split(',');
    for (var i = 1; i < allTextLines.length; i++) {
        if (allTextLines[i].length === 0) continue;
        var data = allTextLines[i].split(',');
        var team1 = data[0];
        initTeam(team1);
        var team2 = data[1];
        initTeam(team2);
        var winner = data[2];

        var team1Score = winner === team1 ? winningScore : losingScore;
        var team2Score = winner === team2 ? winningScore : losingScore;

        head2head[team1].push({opp: team2, oppMatch: matchCount[team2], score: team1Score});
        head2head[team2].push({opp: team1, oppMatch: matchCount[team1], score: team2Score});
        allMatches.push({
            team1: team1,
            team1Index: matchCount[team1],
            team2: team2,
            team2Index: matchCount[team2],
            winner: winner,
            margin: data[3],
            date: data[5].replace("\"", ""),
            venue: data[4]
        });
    }

    for (var i = 0; i < teams.length; i++) {
        var j = matchCount[teams[i]];
        for (var k = 0; k <= j; k++) {
            result["matches"].push(teams[i] + k);
            result["teams"].push(teams[i]);
        }
        result["uniqueTeams"].push(teams[i]);
    }

    for (var i = 0; i < teams.length; i++) {
        var matches = head2head[teams[i]];
        for (var k = 0; k < matches.length; k++) {
            var match = matches[k];
            var oppIndex = result["teams"].indexOf(match["opp"]) + match["oppMatch"];
            var currindex = result["teams"].indexOf(teams[i]) + k;
            var score = match["score"];
            result["matrix"][currindex] = [];
            result["matrix"][currindex][oppIndex] = score;
        }
    }

    var lastTeam = teams[teams.length - 1];
    var endIndex = result["teams"].indexOf(lastTeam) + matchCount[lastTeam];
    for (var i = 0; i <= endIndex; i++) {
        for (var j = 0; j <= endIndex; j++) {
            if (typeof result["matrix"][i][j] === 'undefined' || result["matrix"][i][j] === null) {
                result["matrix"][i][j] = 0;
            }
        }
    }
}

function initTeam(team) {
    if (team in matchCount) {
        matchCount[team]++;
    } else {
        teams.push(team);
        head2head[team] = [];
        matchCount[team] = 0;
    }
}
