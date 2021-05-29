
const readline = require("readline");
const fs = require("fs");
const { google } = require("googleapis");
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
];

const TOKEN_PATH = "token.json";

function readFileJSONPromise(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, content) => {
      if (err || !content) {
        console.log("Failed to load file:", filename);
        reject(err);
      }
      try {
        resolve(JSON.parse(content));
      } catch (e) {
        console.log(
          "Failed to JSON parse file:",
          filename,
          " | Content:",
          content
        );
        reject(e);
      }
    });
  });
}

function tryToAuthorize(credentials) {
  return new Promise((resolve, reject) => {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
    readFileJSONPromise(TOKEN_PATH)
      .then((token) => {
        oAuth2Client.setCredentials(token);
        resolve(oAuth2Client);
      })
      .catch((err) => {
        console.log("Failed to load ", TOKEN_PATH, "due to ", err);
        const authUrl = oAuth2Client.generateAuthUrl({
          access_type: "offline",
          scope: SCOPES,
        });
        console.log("Authorize this app by visiting this url:", authUrl);
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.question("Enter the code from that page here: ", (code) => {
          rl.close();
          oAuth2Client.getToken(code, (err, token) => {
            if (err) {
              reject(err);
              return console.error(
                "Error while trying to retrieve access token",
                err
              );
            }
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
              if (err) {
                reject(err);
                return console.error(err);
              }
              console.log("Token stored to", TOKEN_PATH);
            });
            resolve(oAuth2Client);
          });
        });
      });
  });
}

function getSheetsHandler() {
  return new Promise((resolve, reject) => {
    resolve("testing");
    return;
    try {
      readFileJSONPromise("credentials.json").then((credentials) => {
        tryToAuthorize(credentials).then((oAuth2Client) => {
          const sheets = google.sheets({ version: "v4", auth:oAuth2Client });
          resolve(sheets);
        });
      });
    } catch (e) {
      reject(e);
    }
  });
}

