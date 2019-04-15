import java.io.File
import java.nio.charset.Charset

val PATH = "."
fun readFiles(): List<String> {
    val filesList = File(PATH).listFiles { _, name -> name.endsWith(".csv") }
    return filesList.flatMap { it.readLines(Charset.defaultCharset()).drop(1) }
}

val lines = readFiles()
val head2head: MutableMap<Pair<String, String>, Int> = mutableMapOf()
val teams: MutableSet<String> = mutableSetOf()

lines.forEach {
    val parts = it.split(",")
    val team1 = parts[0]
    val team2 = parts[1]
    val winner = parts[2]
    if (winner != team1 && winner != team2) return@forEach //todo: handle abandoned and tied
    val loser = if (winner == team1) team2 else team1

    teams.add(winner)
    teams.add(loser)
    head2head.merge(Pair(winner, loser), 1, Int::plus)
}

val teamNames = teams.toList()
val matrix: Array<IntArray> = Array(teamNames.size) { IntArray(teamNames.size) }
teamNames.forEachIndexed { index1, name1 ->
    teamNames.forEachIndexed { index2, name2 ->
        matrix[index1][index2] = head2head.getOrDefault(Pair(name1, name2), 0)
    }
}

teamNames.forEach { print("\"$it\",") }
println()
matrix.forEach { row ->
    print('[')
    row.forEach { cell -> print("$cell,") }
    println("],")
}

