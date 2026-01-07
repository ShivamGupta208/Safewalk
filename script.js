/*********************************
 * FIREBASE CONFIG
 *********************************/
firebase.initializeApp({
  apiKey: "AIzaSyB9j5bS6UkpKzvUrsjMz7951KN7KJYYYLg",
  authDomain: "safewalk-b5f1f.firebaseapp.com",
  projectId: "safewalk-b5f1f",
  storageBucket: "safewalk-b5f1f.appspot.com",
  messagingSenderId: "837287770424",
  appId: "1:837287770424:web:550bc7a54ea33a8952a9cd"
});

const db = firebase.firestore();

/*********************************
 * LOADER
 *********************************/
function showLoader() {
  document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loadingOverlay").style.display = "none";
}

/*********************************
 * MAP SETUP
 *********************************/
const map = L.map("map").setView([28.6139, 77.2090], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

/*********************************
 * GLOBAL STATE
 *********************************/
let reportingEnabled = false;
const reportBtn = document.getElementById("reportBtn");

/*********************************
 * UI CONTROLS
 *********************************/
reportBtn.addEventListener("click", () => {
  reportingEnabled = true;
  reportBtn.textContent = "Click on map…";
  reportBtn.disabled = true;
});

/*********************************
 * RISK COLOR
 *********************************/
function getMarkerColor(score) {
  if (score >= 4) return "red";
  if (score === 3) return "orange";
  return "green";
}

/*********************************
 * SAFETY RISK ENGINE (NO AI)
 *********************************/
function getRiskScore(issueText) {
  const text = issueText.toLowerCase();

  if (
    text.includes("knife") ||
    text.includes("gun") ||
    text.includes("weapon") ||
    text.includes("attack") ||
    text.includes("assault") ||
    text.includes("riot") ||
    text.includes("mob")
  ) {
    return 5;
  }

  if (
    text.includes("harassment") ||
    text.includes("stalking") ||
    text.includes("drunk") ||
    text.includes("threat") ||
    text.includes("chased")
  ) {
    return 4;
  }

  if (
    text.includes("dark") ||
    text.includes("isolated") ||
    text.includes("no lights") ||
    text.includes("broken streetlight")
  ) {
    return 4;
  }

  if (
    text.includes("argument") ||
    text.includes("verbal") ||
    text.includes("suspicious")
  ) {
    return 2;
  }

  return 3;
}

/*********************************
 * MAP CLICK → SAVE REPORT
 *********************************/
map.on("click", async (e) => {
  if (!reportingEnabled) return;

  const issue = prompt("Describe the issue:");
  if (!issue) {
    resetButton();
    return;
  }

  showLoader();
  const riskScore = getRiskScore(issue);
  hideLoader();

  const reportData = {
    issue,
    lat: e.latlng.lat,
    lng: e.latlng.lng,
    time: new Date().toLocaleString(),
    riskScore
  };

  try {
    await db.collection("reports").add(reportData);
  } catch (err) {
    alert("Error submitting report");
  }

  resetButton();
});

/*********************************
 * RESET BUTTON
 *********************************/
function resetButton() {
  reportingEnabled = false;
  reportBtn.textContent = "Report Issue";
  reportBtn.disabled = false;
}

/*********************************
 * REALTIME REPORT LISTENER
 *********************************/
db.collection("reports").onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    if (change.type === "added") {
      const r = change.doc.data();
      const color = getMarkerColor(r.riskScore);

      L.circleMarker([r.lat, r.lng], {
        radius: 10,
        color,
        fillColor: color,
        fillOpacity: 0.9
      })
      .addTo(map)
      .bindPopup(`
        <b>Issue:</b> ${r.issue}<br>
        <b>Reported at:</b> ${r.time}<br>
        <b>Safety Risk Score:</b> ${r.riskScore}/5
      `);
    }
  });
});
