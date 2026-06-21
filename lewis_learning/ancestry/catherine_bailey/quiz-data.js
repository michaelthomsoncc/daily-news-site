    const CORRECT = {
      "ep1-1": "18 March 1798 in Earsdon",
      "ep1-2": "25 July 1818",
      "ep1-3": "Scotland",
      "ep1-4": "Bottle finisher (glass worker)",
      "ep1-5": "Five years old",
      "ep1-6": "Her mother Jane",
      "ep2-1": ["Jarrow", "Gateshead", "Heworth", "Bill Quay"],
      "ep2-2": "Six",
      "ep2-3": "1832 in Jarrow",
      "ep2-4": "Matthew Thompson — bottle glass finisher (South Shields / Sunderland)",
      "ep2-5": "Glasgow",
      "ep2-6": "Scottish husbands coming south to marry in — the family stayed in the North East",
      "ep3-1": "1879 in Monkwearmouth",
      "ep3-2": "Labourer and plater's helper in the shipyards",
      "ep3-3": "Born 1915 — plater's helper in the shipyards",
      "ep3-4": "1937 in Sunderland",
      "ep3-5": "Engineer on the Blue Streak rocket project",
      "ep3-6": "Fifth great-grandmother (married at St Alban's in 1818)"
    };

    const episodes = [
      {
        id: "ep1", num: 1, file: "01-charlottes-earsdon.mp3", script: "1-charlottes-earsdon.txt",
        title: "Charlotte's Earsdon",
        desc: "1798 birth, St Alban's, and the 1818 wedding that starts our line.",
        quiz: [
          { id: "ep1-1", type: "single", text: "When and where was Charlotte Bailey born?", options: ["18 March 1798 in Earsdon", "25 July 1818 in Earsdon", "18 March 1798 in Glasgow", "1798 in North Shields"] },
          { id: "ep1-2", type: "single", text: "When did Charlotte marry David Barclay at St Alban's?", options: ["25 July 1818", "18 March 1798", "1832 in Jarrow", "1851 in Sunderland"] },
          { id: "ep1-3", type: "single", text: "Where was David Barclay from originally?", options: ["Scotland", "Earsdon", "Sunderland", "London"] },
          { id: "ep1-4", type: "single", text: "What was David Barclay's trade?", options: ["Bottle finisher (glass worker)", "Coal miner", "Shipyard plater", "Rocket engineer"] },
          { id: "ep1-5", type: "single", text: "Charlotte's father died when she was…", options: ["Five years old", "Twenty years old", "At her wedding", "She never knew him as a baby"] },
          { id: "ep1-6", type: "single", text: "Who brought Charlotte up after her father died?", options: ["Her mother Jane", "David Barclay", "Monks from Tynemouth Priory", "Her grandmother in Scotland"] }
        ]
      },
      {
        id: "ep2", num: 2, file: "02-north-east-scottish.mp3", script: "2-north-east-scottish.txt",
        title: "North East & Scottish Blood",
        desc: "Glassworks villages, losses, marriages, and Scots coming south.",
        quiz: [
          { id: "ep2-1", type: "multiple", text: "Where did the family move for glassworks after Earsdon? (Select all that apply)", options: ["Jarrow", "Gateshead", "Heworth", "Bill Quay", "London", "Glasgow"] },
          { id: "ep2-2", type: "single", text: "How many children did Charlotte and David raise?", options: ["Six", "Two", "Ten", "None survived"] },
          { id: "ep2-3", type: "single", text: "Catherine Elizabeth Barclay was born…", options: ["1832 in Jarrow", "1818 in Earsdon", "1857 in Sunderland", "1879 in Monkwearmouth"] },
          { id: "ep2-4", type: "single", text: "In 1851 Catherine married…", options: ["Matthew Thompson — bottle glass finisher (South Shields / Sunderland)", "John Thomson from Glasgow", "David Barclay from Scotland", "William Thomson the shipyard worker"] },
          { id: "ep2-5", type: "single", text: "John Thomson (who married Charlotte Thompson) was born in…", options: ["Glasgow", "Earsdon", "Jarrow", "Monkwearmouth"] },
          { id: "ep2-6", type: "single", text: "Scottish blood entered our family mainly because…", options: ["Scottish husbands coming south to marry in — the family stayed in the North East", "The whole family emigrated to Scotland", "Charlotte was born in Glasgow", "The family left the North East for London"] }
        ]
      },
      {
        id: "ep3", num: 3, file: "03-from-church-to-you.mp3", script: "3-from-church-to-you.txt",
        title: "From This Church to You",
        desc: "Shipyards, David Boyle Thomson, Blue Streak, and the walk home.",
        quiz: [
          { id: "ep3-1", type: "single", text: "William Thomson (3rd great-grandfather) was born…", options: ["1879 in Monkwearmouth", "1915 in Sunderland", "1937 in Sunderland", "1857 in the North East"] },
          { id: "ep3-2", type: "single", text: "William Thomson worked as…", options: ["Labourer and plater's helper in the shipyards", "Bottle finisher in Jarrow", "Cartman and engine driver only", "Blue Streak rocket engineer"] },
          { id: "ep3-3", type: "single", text: "Your great-great-grandfather David Boyle Thomson…", options: ["Born 1915 — plater's helper in the shipyards", "Born 1937 — Blue Streak engineer", "Born 1798 — married at St Alban's", "Born 1832 in Jarrow — glass finisher"] },
          { id: "ep3-4", type: "single", text: "Your great-grandfather David Boyle Thomson was born…", options: ["1937 in Sunderland", "1915 in the shipyards", "1879 in Monkwearmouth", "1818 at St Alban's"] },
          { id: "ep3-5", type: "single", text: "Your grandad's notable career included…", options: ["Engineer on the Blue Streak rocket project", "Bottle finisher at Heworth glassworks", "Monk at Tynemouth Priory", "Captain of a collier ship"] },
          { id: "ep3-6", type: "single", text: "Charlotte Bailey is your…", options: ["Fifth great-grandmother (married at St Alban's in 1818)", "Grandmother from Sunderland", "Third great-grandmother from Glasgow", "Sister of David Barclay"] }
        ]
      }
    ];