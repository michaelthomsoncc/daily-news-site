    const CORRECT = {
      "ep1-1": "R-M467",
      "ep1-2": "Y-chromosome",
      "ep1-3": "R1b",
      "ep1-4": "Pontic-Caspian steppe (Ukraine and southern Russia)",
      "ep1-5": "Bell Beaker culture",
      "ep1-6": "Southwest Lowlands and Marches — including Carrick",
      "ep2-1": "1318",
      "ep2-2": "Battle of Faughart",
      "ep2-3": "A man of low birth, but approved valour",
      "ep2-4": "Carrick",
      "ep2-5": "Carrickfergus castle",
      "ep2-6": "Thomsons of Eskdale",
      "ep3-1": "Debatable Lands and the West March",
      "ep3-2": "Bastle houses and peel towers",
      "ep3-3": "Hot trod",
      "ep3-4": "Kin and profit above nationality",
      "ep3-5": "Lord Thomas Wharton — 1st Baron, Warden of the West Marches",
      "ep3-6": "Batysons, Thomsons, and Lytles of Esskdayle",
      "ep4-1": "1603",
      "ep4-2": "1713",
      "ep4-3": "8 February 1832 in Penicuik",
      "ep4-4": "Tile Maker",
      "ep4-5": "Engine Driver",
      "ep4-6": "Charlotte Thompson"
    };

    const episodes = [
      {
        id: "ep1", num: 1, file: "01-steppe-to-carrick.mp3", script: "1.txt",
        title: "Steppe to Carrick",
        desc: "R-M467, the Y-chromosome line, and the Bronze Age current that reached southwest Scotland.",
        quiz: [
          { id: "ep1-1", type: "single", text: "What is your paternal haplogroup?", options: ["R-M467", "R1a", "I-M253", "J-M172"] },
          { id: "ep1-2", type: "single", text: "Which piece of DNA traces the direct father-to-son line almost unchanged?", options: ["Y-chromosome", "Mitochondrial DNA", "X-chromosome", "Autosomal chromosomes only"] },
          { id: "ep1-3", type: "single", text: "R-M467 belongs to which major Western European male lineage family?", options: ["R1b", "R1a", "G2a", "E-M35"] },
          { id: "ep1-4", type: "single", text: "The distant ancestors of this line were mobile herders from…", options: ["Pontic-Caspian steppe (Ukraine and southern Russia)", "The Sahara desert", "Scandinavian fjords only", "The Amazon rainforest"] },
          { id: "ep1-5", type: "single", text: "Which culture brought this lineage into Britain around 2500 BC?", options: ["Bell Beaker culture", "Roman legions", "Viking longships", "Norman conquest"] },
          { id: "ep1-6", type: "single", text: "By the Iron Age this paternal line was especially strong in…", options: ["Southwest Lowlands and Marches — including Carrick", "The Outer Hebrides only", "Southeast England", "The Welsh mountains"] }
        ]
      },
      {
        id: "ep2", num: 2, file: "02-faughart-to-eskdale.mp3", script: "2.txt",
        title: "Faughart to Eskdale",
        desc: "John Thomson at Faughart, the retreat to Carrickfergus, and the Thomsons of Eskdale.",
        quiz: [
          { id: "ep2-1", type: "single", text: "The earliest named John Thomson story on the battlefields begins in which year?", options: ["1318", "1603", "1542", "1853"] },
          { id: "ep2-2", type: "single", text: "Edward Bruce's Irish campaign collapsed at which battle?", options: ["Battle of Faughart", "Battle of Solway Moss", "Battle of Bannockburn", "Battle of Hastings"] },
          { id: "ep2-3", type: "single", text: "How did the chronicles describe John Thomson?", options: ["A man of low birth, but approved valour", "A duke of Carrick", "A shepherd of Westmorland", "A tile maker of Penicuik"] },
          { id: "ep2-4", type: "single", text: "John Thomson commanded men from which Ayrshire district?", options: ["Carrick", "Eskdale", "Midlothian", "Bishopwearmouth"] },
          { id: "ep2-5", type: "single", text: "After the fighting retreat, survivors embarked for home from…", options: ["Carrickfergus castle", "Edinburgh Castle", "Peel towers in Eskdale", "Sunderland docks"] },
          { id: "ep2-6", type: "single", text: "By the mid-1400s which distinct Thomson group settled deep in the West March?", options: ["Thomsons of Eskdale", "Thomsons of Mayo", "Thomsons of Easington Lane", "Thomsons of Rome"] }
        ]
      },
      {
        id: "ep3", num: 3, file: "03-reivers-and-wharton.mp3", script: "3.txt",
        title: "Reivers & the Wharton Clash",
        desc: "Eskdale riding tactics, March law — and your Thomson and Wharton lines meeting in the 1540s.",
        quiz: [
          { id: "ep3-1", type: "single", text: "In the 1500s the Eskdale Thomsons operated chiefly in…", options: ["Debatable Lands and the West March", "The East Ward Union Workhouse", "Sunderland shipyards", "Ulster plantations only"] },
          { id: "ep3-2", type: "single", text: "Families sheltered in which fortified homes during raids?", options: ["Bastle houses and peel towers", "Terraced mining rows", "Palaces in Rome", "Workhouse dormitories"] },
          { id: "ep3-3", type: "single", text: "The legal six-day pursuit of raiders with a blazing turf signal was called…", options: ["Hot trod", "Days of Truce", "Union of Crowns", "General Strike"] },
          { id: "ep3-4", type: "single", text: "On the frontier, reiver loyalty was primarily to…", options: ["Kin and profit above nationality", "The English crown only", "The Scottish crown only", "Church law above all kin"] },
          { id: "ep3-5", type: "single", text: "In the 1540s which English border lord named the Eskdale Thomsons in urgent reports?", options: ["Lord Thomas Wharton — 1st Baron, Warden of the West Marches", "Gilbert de Querton", "Philip, Duke of Wharton", "Robert the Bruce"] },
          { id: "ep3-6", type: "single", text: "Wharton blamed which families for fresh raids into English territory?", options: ["Batysons, Thomsons, and Lytles of Esskdayle", "Beattisons, Nixons, and Littles only", "Boyle and Bailey families", "Bruces and Stuarts of Carrick"] }
        ]
      },
      {
        id: "ep4", num: 4, file: "04-penicuik-to-sunderland.mp3", script: "4.txt",
        title: "Penicuik to Sunderland",
        desc: "The reivers crushed, Midlothian endurance, tile works and engine drivers — John marries Charlotte.",
        quiz: [
          { id: "ep4-1", type: "single", text: "When did the Union of Crowns doom the old Border reiver world?", options: ["1603", "1318", "1713", "1953"] },
          { id: "ep4-2", type: "single", text: "Around which year does Alexander Thompson first appear in Midlothian records?", options: ["1713", "1774", "1832", "1853"] },
          { id: "ep4-3", type: "single", text: "Your 4th great-grandfather William Thomson was born on…", options: ["8 February 1832 in Penicuik", "6 August 1853 in Penicuik", "7 January 1916 in Easington Lane", "8 February 1713 in Midlothian"] },
          { id: "ep4-4", type: "single", text: "In the 1851 census young William worked as a…", options: ["Tile Maker", "Engine Driver", "Cartman", "Gas stoker"] },
          { id: "ep4-5", type: "single", text: "By the 1861 census in Bishopwearmouth, William worked as an…", options: ["Engine Driver", "Tile Maker", "Holder up in a shipyard", "Border warden"] },
          { id: "ep4-6", type: "single", text: "John Thomson (born 1853 in Penicuik) married whom — linking to the Charlotte Bailey line?", options: ["Charlotte Thompson", "Charlotte Bailey", "Janet Borthwick", "Margaret Dickson"] }
        ]
      }
    ];