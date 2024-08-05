import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"];

async function setupAPI() {
  const tokenFile = Bun.file(__dirname + "/../config/yt.json");
  const credentials = await tokenFile.json();
  const oAuth2Client = new google.auth.OAuth2(
    credentials.clientId,
    credentials.clientSecret,
    "http://localhost",
  );

  google.options({ auth: oAuth2Client });
  oAuth2Client.setCredentials(credentials.token);
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this url:", authUrl);
  for await (const code of console) {
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error("Error retrieving access token", err);
        return;
      }
      console.log(token);
    });
  }
}
setupAPI();
