SafeWalk 🚶‍♂️🛡️
SafeWalk is a web-based safety reporting and visualization platform designed to help identify and highlight unsafe areas in urban environments. It enables users to report safety-related issues in real time and visualizes risk levels on an interactive map to support safer movement through cities.


🌍 Problem Statement
In many cities, people often feel unsafe while walking due to poor lighting, harassment, isolated streets, or violent incidents. There is no simple, community-driven way to visualize such safety risks in real time.
SafeWalk addresses this gap by allowing users to report safety issues and view them on a live map, helping others make informed decisions while navigating public spaces.

✅ Solution Overview
SafeWalk provides:
A live interactive map for reporting safety issues
Real-time updates using a cloud database
A risk scoring system that categorizes reported issues by severity
Visual indicators (color-coded markers) to quickly identify high-risk areas

🔧 Tech Stack (Google Technologies Used)
Google Firebase Hosting – for deploying the live MVP
Google Firestore – for real-time data storage and updates
Leaflet.js – for interactive map rendering
Vanilla JavaScript, HTML, CSS – frontend implementation

⚙️ How It Works
Users click the “Report Issue” button.
They select a location directly on the map.
A short description of the issue is submitted.
The system assigns a Safety Risk Score (1–5) based on the description.
Reports are saved in Firestore and appear instantly on the map.
Markers are color-coded based on risk level:
🟢 Low Risk
🟠 Moderate Risk
🔴 High Risk
📊 Safety Risk Scoring
The safety risk score is determined using a deterministic classification logic that evaluates keywords and context in the report description.
5 – Extreme danger (violence, weapons, riots)
4 – High risk (harassment, stalking, isolation, darkness)
3 – Ambiguous or unclear situations
2 – Low concern situations
1 – Clearly safe environments
(this file is ai generated)
