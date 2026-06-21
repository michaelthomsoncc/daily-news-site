    const CORRECT = {
      "ep1-1": "County Mayo",
      "ep1-2": "The 1798 Irish Rebellion (French landing at Killala)",
      "ep1-3": "Catharine Riley",
      "ep1-4": "Easington Lane",
      "ep1-5": "Hewer",
      "ep1-6": "The Great Famine",
      "ep2-1": "1868",
      "ep2-2": "Houghton-le-Spring",
      "ep2-3": "1887",
      "ep2-4": "Putters",
      "ep2-5": "Catholic chapels",
      "ep2-6": "Hetton-le-Hole and Murton",
      "ep3-1": "Murton",
      "ep3-2": "12 August 1931",
      "ep3-3": "Robert Wharton",
      "ep3-4": "St Hilda's (University College, Durham) — kitchens",
      "ep3-5": "Four",
      "ep3-6": ["Christine", "Shelagh"]
    };

    const episodes = [
      {
        id: "ep1", num: 1, file: "01-mayo-to-durham.mp3", script: "1.txt",
        title: "Mayo to Durham",
        desc: "Thady Boyle, the Penal Laws, emigration, and the first shift underground.",
        quiz: [
          { id: "ep1-1", type: "single", text: "In which Irish county was Timothy \"Thady\" Boyle born?", options: ["County Mayo", "County Durham", "Westmorland", "County Cork"] },
          { id: "ep1-2", type: "single", text: "Which event was unfolding in Ireland the year Thady was born?", options: ["The 1798 Irish Rebellion (French landing at Killala)", "The Great Famine", "The 1926 General Strike", "Philip Wharton's Hellfire Club"] },
          { id: "ep1-3", type: "single", text: "Who was Thady's wife?", options: ["Catharine Riley", "Ellen Boyle", "Charlotte Bailey", "Elizabeth Thirkle"] },
          { id: "ep1-4", type: "single", text: "Where did the Boyle family settle in County Durham?", options: ["Easington Lane", "Kirkby Stephen workhouse", "Murton shipyards", "Killala Bay"] },
          { id: "ep1-5", type: "single", text: "What was Thady's job underground?", options: ["Hewer", "Filler", "Bottle finisher", "Shepherd only — never underground"] },
          { id: "ep1-6", type: "single", text: "They left Ireland in the late 1830s, just before which catastrophe?", options: ["The Great Famine", "The Battle of Solway Moss", "Blue Streak rocket tests", "St Alban's wedding in 1818"] }
        ]
      },
      {
        id: "ep2", num: 2, file: "02-easington-roots.mp3", script: "2.txt",
        title: "Easington Roots",
        desc: "Mining life, Irish community, Catharine at home, and Thady's legacy.",
        quiz: [
          { id: "ep2-1", type: "single", text: "In which year did Thady Boyle die?", options: ["1868", "1841", "1887", "2011"] },
          { id: "ep2-2", type: "single", text: "Where did Thady die?", options: ["Houghton-le-Spring", "County Mayo", "Murton", "Rome"] },
          { id: "ep2-3", type: "single", text: "Thady's grandson John Boyle was born in which year?", options: ["1887", "1798", "1931", "1953"] },
          { id: "ep2-4", type: "single", text: "Young Boyle sons often started underground as trappers or…", options: ["Putters", "Dukes", "Rocket engineers", "Glass finishers"] },
          { id: "ep2-5", type: "single", text: "The Irish mining community helped build small…", options: ["Catholic chapels", "Glass furnaces in Jarrow", "Geostationary satellites", "Workhouses in Westmorland"] },
          { id: "ep2-6", type: "single", text: "John Boyle grew up mainly around…", options: ["Hetton-le-Hole and Murton", "County Mayo potato fields", "St Alban's, Earsdon", "Blue Streak test stands"] }
        ]
      },
      {
        id: "ep3", num: 3, file: "03-ellen-and-on.mp3", script: "3.txt",
        title: "John, Ellen & On",
        desc: "Pitmen into the twentieth century, Ellen's kitchens, and the daughters' careers.",
        quiz: [
          { id: "ep3-1", type: "single", text: "Where was John Boyle born?", options: ["Murton", "Mayo", "Monkwearmouth shipyards", "Teesdale"] },
          { id: "ep3-2", type: "single", text: "When was Ellen Boyle born?", options: ["12 August 1931", "7 January 1916", "January 1953", "1798"] },
          { id: "ep3-3", type: "single", text: "Who did Ellen marry in January 1953?", options: ["Robert Wharton", "John Boyle", "Thady Boyle", "David Barclay"] },
          { id: "ep3-4", type: "single", text: "When Robert had to retire early, Ellen went to work at…", options: ["St Hilda's (University College, Durham) — kitchens", "Sunderland shipyards as a plater", "Killala Bay fishing boats", "The Hellfire Club"] },
          { id: "ep3-5", type: "single", text: "How many daughters did Ellen and Robert have?", options: ["Four", "Six", "Thirteen", "None"] },
          { id: "ep3-6", type: "multiple", text: "Which daughters trained as nurses at Sunderland Eye Infirmary? (Select all that apply)", options: ["Christine", "Shelagh", "Susan", "Karen", "Ellen", "Catharine Riley"] }
        ]
      }
    ];