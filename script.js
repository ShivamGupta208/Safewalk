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
   * MAP SETUP
   *********************************/
  const map = L.map("map").setView([28.6139, 77.2090], 13);
  
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);
  
  /*********************************
   * GLOBAL FLAGS
   *********************************/
  let reportingEnabled = false;
  
  /*********************************
   * UI CONTROLS
   *********************************/
  document.getElementById("reportBtn").addEventListener("click", () => {
    reportingEnabled = true;
    alert("Click on the map to report an issue");
  });
  
  /*********************************
   * MARKER COLOR BASED ON RISK
   *********************************/
  function getMarkerColor(riskScore) {
    if (riskScore >= 4) return "red";
    if (riskScore === 3) return "orange";
    return "green";
  }
  
  /*********************************
   * GEMINI AI RISK SCORE FUNCTION
   *********************************/
  async function getRiskScoreFromGemini(issueText) {
    const GEMINI_API_KEY = "AIzaSyApRhOwhVzghzcFLT-1ZSmzlpyOi6p9j1A";
  
    const prompt = `
  You are a safety risk assessment system.
  Analyze the reported issue below and return ONLY a single integer between 1 and 5.
  
  1 = very safe
  5 = extremely dangerous
  
  Issue: "${issueText}"
  
  Respond with only the number.
  `;
  
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: prompt }] }
            ]
          })
        }
      );
  
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text.trim();
      const score = parseInt(text);
  
      return isNaN(score) ? 3 : Math.min(Math.max(score, 1), 5);
    } catch (error) {
      console.error("Gemini API error:", error);
      return 3;
    }
  }
  
  /*********************************
   * MAP CLICK → SAVE REPORT
   *********************************/
  map.on("click", async (e) => {
    if (!reportingEnabled) return;
  
    const issue = prompt("Describe the issue:");
    if (!issue) return;
  
    alert("Analyzing risk using AI...");
  
    const riskScore = await getRiskScoreFromGemini(issue);
  
    const reportData = {
      issue: issue,
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      time: new Date().toLocaleString(),
      riskScore: riskScore
    };
  
    try {
      await db.collection("reports").add(reportData);
      alert("Report submitted successfully");
    } catch (err) {
      console.error(err);
      alert("Error submitting report");
    }
  
    reportingEnabled = false;
  });
  
  /*********************************
   * REALTIME FIRESTORE LISTENER
   *********************************/
  db.collection("reports").onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        const r = change.doc.data();
        const color = getMarkerColor(r.riskScore);
  
        L.circleMarker([r.lat, r.lng], {
          radius: 10,
          color: color,
          fillColor: color,
          fillOpacity: 0.9
        })
        .addTo(map)
        .bindPopup(`
          <b>Issue:</b> ${r.issue}<br>
          <b>Reported at:</b> ${r.time}<br>
          <b>AI Risk Score:</b> ${r.riskScore}/5
        `);
      }
    });
  });
  