// build HTTP request object
const athleteId = args[0];

const stravaGetAtheleteRequest = Functions.makeHttpRequest({
  url: `https://www.strava.com/api/v3/athletes/${athleteId}/stats`,
  headers: {
    "Content-Type": `application/json`,
    Authorization: `Bearer ${secrets.accessToken}`,
  },
});

// Make the HTTP request
const stravaGetAtheleteResponse = await stravaGetAtheleteRequest;

if (stravaGetAtheleteResponse.error) {
  console.log(JSON.stringify(stravaGetAtheleteResponse));
  throw new Error("STRAVA Error", stravaGetAtheleteResponse.error);
}

const data = stravaGetAtheleteResponse["data"];
if (data.Response === "Error") {
  console.error(data.Message);
  throw Error(`Functional error. Read message: ${data.Message}`);
}

const { distance } = data["all_run_totals"];

const result = parseInt(distance);

return Functions.encodeUint256(result);
