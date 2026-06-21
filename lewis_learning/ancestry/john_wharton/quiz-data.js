    const CORRECT = {
      "ep1-1": "1292 — he faced King Edward I (Longshanks)",
      "ep1-2": "Battle of Solway Moss (1542)",
      "ep1-3": "1st Baron Wharton (1544)",
      "ep1-4": "1731 in Spain, aged 33 — bankrupt and in exile",
      "ep1-5": "1794 — shepherd and farm labourer",
      "ep1-6": "East Ward Union Workhouse, Kirkby Stephen",
      "ep2-1": "1833 in the East Ward Union Workhouse, Kirkby Stephen",
      "ep2-2": "1851 — he left for County Durham",
      "ep2-3": "1853 in Teesdale",
      "ep2-4": "Easington Lane",
      "ep2-5": "Coal miner",
      "ep2-6": "1893",
      "ep3-1": "1855 in Cockfield — a hewer underground",
      "ep3-2": "1886 in Easington Lane — a filler loading coal tubs",
      "ep3-3": "7 January 1916 in Easington Lane",
      "ep3-4": "Ellen Boyle in 1953 — they had four daughters",
      "ep3-5": "2006, aged 90",
      "ep3-6": ["1926 General Strike", "Great Depression", "Second World War"]
    };

    const episodes = [
      {
        id: "ep1", num: 1, file: "01-dukes-and-shepherd.mp3", script: "1.txt",
        title: "Dukes, Fall & John the Shepherd",
        desc: "Gilbert de Querton to Philip the Duke, then John Wharton in the workhouse.",
        quiz: [
          { id: "ep1-1", type: "single", text: "In 1292 Gilbert de Querton stood up to…", options: ["1292 — he faced King Edward I (Longshanks)", "King Henry VIII in 1542", "Philip the Duke in 1731", "George I when Philip was made duke"] },
          { id: "ep1-2", type: "single", text: "Thomas Wharton won a decisive victory at…", options: ["Battle of Solway Moss (1542)", "Battle of Hastings", "The workhouse in Kirkby Stephen", "Easington Lane colliery"] },
          { id: "ep1-3", type: "single", text: "King Henry VIII rewarded Thomas with the title…", options: ["1st Baron Wharton (1544)", "1st Duke of Wharton", "Shepherd of Westmorland", "Colonel in the Spanish army"] },
          { id: "ep1-4", type: "single", text: "Philip, the 1st Duke of Wharton, died…", options: ["1731 in Spain, aged 33 — bankrupt and in exile", "1794 as a shepherd in Westmorland", "1893 in a Durham mine", "2006 aged ninety in Easington Lane"] },
          { id: "ep1-5", type: "single", text: "Your direct ancestor John Wharton was born in…", options: ["1794 — shepherd and farm labourer", "1698 — made a duke at twenty", "1833 in the workhouse", "1916 in Easington Lane"] },
          { id: "ep1-6", type: "single", text: "George Wharton was born in 1833 inside…", options: ["East Ward Union Workhouse, Kirkby Stephen", "St Alban's church, Earsdon", "A palace in Rome", "Cockfield colliery"] }
        ]
      },
      {
        id: "ep2", num: 2, file: "02-george-miner.mp3", script: "2.txt",
        title: "George: Workhouse to Miner",
        desc: "George leaves the workhouse, marries Elizabeth, and roots the family in Durham coal.",
        quiz: [
          { id: "ep2-1", type: "single", text: "George Wharton (great-great-grandfather) was born…", options: ["1833 in the East Ward Union Workhouse, Kirkby Stephen", "1794 in Westmorland as a shepherd", "1855 in Cockfield as a hewer", "1886 in Easington Lane as a filler"] },
          { id: "ep2-2", type: "single", text: "George left the workhouse and headed east in…", options: ["1851 — he left for County Durham", "1292 to face the king", "1953 when he married Ellen", "2006 at the end of deep mining"] },
          { id: "ep2-3", type: "single", text: "George married Elizabeth Thirkle in…", options: ["1853 in Teesdale", "1818 at St Alban's", "1909 to Margaret Ann Carr", "1875 to Hannah Hope"] },
          { id: "ep2-4", type: "single", text: "The family finally put down roots in…", options: ["Easington Lane", "Kirkby Stephen workhouse", "Westmorland fells only", "Rome in exile"] },
          { id: "ep2-5", type: "single", text: "Underground, George worked as a…", options: ["Coal miner", "Bottle finisher", "Jacobite duke", "Rocket engineer"] },
          { id: "ep2-6", type: "single", text: "George Wharton died in…", options: ["1893", "1731", "1916", "1292"] }
        ]
      },
      {
        id: "ep3", num: 3, file: "03-last-pitmen.mp3", script: "3.txt",
        title: "Hewers, Cappy & the Last Pitman",
        desc: "George Henry, Robert \"Cappy\", and great-grandfather Robert — end of the mining line.",
        quiz: [
          { id: "ep3-1", type: "single", text: "George Henry Wharton was born…", options: ["1855 in Cockfield — a hewer underground", "1886 in Easington Lane — a filler", "1916 — the last pitman in the line", "1833 in the workhouse"] },
          { id: "ep3-2", type: "single", text: "Robert \"Cappy\" Wharton (great-great-grandfather) was…", options: ["1886 in Easington Lane — a filler loading coal tubs", "1855 in Cockfield — a hewer", "1698 — the only Duke of Wharton", "1794 — a shepherd"] },
          { id: "ep3-3", type: "single", text: "Your great-grandfather Robert Wharton was born…", options: ["7 January 1916 in Easington Lane", "7 January 1886 as Cappy", "1855 in Cockfield", "1937 in Sunderland"] },
          { id: "ep3-4", type: "single", text: "Robert married…", options: ["Ellen Boyle in 1953 — they had four daughters", "Hannah Hope in 1875", "Margaret Ann Carr in 1909", "Elizabeth Thirkle in 1853"] },
          { id: "ep3-5", type: "single", text: "Robert Wharton died in…", options: ["2006, aged 90", "1893 after decades mining", "1731 in Spain", "1926 during the General Strike"] },
          { id: "ep3-6", type: "multiple", text: "Cappy worked through which hard times? (Select all that apply)", options: ["1926 General Strike", "Great Depression", "Second World War", "Battle of Solway Moss", "Philip's Hellfire Club nights", "Napoleonic wars only"] }
        ]
      }
    ];