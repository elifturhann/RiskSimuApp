# 🎮 Risk Simulation Game

An educational browser-based simulation designed to help students understand and apply risk management principles in a practical and interactive way.

---

## 🧠 Project Description

The Risk Simulation Game allows users to experience the process of identifying, assessing, and mitigating risks in a simulated project environment. Players are given a series of fictional project scenarios and must make strategic decisions on how to handle various risks based on probability and impact.

The tool is primarily intended for academic use, supporting instructors and learners in the field of project and risk management.

---

## 🚧 Development Summary

This project was developed as part of a software project course at Vaasa University of Applied Sciences. The focus was on iterative development, team collaboration, and real-world project management practices.

### Key Phases:

- **Planning**: Gathered requirements, designed initial wireframes, and created a shared understanding of goals and responsibilities.
- **Implementation**: Developed core features such as risk logic, Excel export, UI elements, and teacher tools.
- **Testing & Finalization**: Conducted internal testing, user feedback sessions, and made adjustments based on performance and usability.

---

## ✅ Key Features

- **🎲 Realistic Risk Logic**: Each risk has a defined probability and impact; the game uses randomness and logic to determine outcomes.
- **📈 Export Capability**: Users can export their risk data at any stage of the game to Excel for further analysis or grading.
- **🎯 Grading Mode**: Optional scoring mechanism to simulate academic evaluation.
- **🧑‍🏫 Teacher Shortcuts**: Quick-fill buttons and hidden features allow instructors to demonstrate functionality without manually entering data.
- **💡 Intuitive UI**: Redesigned interface with better structure, input validation, and a more accessible user flow.

---

## 🛠 How to Run

> This is a static web application and runs entirely in the browser.

### Option 1: Run Locally (No Server)

1. Download or clone this repository.
2. Open the `index.html` file in any modern web browser (Chrome, Firefox, Edge, etc.).
3. Start playing!

### Option 2: Run with Localhost (if file restrictions occur)

Some features like Excel export may not work due to browser security policies. In that case:

```bash
# If you have Python 3 installed
python3 -m http.server 8000
# Visit http://localhost:8000 in your browser
