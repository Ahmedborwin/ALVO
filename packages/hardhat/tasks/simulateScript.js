const { simulateScript, decodeResult } = require("@chainlink/functions-toolkit")
const path = require("path")
const process = require("process")
const fetchNFTMetadata = require("../scripts/updateTokenURI")

function decodeMatchResult(buffer) {
  if (buffer.length < 200) {
    throw new Error(`Buffer too short, expected at least 200 bytes, got ${buffer.length} bytes`)
  }

  const team1Goals = buffer.readUInt8(0)
  const team2Goals = buffer.readUInt8(1)
  let offset = 2

  const decodeTeamData = () => {
    const team = []
    for (let i = 0; i < 11; i++) {
      const player = {
        player_id: buffer.readUInt32BE(offset),
        overall_rating: buffer.readUInt8(offset + 6),
        Attack: buffer.readUInt8(offset + 7),
        Midfield: buffer.readUInt8(offset + 8),
        Defense: buffer.readUInt8(offset + 9),
        Goalkeeping: buffer.readUInt8(offset + 10),
      }
      team.push(player)
      offset += 10 // Move to the next player
    }
    return team
  }

  const team1 = decodeTeamData()
  const team2 = decodeTeamData()
  return {
    team1Goals,
    team2Goals,
    team1,
    team2,
  }
}

task("functions-simulate-script", "Executes the JavaScript source code locally")
  .addOptionalParam(
    "configpath",
    "Path to Functions request config file",
    `${__dirname}/../Functions-request-config.js`,
    types.string
  )
  .setAction(async (taskArgs, hre) => {
    const requestConfig = require(path.isAbsolute(taskArgs.configpath)
      ? taskArgs.configpath
      : path.join(process.cwd(), taskArgs.configpath))

    // Simulate the JavaScript execution locally
    const { responseBytesHexstring, errorString, capturedTerminalOutput } = await simulateScript(requestConfig)
    console.log(`${capturedTerminalOutput}\n`)
    console.log(responseBytesHexstring)
    if (typeof responseBytesHexstring === "string") {
      console.log("-------------Start decoding enigma------------")
      if (responseBytesHexstring.startsWith("0x")) {
        hexResult = responseBytesHexstring.substring(2)
      }
      const buffer = Buffer.from(hexResult, "hex")
      if (buffer.length >= 200) {
        const decodedData = decodeMatchResult(buffer)
        if (decodedData) {
          console.log("Data Decoded!")
          decodedData.team1[0].overall_rating
          //here i want to update the tokenURI for one of my tokens
          const metaData = await fetchNFTMetadata(hre, decodedData)
        }
      } else {
        console.error("Buffer is too short to decode.")
      }
    }
    if (errorString) {
      console.log(`Error returned by simulated script:\n${errorString}\n`)
    }
  })
