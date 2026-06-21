    const CORRECT = {
      "ep1-1": "King Edward I (Longshanks)",
      "ep1-2": "Battle of Solway Moss",
      "ep1-3": "1st Baron Wharton",
      "ep1-4": "Spain, aged 33 — bankrupt and in exile",
      "ep1-5": "1794",
      "ep1-6": "East Ward Union Workhouse, Kirkby Stephen",
      "ep2-1": "1833 in the East Ward Union Workhouse, Kirkby Stephen",
      "ep2-2": "1851",
      "ep2-3": "1853 in Teesdale",
      "ep2-4": "Easington Lane",
      "ep2-5": "Coal miner",
      "ep2-6": "1893",
      "ep3-1": "Hewer",
      "ep3-2": "Filler",
      "ep3-3": "7 January 1916 in Easington Lane",
      "ep3-4": "Ellen Boyle in 1953",
      "ep3-5": "2006, aged 90",
      "ep3-6": ["1926 General Strike", "Great Depression", "Second World War"]
    };

    const episodes = [
      {
        id: "ep1", num: 1, file: "01-dukes-and-shepherd.mp3", script: "1.txt",
        title: "Dukes, Fall & John the Shepherd",
        desc: "Gilbert de Querton to Philip the Duke, then John Wharton in the workhouse.",
        quiz: [
          { id: "ep1-1", type: "single", text: "Who did Gilbert de Querton face in the royal courtroom?", options: ["King Edward I (Longshanks)", "King Henry VIII", "King George I", "Philip, Duke of Wharton"] },
          { id: "ep1-2", type: "single", text: "Thomas Wharton won a decisive victory at which battle?", options: ["Battle of Solway Moss", "Battle of Hastings", "Battle of the Boyne", "Battle of Easington Lane"] },
          { id: "ep1-3", type: "single", text: "What title did King Henry VIII give Thomas Wharton in 1544?", options: ["1st Baron Wharton", "1st Duke of Wharton", "Shepherd of Westmorland", "Colonel in the Spanish army"] },
          { id: "ep1-4", type: "single", text: "Philip, the 1st Duke of Wharton, died…", options: ["Spain, aged 33 — bankrupt and in exile", "Westmorland, aged 94 as a shepherd", "In a Durham mine in 1893", "Easington Lane in 2006, aged 90"] },
          { id: "ep1-5", type: "single", text: "When was your direct ancestor John Wharton born?", options: ["1794", "1698", "1833", "1916"] },
          { id: "ep1-6", type: "single", text: "Where was George Wharton born?", options: ["East Ward Union Workhouse, Kirkby Stephen", "St Alban's church, Earsdon", "A palace in Rome", "Cockfield colliery"] }
        ]
      },
      {
        id: "ep2", num: 2, file: "02-george-miner.mp3", script: "2.txt",
        title: "George: Workhouse to Miner",
        desc: "George leaves the workhouse, marries Elizabeth, and roots the family in Durham coal.",
        quiz: [
          { id: "ep2-1", type: "single", text: "George Wharton (great-great-grandfather) was born…", options: ["1833 in the East Ward Union Workhouse, Kirkby Stephen", "1794 in Westmorland as a shepherd", "1855 in Cockfield as a hewer", "1886 in Easington Lane as a filler"] },
          { id: "ep2-2", type: "single", text: "When did George leave the workhouse for County Durham?", options: ["1851", "1833", "1893", "1953"] },
          { id: "ep2-3", type: "single", text: "When and where did George marry Elizabeth Thirkle?", options: ["1853 in Teesdale", "1818 at St Alban's", "1909 in Easington Lane", "1875 in Cockfield"] },
          { id: "ep2-4", type: "single", text: "The family finally put down roots in which mining village?", options: ["Easington Lane", "Kirkby Stephen", "Westmorland fells", "Rome"] },
          { id: "ep2-5", type: "single", text: "Underground, George worked as a…", options: ["Coal miner", "Bottle finisher", "Jacobite duke", "Rocket engineer"] },
          { id: "ep2-6", type: "single", text: "George Wharton died in…", options: ["1893", "1731", "1916", "1292"] }
        ]
      },
      {
        id: "ep3", num: 3, file: "03-last-pitmen.mp3", script: "3.txt",
        title: "Hewers, Cappy & the Last Pitman",
        desc: "George Henry, Robert \"Cappy\", and great-grandfather Robert — end of the mining line.",
        quiz: [
          { id: "ep3-1", type: "single", text: "What was George Henry Wharton's job underground?", options: ["Hewer", "Filler", "Duke", "Shepherd"] },
          { id: "ep3-2", type: "single", text: "What was Robert \"Cappy\" Wharton's job underground?", options: ["Filler", "Hewer", "Engine driver", "Bottle finisher"] },
          { id: "ep3-3", type: "single", text: "Your great-grandfather Robert Wharton was born on…", options: ["7 January 1916 in Easington Lane", "7 January 1886 in Easington Lane", "1855 in Cockfield", "1937 in Sunderland"] },
          { id: "ep3-4", type: "single", text: "Great-grandfather Robert married whom, and in what year?", options: ["Ellen Boyle in 1953", "Hannah Hope in 1875", "Margaret Ann Carr in 1909", "Elizabeth Thirkle in 1853"] },
          { id: "ep3-5", type: "single", text: "Robert Wharton died in…", options: ["2006, aged 90", "1893 after decades mining", "1731 in Spain", "1926 during the General Strike"] },
          { id: "ep3-6", type: "multiple", text: "Cappy worked through which hard times? (Select all that apply)", options: ["1926 General Strike", "Great Depression", "Second World War", "Battle of Solway Moss", "Philip's Hellfire Club nights", "Napoleonic wars only"] }
        ]
      }
    ];