function getSheetContent(sheetHandler){


    return new Promise((resolve,reject)=>{

        if(sheetHandler === "testing"){
            resolve({ range: 'Sheet1!A1:G97',
            majorDimension: 'ROWS',
            values:
             [ [ 'Slot Start',
                 'Slot End',
                 'Delhi',
                 'Mumbai',
                 'Kolkata',
                 'Hyderabad',
                 'Chennai' ],
               [ '12:00 AM',
                 '12:15 AM',
                 '',
                 'Yashada',
                 'Shristi',
                 'Poojari Bhavana',
                 'Poojari Bhavana' ],
               [ '12:15 AM', '12:30 AM', 'AK', 'AK', '', 'Sucheta', 'Sucheta' ],
               [ '12:30 AM',
                 '12:45 AM',
                 'Nirav Shah',
                 'Nirav Shah',
                 '',
                 '',
                 'Vignesh Sundar' ],
               [ '12:45 AM', '1:00 AM', '', 'Shivani Pandit', '', '', 'Shreyas' ],
               [ '1:00 AM', '1:15 AM', 'AG', 'AG', '', 'Ravi', 'Ravi' ],
               [ '1:15 AM', '1:30 AM', 'Merugu Saicharan', 'Merugu Saicharan' ],
               [ '1:30 AM', '1:45 AM', '', 'Fall', '', 'Amal Jose', 'Amal Jose' ],
               [ '1:45 AM', '2:00 AM' ],
               [ '2:00 AM', '2:15 AM', '', 'fd' ],
               [ '2:15 AM', '2:30 AM', 'Akki Pranay', 'Akki Pranay' ],
               [ '2:30 AM', '2:45 AM' ],
               [ '2:45 AM', '3:00 AM' ],
               [ '3:00 AM', '3:15 AM', 'Bipsa', 'Bipsa' ],
               [ '3:15 AM', '3:30 AM' ],
               [ '3:30 AM', '3:45 AM' ],
               [ '3:45 AM', '4:00 AM' ],
               [ '4:00 AM', '4:15 AM', 'manali', 'manali' ],
               [ '4:15 AM', '4:30 AM' ],
               [ '4:30 AM', '4:45 AM', 'Shambavi', 'Yashada' ],
               [ '4:45 AM', '5:00 AM' ],
               [ '5:00 AM',
                 '5:15 AM',
                 'Dhanya Ravishankar',
                 'Dhanya Ravishankar',
                 '',
                 'Santosh Appachu',
                 'Santosh Appachu' ],
               [ '5:15 AM', '5:30 AM' ],
               [ '5:30 AM', '5:45 AM', '', 'Sanket Khule' ],
               [ '5:45 AM', '6:00 AM', '', '', '', '~vs~', '~vs~' ],
               [ '6:00 AM', '6:15 AM', '', '', '', 'Srhth', 'Srhth' ],
               [ '6:15 AM', '6:30 AM' ],
               [ '6:30 AM',
                 '6:45 AM',
                 'Rahul Reddy',
                 'Rahul Reddy',
                 'Rahul Reddy',
                 'Abhipriti',
                 'Abhipriti' ],
               [ '6:45 AM', '7:00 AM' ],
               [ '7:00 AM',
                 '7:15 AM',
                 'Krutika Gandhi',
                 'Krutika Gandhi',
                 '',
                 'Santosh Appachu',
                 'Santosh Appachu' ],
               [ '7:15 AM', '7:30 AM', '', 'Jam' ],
               [ '7:30 AM',
                 '7:45 AM',
                 '',
                 'Surabhi',
                 'Surabhi',
                 'Surabhi',
                 'Surabhi' ],
               [ '7:45 AM', '8:00 AM', 'Vee', 'Vee', '', 'Pradeep', 'Pradeep' ],
               [ '8:00 AM', '8:15 AM', 'Jaskiran', 'Jaskiran', '', 'Jaskiran' ],
               [ '8:15 AM',
                 '8:30 AM',
                 'Shambavi',
                 'Sheona Kankani',
                 'Sheona Kankani',
                 'Raman' ],
               [ '8:30 AM',
                 '8:45 AM',
                 'Neelima Nayak',
                 'Neelima Nayak',
                 '',
                 'Satish Anil Nair',
                 'Satish Anil Nair' ],
               [ '8:45 AM',
                 '9:00 AM',
                 '',
                 'Hiranmaya Gundu',
                 'Hiranmaya Gundu',
                 '',
                 'Sharan S' ],
               [ '9:00 AM',
                 '9:15 AM',
                 '',
                 'Shrutika',
                 '',
                 'Shashank Venkatesh',
                 'Shashank Venkatesh' ],
               [ '9:15 AM',
                 '9:30 AM',
                 'Archit Nigam',
                 'Archit Nigam',
                 '',
                 'Harshavardhan Bapat',
                 'Harshavardhan Bapat' ],
               [ '9:30 AM', '9:45 AM', '', 'Joselin', 'Joselin' ],
               [ '9:45 AM', '10:00 AM', 'Ayush Gupta', 'Ayush Gupta', 'BM', 'BM' ],
               [ '10:00 AM',
                 '10:15 AM',
                 'Shreya',
                 'Sharu',
                 'Sarbeswar',
                 'Sharu',
                 'Akshara' ],
               [ '10:15 AM',
                 '10:30 AM',
                 '',
                 'Ketaki',
                 'Soham',
                 'Darshan',
                 'Darshan' ],
               [ '10:30 AM',
                 '10:45 AM',
                 'Karan Hiranandani',
                 'Karan Hiranandani',
                 'Amar B',
                 'Revanth Reddy' ],
               [ '10:45 AM',
                 '11:00 AM',
                 'Sameer',
                 'Sameer',
                 '',
                 'Anu Manukonda',
                 'Anu Manukonda' ],
               [ '11:00 AM',
                 '11:15 AM',
                 'Archi',
                 'Adarsh',
                 'Archi',
                 'Likhitha',
                 'Adarsh' ],
               [ '11:15 AM',
                 '11:30 AM',
                 'Shashidhar Pai',
                 'Shashidhar Pai',
                 'Shailendra',
                 'SK',
                 'SK' ],
               [ '11:30 AM',
                 '11:45 AM',
                 'Dheeraj',
                 'Aishwarya Naidu',
                 'Sree Lasya',
                 'Sree Lasya',
                 'Aishwarya Naidu' ],
               [ '11:45 AM', '12:00 PM', 'Neha', 'Neha', '', 'Pujitha', 'Pujitha' ],
               [ '12:00 PM',
                 '12:15 PM',
                 'srush',
                 'srush',
                 'Shristi',
                 'Prashant Vedula',
                 'Akshara' ],
               [ '12:15 PM', '12:30 PM', 'Sai K', 'Abhi', '', 'Abhi' ],
               [ '12:30 PM',
                 '12:45 PM',
                 'Ashish',
                 'Mugdha G',
                 'Sri Ramineni',
                 'Aaditi Shyam',
                 'Sri Ramineni' ],
               [ '12:45 PM',
                 '1:00 PM',
                 'Simran Koul',
                 'Pragnesh',
                 '',
                 'Vishith Goud' ],
               [ '1:00 PM',
                 '1:15 PM',
                 'Sumukh',
                 'Sumukh',
                 'M',
                 'Apoorva Reddy',
                 'Apoorva Reddy' ],
               [ '1:15 PM',
                 '1:30 PM',
                 'Simran Koul',
                 'Chelsea (Cf)',
                 'VRR',
                 'VRR',
                 'Chelsea (Cf)' ],
               [ '1:30 PM',
                 '1:45 PM',
                 'Dedeep',
                 'Kartik Vora',
                 'AB',
                 'AB',
                 'Dedeep' ],
               [ '1:45 PM', '2:00 PM', 'Shailendra', 'Reeya', '', 'Reeya' ],
               [ '2:00 PM',
                 '2:15 PM',
                 '',
                 'Lubaina Kanpurwala',
                 'Lubaina Kanpurwala',
                 'Prabha',
                 'Prabha' ],
               [ '2:15 PM',
                 '2:30 PM',
                 'Gomathy CG',
                 'Gomathy CG',
                 '',
                 'Aravind',
                 'Aravind' ],
               [ '2:30 PM',
                 '2:45 PM',
                 'Krutika Gandhi',
                 'Krutika Gandhi',
                 '',
                 'Deepak Jayan',
                 'Deepak Jayan' ],
               [ '2:45 PM',
                 '3:00 PM',
                 '',
                 'Aishwarya',
                 'Aishwarya',
                 'Sagarika Ramesh',
                 'Sagarika Ramesh' ],
               [ '3:00 PM',
                 '3:15 PM',
                 'Hitesh',
                 'Hitesh',
                 'Aditya Nayak',
                 'Aditya Nayak',
                 'Lalith Dupathi' ],
               [ '3:15 PM', '3:30 PM', 'Athul', 'O', 'Athul', 'O', 'Athul' ],
               [ '3:30 PM', '3:45 PM', '', 'Pragnesh', '', 'Revanth Reddy' ],
               [ '3:45 PM',
                 '4:00 PM',
                 'A M',
                 'Aditya',
                 'Gowtham',
                 'Sushant Menon',
                 'Sushant Menon' ],
               [ '4:00 PM',
                 '4:15 PM',
                 'A M',
                 'Hitakshi',
                 'Amar B',
                 'Prashant Vedula',
                 'Prashant Vedula' ],
               [ '4:15 PM',
                 '4:30 PM',
                 'Kanika Agarwal',
                 'Kanika Agarwal',
                 'Gowtham',
                 'Nithin Reddy',
                 'Nithin Reddy' ],
               [ '4:30 PM',
                 '4:45 PM',
                 'Meghana',
                 'Ajeya',
                 'Meghana',
                 'Ajeya',
                 'Ajeya' ],
               [ '4:45 PM', '5:00 PM', '', 'Aastha', '', 'Aastha' ],
               [ '5:00 PM', '5:15 PM', 'Omkar', 'Omkar', '', 'Ankita Kumari' ],
               [ '5:15 PM', '5:30 PM', 'Saharsh', 'Saharsh' ],
               [ '5:30 PM',
                 '5:45 PM',
                 '',
                 'Mugdha G',
                 'Nazmee',
                 'Nazmee',
                 'Namrata' ],
               [ '5:45 PM', '6:00 PM', '', 'Jam' ],
               [ '6:00 PM', '6:15 PM', 'Rutvi', 'Rutvi', 'Jefin', 'Sid', 'Jefin' ],
               [ '6:15 PM', '6:30 PM', 'Shreya', 'A', 'A', 'Sid' ],
               [ '6:30 PM',
                 '6:45 PM',
                 '',
                 'Raksha',
                 'Sriraj Vuppala',
                 'Sriraj Vuppala',
                 'Raksha' ],
               [ '6:45 PM',
                 '7:00 PM',
                 'Shreya',
                 'Shreya',
                 '',
                 'Shravan',
                 'Shravan' ],
               [ '7:00 PM', '7:15 PM', 'Ayush Tripati', 'Ketaki', '', '', 'M' ],
               [ '7:15 PM',
                 '7:30 PM',
                 '',
                 'Sanya Shaikh',
                 '',
                 '',
                 'Vignesh Sundar' ],
               [ '7:30 PM', '7:45 PM', 'Aayush', 'Aayush', '', 'Arjun', 'Arjun' ],
               [ '7:45 PM',
                 '8:00 PM',
                 'Karan Hiranandani',
                 'Karan Hiranandani',
                 '',
                 '',
                 'Shreyas' ],
               [ '8:00 PM',
                 '8:15 PM',
                 'Aki',
                 'Kartik Vora',
                 '',
                 'G Roshan Krishna',
                 'G Roshan Krishna' ],
               [ '8:15 PM', '8:30 PM', 'Sandesh', 'Jui Dixit', 'Sandesh' ],
               [ '8:30 PM',
                 '8:45 PM',
                 'Rakshith Gowda VR',
                 'Aishwarya',
                 'Rakshith Gowda VR',
                 'Aishwarya' ],
               [ '8:45 PM', '9:00 PM', 'Sai K', 'Sai K', '', 'Ankita Kumari' ],
               [ '9:00 PM',
                 '9:15 PM',
                 '',
                 'Abhiram Daivala',
                 '',
                 'Aditya',
                 'Aditya' ],
               [ '9:15 PM',
                 '9:30 PM',
                 'P Man',
                 'Mohan Gopi Sai Paleti',
                 '',
                 'P Man',
                 'Mohan Gopi Sai Paleti' ],
               [ '9:30 PM',
                 '9:45 PM',
                 '',
                 'Vikrant D',
                 'Vikrant D',
                 'Vishith Goud',
                 'Sharan S' ],
               [ '9:45 PM',
                 '10:00 PM',
                 'Gomathy CG',
                 'Gomathy CG',
                 'Gaurav Atavale',
                 'Aditya Sarma',
                 'Gaurav Atavale' ],
               [ '10:00 PM',
                 '10:15 PM',
                 'Ayush Tripati',
                 'Ashish',
                 'Sarbeswar',
                 '',
                 'Lalith Dupathi' ],
               [ '10:15 PM',
                 '10:30 PM',
                 'Ankita',
                 'Ankita',
                 'Sruthi N',
                 'Sruthi N' ],
               [ '10:30 PM',
                 '10:45 PM',
                 '',
                 'Sanket Khule',
                 '',
                 'Saideep',
                 'Saideep' ],
               [ '10:45 PM',
                 '11:00 PM',
                 'Kruti',
                 'Kruti',
                 '',
                 'Saurav S',
                 'Saurav S' ],
               [ '11:00 PM',
                 '11:15 PM',
                 'Dheeraj',
                 'Shivani Pandit',
                 '',
                 'Likhitha' ],
               [ '11:15 PM', '11:30 PM', 'H Zahir', 'H Zahir' ],
               [ '11:30 PM',
                 '11:45 PM',
                 '',
                 'Aashish T',
                 '',
                 'Aashish T',
                 'Namrata' ],
               [ '11:45 PM',
                 '12:00 AM',
                 'Rishikesh',
                 'Rishikesh',
                 'Soham',
                 'Archit',
                 'Archit' ] ] })
        }


        sheetHandler.spreadsheets.values.get({
            spreadsheetId: '19wMHwwqWJjUCIY6JMjfgbKa1sYUc3kez0gtaq773wtQ',
            range: 'A1:G97',
          }, (err, res) => {
            if (err){
                console.log('The API returned an error: ' + err);
                reject(err);
                return;
            } 
            const rows = res.data.values;
            resolve(res.data);
          });
    })
}
module.exports={getSheetsHandler,getSheetContent};