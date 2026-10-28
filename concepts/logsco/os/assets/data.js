/* Logsco OS · demo data.
   Every company, person, number and email below is FICTIONAL sample data for a sales demo.
   Dates are stored as offsets from "today" so the demo always looks current. */
(function () {
  "use strict";
  const DAY = 864e5;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const D = (n) => new Date(today.getTime() + n * DAY).toISOString();

  /* seeded random so charts stay stable between reloads */
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  const DIVS = {
    agri: { id: "agri", name: "AgriTech Solutions", short: "AgriTech", head: "Shafi" },
    bev: { id: "bev", name: "Beverages", short: "Beverages", head: "K'Mar" },
    estates: { id: "estates", name: "Agro Estates", short: "Estates", head: "Azlan" }
  };
  /* chart order is fixed (validated palette order): AgriTech, Beverages, Estates */
  const DIV_ORDER = ["agri", "bev", "estates"];

  const STAFF = [
    { id: "u1", name: "Rashid Hamzah", role: "Director", dept: "Management", div: "all", status: "office", phone: "+60 12-000 1101", load: 62 },
    { id: "u2", name: "Nurul Aina Kassim", role: "Sales Director", dept: "Sales", div: "all", status: "site", phone: "+60 12-000 1102", load: 88 },
    { id: "u3", name: "Tan Mei Ling", role: "Finance", dept: "Finance", div: "all", status: "office", phone: "+60 12-000 1103", load: 71 },
    { id: "u4", name: "Hafiz Idris", role: "Head of Operations", dept: "Operations", div: "all", status: "office", phone: "+60 12-000 1104", load: 79 },
    { id: "u5", name: "Priya Nair", role: "Special Projects", dept: "Projects", div: "all", status: "leave", phone: "+60 12-000 1105", load: 40 },
    { id: "u6", name: "Shafi", role: "Head of AgriTech", dept: "AgriTech", div: "agri", status: "office", phone: "+60 12-000 1106", load: 92, me: true },
    { id: "u7", name: "Azlan", role: "Head of Agro Estates", dept: "Estates", div: "estates", status: "site", phone: "+60 12-000 1107", load: 74 },
    { id: "u8", name: "K'Mar", role: "Head of Beverages", dept: "Beverages", div: "bev", status: "office", phone: "+60 12-000 1108", load: 81 },
    { id: "u9", name: "Zulkifli Ahmad", role: "Head of Technicians", dept: "Technical", div: "agri", status: "site", phone: "+60 12-000 1109", load: 95 },
    { id: "t1", name: "Amirul Hakim", role: "Technician", dept: "Technical", div: "agri", status: "site", phone: "+60 12-000 1110", load: 90, tech: true },
    { id: "t2", name: "Danial Rosli", role: "Technician", dept: "Technical", div: "agri", status: "site", phone: "+60 12-000 1111", load: 76, tech: true },
    { id: "t3", name: "Kumar Selvam", role: "Technician", dept: "Technical", div: "agri", status: "office", phone: "+60 12-000 1112", load: 58, tech: true },
    { id: "t4", name: "Syafiq Nordin", role: "Technician", dept: "Technical", div: "agri", status: "leave", phone: "+60 12-000 1113", load: 20, tech: true },
    { id: "t5", name: "Lee Wei Jie", role: "Technician", dept: "Technical", div: "agri", status: "site", phone: "+60 12-000 1114", load: 84, tech: true }
  ];

  const COMPANIES = [
    { id: "c1", name: "Ladang Seri Mahkota Sdn. Bhd.", type: "Estate", state: "Johor", contact: "Roslan Kamal", title: "Estate Manager", owner: "Shafi", last: -1, ltv: 412000, div: "agri" },
    { id: "c2", name: "Nanas Permata Agro Sdn. Bhd.", type: "Plantation", state: "Johor", contact: "Haslinda Yusof", title: "General Manager", owner: "Shafi", last: -2, ltv: 0, div: "agri" },
    { id: "c3", name: "Simpang Lima CPPC Koperasi Bhd.", type: "CPPC", state: "Johor", contact: "Lim Chee Keong", title: "Centre Manager", owner: "Nurul Aina", last: -3, ltv: 84500, div: "agri" },
    { id: "c4", name: "Teratak Hijau Plantations Bhd.", type: "Plantation", state: "Pahang", contact: "Faridah Musa", title: "Head of Mechanisation", owner: "Shafi", last: -6, ltv: 0, div: "agri" },
    { id: "c5", name: "Kebun Bayu Durian Estate", type: "Estate", state: "Pahang", contact: "Wong Kah Hoe", title: "Owner", owner: "Nurul Aina", last: -4, ltv: 0, div: "agri" },
    { id: "c6", name: "Hijau Lestari Agro Koperasi", type: "CPPC", state: "Perak", contact: "Ismail Daud", title: "Chairman", owner: "Shafi", last: -8, ltv: 27600, div: "agri" },
    { id: "c7", name: "Sinar Tropika Fruits Sdn. Bhd.", type: "CPPC", state: "Johor", contact: "Rajesh Pillai", title: "Plant Manager", owner: "Shafi", last: 0, ltv: 688000, div: "agri" },
    { id: "c8", name: "Ladang Bukit Embun", type: "Estate", state: "Johor", contact: "Azman Salleh", title: "Estate Manager", owner: "Shafi", last: -5, ltv: 0, div: "agri" },
    { id: "c9", name: "Sawit Damai Plantation Sdn. Bhd.", type: "Plantation", state: "Sabah", contact: "Juliana Lajim", title: "Operations Lead", owner: "Nurul Aina", last: -12, ltv: 0, div: "agri" },
    { id: "c10", name: "Taman Buah Cempaka Agro", type: "Estate", state: "Melaka", contact: "Chong Siew Lan", title: "Director", owner: "Nurul Aina", last: -21, ltv: 0, div: "agri" },
    { id: "c11", name: "Kampung Pisang Emas Koperasi", type: "CPPC", state: "Kedah", contact: "Hamidah Osman", title: "Secretary", owner: "Shafi", last: -9, ltv: 0, div: "agri" },
    { id: "c12", name: "Permai Fruits Export Sdn. Bhd.", type: "Distributor", state: "Johor", contact: "Kevin Teo", title: "Export Manager", owner: "Nurul Aina", last: -1, ltv: 318000, div: "agri" },
    { id: "c13", name: "Rimba Jaya Agro Estates", type: "Estate", state: "Negeri Sembilan", contact: "Saiful Bahri", title: "Estate Manager", owner: "Shafi", last: -2, ltv: 46000, div: "agri" },
    { id: "c14", name: "Orkid Highland Farms", type: "Plantation", state: "Pahang", contact: "Lau Mun Yee", title: "Farm Manager", owner: "Nurul Aina", last: -15, ltv: 0, div: "agri" },
    { id: "c15", name: "Jelajah Desa Travel & Tours", type: "Agency", state: "Johor", contact: "Aishah Rahim", title: "Tour Planner", owner: "Azlan", last: -2, ltv: 12800, div: "estates" },
    { id: "c16", name: "Seri Pelangi Travel Agency", type: "Agency", state: "Selangor", contact: "Mohd Firdaus", title: "Sales Executive", owner: "Azlan", last: -7, ltv: 0, div: "estates" },
    { id: "c17", name: "Mutiara Tani Fresh Sdn. Bhd.", type: "Distributor", state: "Selangor", contact: "Goh Boon Huat", title: "Purchasing Manager", owner: "Azlan", last: -3, ltv: 64200, div: "estates" },
    { id: "c18", name: "Gerai Sihat Organic Store", type: "Retailer", state: "Kuala Lumpur", contact: "Nadia Zulkifli", title: "Owner", owner: "Azlan", last: -10, ltv: 18500, div: "estates" },
    { id: "c19", name: "Arus Minuman Distributors Sdn. Bhd.", type: "Distributor", state: "Penang", contact: "Ong Wei Ming", title: "Business Development", owner: "K'Mar", last: -1, ltv: 0, div: "bev" },
    { id: "c20", name: "Delima Fresh Mart", type: "Retailer", state: "Johor", contact: "Siti Hajar Ahmad", title: "Category Buyer", owner: "K'Mar", last: -4, ltv: 0, div: "bev" },
    { id: "c21", name: "Langkah Sihat Fitness", type: "Retailer", state: "Selangor", contact: "Daniel Fernandez", title: "Partnerships", owner: "K'Mar", last: -6, ltv: 0, div: "bev" },
    { id: "c22", name: "Bintang Timur Distribution", type: "Distributor", state: "Johor", contact: "Rosli Harun", title: "Managing Director", owner: "K'Mar", last: -2, ltv: 0, div: "bev" },
    { id: "c23", name: "Runcit Ceria Mini Market", type: "Retailer", state: "Melaka", contact: "Tan Ah Kow", title: "Owner", owner: "K'Mar", last: -30, ltv: 0, div: "bev" },
    { id: "c24", name: "Kembara Selatan Holidays", type: "Agency", state: "Johor", contact: "Farah Izzati", title: "Group Sales", owner: "Azlan", last: -14, ltv: 7400, div: "estates" }
  ];
  COMPANIES.forEach((c) => {
    const slug = c.contact.toLowerCase().split(" ")[0].replace(/[^a-z]/g, "");
    c.email = slug + "@" + c.name.toLowerCase().replace(/sdn\.|bhd\.|&/g, "").replace(/[^a-z]/g, "").slice(0, 14) + ".example.my";
    c.phone = "+60 1" + (2 + (c.id.length % 7)) + "-555 " + String(1000 + parseInt(c.id.slice(1), 10) * 37).slice(0, 4);
    c.last = D(c.last);
  });

  const STAGES = ["Lead", "Qualified", "Site visit", "Proposal", "Negotiation", "Won", "Lost"];
  const PROB = { Lead: 10, Qualified: 25, "Site visit": 40, Proposal: 60, Negotiation: 80, Won: 100, Lost: 0 };

  const DEALS = [
    ["d1", "c1", "Pineapple grading line 7 MT/hr", 1280000, "Negotiation", "Shafi", "agri", "Final price review with GM", 18],
    ["d2", "c2", "Reemoon optical sorter, 4 lanes", 645000, "Proposal", "Shafi", "agri", "Send revised layout drawing", 30],
    ["d3", "c3", "Washing, waxing & packing line", 420000, "Site visit", "Nurul Aina", "agri", "Site visit Thu 10:00, measure shed", 45],
    ["d4", "c4", "HUAYO AGRO 4WD tractor ×3", 386000, "Qualified", "Shafi", "agri", "Book demo at Pontian estate", 40],
    ["d5", "c5", "Durian grading line 3 MT/hr", 760000, "Lead", "Nurul Aina", "agri", "Discovery call", 75],
    ["d6", "c6", "IoT soil & weather sensors (40 nodes)", 96500, "Proposal", "Shafi", "agri", "Follow up on grant paperwork", 21],
    ["d7", "c7", "Spare parts & service contract, 12 months", 72000, "Won", "Shafi", "agri", "Kick-off with technicians", -6],
    ["d8", "c8", "HUAYO pineapple planter ×2", 214000, "Site visit", "Shafi", "agri", "Soil test results due", 35],
    ["d9", "c9", "IoT fleet tracking, 18 units", 58800, "Qualified", "Nurul Aina", "agri", "Confirm vehicle list", 50],
    ["d10", "c10", "Citrus sorting line 2 MT/hr", 498000, "Lost", "Nurul Aina", "agri", "Lost on budget; revisit Q2", -12],
    ["d11", "c11", "Banana washing line", 265000, "Lead", "Shafi", "agri", "Qualify volumes per week", 90],
    ["d12", "c12", "Reemoon export grading upgrade", 318000, "Won", "Nurul Aina", "agri", "Schedule installation", -20],
    ["d13", "c13", "Boom sprayer + IoT kit", 142000, "Negotiation", "Shafi", "agri", "Payment terms 30/60/10", 12],
    ["d14", "c14", "Vegetable grading line", 530000, "Lead", "Nurul Aina", "agri", "Intro call booked by outbound", 80],
    ["d15", "c15", "Estate tour package, 12 groups a year", 38400, "Proposal", "Azlan", "estates", "Send tour itinerary PDF", 14],
    ["d16", "c16", "School tours, term 1 2027", 21600, "Qualified", "Azlan", "estates", "Confirm bus access for 2 coaches", 40],
    ["d17", "c17", "MD2 fresh pineapple supply, weekly", 156000, "Negotiation", "Azlan", "estates", "Agree grade A/B price split", 10],
    ["d18", "c18", "Farm-shop products, wholesale", 18500, "Won", "Azlan", "estates", "First delivery Friday", -3],
    ["d19", "c19", "Pina Boosta northern distribution", 240000, "Proposal", "K'Mar", "bev", "Margin model v2", 28],
    ["d20", "c20", "Batch 001 listing, 14 outlets", 46800, "Qualified", "K'Mar", "bev", "Tasting session at HQ", 33],
    ["d21", "c21", "Gym fridge placement, 22 sites", 33000, "Lead", "K'Mar", "bev", "Send sample cans", 60],
    ["d22", "c22", "Pina Boosta Johor distribution", 185000, "Negotiation", "K'Mar", "bev", "Exclusivity clause review", 16],
    ["d23", "c23", "Starter case order", 9600, "Lost", "K'Mar", "bev", "No chiller space", -18],
    ["d24", "c1", "Spare parts kit, grading line", 24800, "Won", "Shafi", "agri", "Delivered", -9],
    ["d25", "c17", "Grade B pineapple, processing", 42000, "Proposal", "Azlan", "estates", "Sample pallet sent", 20]
  ].map(([id, co, title, value, stage, owner, div, next, close], i) => ({
    id, co, title, value, stage, owner, div, next, close: D(close), created: D(-(10 + i * 3)),
    timeline: [
      { t: D(-(10 + i * 3)), kind: "create", text: "Deal created from " + ["website form", "WhatsApp enquiry", "referral", "trade show", "outbound sequence"][i % 5] },
      { t: D(-(6 + (i % 4))), kind: "call", text: "Discovery call, requirements noted" },
      { t: D(-(2 + (i % 3))), kind: "email", text: "Sent brochure and reference video" },
      { t: D(-(i % 2)), kind: "stage", text: "Moved to " + stage }
    ]
  }));

  /* invoices */
  const INVOICES = [
    ["0141", "c7", -48, 30, "paid", [["Reemoon grading line, balance payment (10%)", 1, 68800]]],
    ["0142", "c1", -40, 30, "paid", [["Commissioning & training, month 2", 1, 18500], ["Spare parts kit", 1, 24800]]],
    ["0143", "c12", -36, 30, "overdue", [["Export grading upgrade, deposit (30%)", 1, 95400]]],
    ["0144", "c13", -33, 30, "overdue", [["Boom sprayer service", 1, 4200], ["IoT gateway", 2, 3850]]],
    ["0145", "c17", -28, 14, "paid", [["MD2 pineapple, grade A (kg)", 4200, 3.4]]],
    ["0146", "c15", -25, 14, "overdue", [["Estate tour, 38 pax", 38, 65], ["Café lunch set", 38, 22]]],
    ["0147", "c3", -21, 30, "sent", [["Washing line spare brushes", 12, 380], ["Service visit", 1, 1200]]],
    ["0148", "c7", -18, 30, "sent", [["Service contract, Q4", 1, 18000]]],
    ["0149", "c6", -15, 30, "sent", [["IoT sensors, deposit (50%)", 1, 48250]]],
    ["0150", "c18", -12, 14, "paid", [["Pineapple jam 250 g", 120, 14], ["Dried pineapple 150 g", 200, 12.5], ["Pineapple honey 500 g", 60, 32]]],
    ["0151", "c1", -9, 30, "sent", [["Grading line, progress payment (40%)", 1, 512000]]],
    ["0152", "c17", -7, 14, "sent", [["MD2 pineapple, grade A (kg)", 3900, 3.4], ["Grade B (kg)", 1600, 1.9]]],
    ["0153", "c24", -5, 14, "sent", [["Estate tour, 26 pax", 26, 65]]],
    ["0154", "c12", -3, 30, "sent", [["Installation & commissioning", 1, 42000]]],
    ["0155", "c13", -1, 30, "draft", [["Boom sprayer + IoT kit, deposit (30%)", 1, 42600]]],
    ["0156", "c20", 0, 30, "draft", [["Pina Boosta sampling cans (150 ml)", 480, 0], ["Chiller rental", 2, 180]]]
  ].map(([n, co, issued, terms, status, lines]) => ({
    id: "LAT-INV-26-" + n, co, issued: D(issued), due: D(issued + terms), terms, status, sst: 0,
    lines: lines.map(([desc, qty, price]) => ({ desc, qty, price })),
    einv: status === "draft" ? "Not ready" : "Not submitted"
  }));
  /* a few invoices with service tax to show the configurable SST */
  ["LAT-INV-26-0142", "LAT-INV-26-0144", "LAT-INV-26-0147", "LAT-INV-26-0148", "LAT-INV-26-0154"].forEach((id) => { const inv = INVOICES.find((x) => x.id === id); if (inv) inv.sst = 8; });

  /* revenue by division, last 6 months */
  const months = [];
  for (let i = 5; i >= 0; i--) { const d = new Date(today.getFullYear(), today.getMonth() - i, 1); months.push(["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]); }
  const REVENUE = {
    months,
    agri: [182000, 240500, 96400, 410200, 288700, 352900],
    bev: [0, 0, 0, 2400, 4100, 9800],
    estates: [38200, 42600, 51300, 47900, 55400, 61200]
  };

  const LEAD_SOURCES = {
    agri: { "Website form": 24, WhatsApp: 18, "Outbound email": 14, Referral: 11, "Trade show": 9, "Google Ads": 16, LinkedIn: 7 },
    estates: { "Website form": 9, WhatsApp: 21, "Outbound email": 2, Referral: 6, "Trade show": 1, "Google Ads": 4, LinkedIn: 0 },
    bev: { "Website form": 38, WhatsApp: 12, "Outbound email": 5, Referral: 3, "Trade show": 4, "Google Ads": 2, LinkedIn: 1, "Meta Ads": 46 }
  };

  const KPI_EXTRA = {
    agri: { leads: 64, leadsPrev: 51, meetings: 14, meetingsPrev: 9, tickets: 0 },
    estates: { leads: 22, leadsPrev: 25, meetings: 3, meetingsPrev: 2 },
    bev: { leads: 141, leadsPrev: 88, meetings: 6, meetingsPrev: 4 }
  };

  const TASKS = [
    { id: "k1", text: "Call Roslan (Seri Mahkota) about final price", due: "10:30", div: "agri", done: false },
    { id: "k2", text: "Approve Danial's leave request", due: "11:00", div: "agri", done: false },
    { id: "k3", text: "Review revised layout drawing for Nanas Permata", due: "14:00", div: "agri", done: false },
    { id: "k4", text: "Confirm café menu for Saturday tour group (38 pax)", due: "15:00", div: "estates", done: false },
    { id: "k5", text: "Sign off Batch 001 can artwork proof", due: "16:30", div: "bev", done: true },
    { id: "k6", text: "Chase overdue invoice LAT-INV-26-0143", due: "17:00", div: "agri", done: false },
    { id: "k7", text: "Approve 2 new SEO pages for logs-agri.com", due: "Today", div: "agri", done: false }
  ];

  /* technician schedule this week: day index 0 = Monday */
  const SCHEDULE = [
    { tech: "t1", day: 0, len: 2, type: "Installation", co: "c12", text: "Export grading upgrade" },
    { tech: "t1", day: 2, len: 1, type: "Service", co: "c7", text: "Quarterly service" },
    { tech: "t1", day: 3, len: 2, type: "Commissioning", co: "c1", text: "Grading line dry run" },
    { tech: "t2", day: 0, len: 1, type: "Service", co: "c3", text: "Brush replacement" },
    { tech: "t2", day: 1, len: 3, type: "Commissioning", co: "c1", text: "Grading line, week 6" },
    { tech: "t2", day: 5, len: 1, type: "Training", co: "c13", text: "Sprayer operator training" },
    { tech: "t3", day: 1, len: 1, type: "Service", co: "c13", text: "IoT gateway swap" },
    { tech: "t3", day: 2, len: 2, type: "Installation", co: "c6", text: "Sensor nodes, phase 1" },
    { tech: "t3", day: 4, len: 1, type: "Service", co: "c7", text: "Emergency callout" },
    { tech: "t4", day: 0, len: 6, type: "Leave", co: null, text: "Annual leave" },
    { tech: "t5", day: 0, len: 1, type: "Training", co: "c7", text: "New shift operators" },
    { tech: "t5", day: 1, len: 2, type: "Installation", co: "c12", text: "Conveyor & bins" },
    { tech: "t5", day: 3, len: 1, type: "Service", co: "c8", text: "Planter calibration" },
    { tech: "t5", day: 4, len: 2, type: "Commissioning", co: "c12", text: "Live run, export line" }
  ];

  const LEAVE = [
    { id: "l1", who: "t2", type: "Annual leave", from: D(9), to: D(11), days: 3, reason: "Family wedding in Kota Bharu", status: "pending" },
    { id: "l2", who: "u3", type: "Annual leave", from: D(15), to: D(15), days: 1, reason: "Personal", status: "pending" },
    { id: "l3", who: "t5", type: "Medical leave", from: D(-8), to: D(-7), days: 2, reason: "MC attached", status: "approved" },
    { id: "l4", who: "u7", type: "Annual leave", from: D(20), to: D(24), days: 5, reason: "Umrah", status: "pending" }
  ];

  /* service tickets: opened = minutes before page load, sla in hours */
  const TICKETS = [
    { id: "SR-2291", co: "c7", machine: "Reemoon grading line #2", issue: "Camera module not detecting fruit on lane 3", pri: "P1", opened: 95, sla: 4, status: "On site", tech: "t3" },
    { id: "SR-2290", co: "c1", machine: "Pineapple grading line (commissioning)", issue: "Conveyor speed drifting under load", pri: "P2", opened: 260, sla: 8, status: "Assigned", tech: "t2" },
    { id: "SR-2289", co: "c13", machine: "Boom sprayer BS-600", issue: "Nozzle pressure warning", pri: "P3", opened: 610, sla: 24, status: "Waiting parts", tech: "t3" },
    { id: "SR-2288", co: "c3", machine: "Washing line", issue: "Brush wear, request replacement", pri: "P3", opened: 1300, sla: 24, status: "Assigned", tech: "t2" },
    { id: "SR-2287", co: "c6", machine: "IoT weather station #4", issue: "No data since 03:12", pri: "P2", opened: 410, sla: 8, status: "New", tech: null },
    { id: "SR-2286", co: "c12", machine: "Reemoon export line", issue: "Operator asks for retraining on new SKUs", pri: "P4", opened: 2900, sla: 72, status: "Assigned", tech: "t5" },
    { id: "SR-2285", co: "c7", machine: "Reemoon grading line #1", issue: "Weighing cells calibration", pri: "P3", opened: 3400, sla: 24, status: "Resolved", tech: "t1" }
  ];

  const PARTS = [
    { id: "PO-7712", co: "c7", part: "Camera module CM-4 (Reemoon)", qty: 1, ordered: -1, step: 1, target: 3 },
    { id: "PO-7711", co: "c13", part: "Nozzle set, 24 pcs (HUAYO)", qty: 2, ordered: -3, step: 3, target: 4 },
    { id: "PO-7710", co: "c3", part: "Washing brushes, 1.2 m", qty: 12, ordered: -2, step: 2, target: 5 },
    { id: "PO-7709", co: "c1", part: "Gear motor 1.5 kW", qty: 1, ordered: -6, step: 3, target: 5 },
    { id: "PO-7708", co: "c12", part: "Bin liners & flaps kit", qty: 4, ordered: -4, step: 4, target: 5 },
    { id: "PO-7707", co: "c6", part: "LoRa gateway antenna", qty: 3, ordered: -5, step: 4, target: 3 }
  ];
  const PART_STEPS = ["Ordered", "Picked (Masai)", "Shipped from OEM", "Customs / transit", "Delivered"];

  const COMMISSIONING = [
    { id: "CP-031", co: "c1", project: "Pineapple grading line 7 MT/hr", start: -38, weeks: 9, lead: "t2", milestones: ["Installed", "Dry run", "Live run", "Operator training", "Handover"], done: 2 },
    { id: "CP-030", co: "c12", project: "Reemoon export grading upgrade", start: -16, weeks: 9, lead: "t5", milestones: ["Installed", "Dry run", "Live run", "Operator training", "Handover"], done: 1 },
    { id: "CP-029", co: "c7", project: "Grading line #2", start: -58, weeks: 9, lead: "t1", milestones: ["Installed", "Dry run", "Live run", "Operator training", "Handover"], done: 4 },
    { id: "CP-028", co: "c13", project: "Boom sprayer + IoT kit", start: -4, weeks: 9, lead: "t3", milestones: ["Installed", "Dry run", "Live run", "Operator training", "Handover"], done: 0 }
  ];

  const ACTIVITY = [
    { t: -0.02, who: "Website", div: "agri", icon: "globe", text: "New enquiry on logs-agri.com: <b>Orkid Highland Farms</b> asked about vegetable grading" },
    { t: -0.08, who: "Rajesh Pillai", div: "agri", icon: "ticket", text: "Opened P1 ticket <b>SR-2291</b>, camera module on lane 3" },
    { t: -0.15, who: "Tan Mei Ling", div: "agri", icon: "invoice", text: "Marked <b>LAT-INV-26-0142</b> as paid · RM 43,300.00" },
    { t: -0.3, who: "K'Mar", div: "bev", icon: "bolt", text: "Batch 001 waitlist passed <b>2,400</b> sign-ups" },
    { t: -0.6, who: "Azlan", div: "estates", icon: "leaf", text: "Confirmed Saturday tour, <b>Jelajah Desa Travel</b>, 38 pax" },
    { t: -1, who: "Outbound agent", div: "agri", icon: "send", text: "Booked meeting with <b>Kebun Bayu Durian Estate</b> for next Tuesday" },
    { t: -1.2, who: "Shafi", div: "agri", icon: "deal", text: "Moved <b>Boom sprayer + IoT kit</b> to Negotiation" },
    { t: -1.5, who: "Website", div: "bev", icon: "globe", text: "New stockist enquiry from <b>Langkah Sihat Fitness</b>" },
    { t: -2, who: "Nurul Aina", div: "agri", icon: "deal", text: "Won <b>Reemoon export grading upgrade</b> · RM 318,000.00" }
  ];

  /* campaigns */
  const SEQUENCES = [
    { id: "s1", name: "Johor estates · post-harvest lines", channel: "Email", div: "agri", sent: 642, opened: 388, replied: 41, meetings: 9, status: "active", steps: 4 },
    { id: "s2", name: "CPPC managers · grading upgrade", channel: "LinkedIn", div: "agri", sent: 214, opened: 162, replied: 23, meetings: 4, status: "active", steps: 3 },
    { id: "s3", name: "Durian & fruit exporters", channel: "Email", div: "agri", sent: 380, opened: 201, replied: 17, meetings: 3, status: "active", steps: 4 },
    { id: "s4", name: "Retail buyers · Batch 001", channel: "WhatsApp", div: "bev", sent: 96, opened: 91, replied: 28, meetings: 6, status: "active", steps: 2 },
    { id: "s5", name: "Travel agents · estate tours", channel: "Email", div: "estates", sent: 158, opened: 74, replied: 8, meetings: 3, status: "paused", steps: 3 },
    { id: "s6", name: "Distributors · north region", channel: "LinkedIn", div: "bev", sent: 64, opened: 48, replied: 6, meetings: 1, status: "draft", steps: 3 }
  ];
  const ADS = [
    { id: "a1", name: "Fruit grading machine Malaysia", platform: "Google", div: "agri", spend: 2840, clicks: 912, leads: 21, status: "active" },
    { id: "a2", name: "Agricultural tractor Johor", platform: "Google", div: "agri", spend: 1260, clicks: 588, leads: 8, status: "active" },
    { id: "a3", name: "Pineapple estate tour Pontian", platform: "Google", div: "estates", spend: 640, clicks: 402, leads: 14, status: "active" },
    { id: "a4", name: "Pina Boosta · Batch 001 waitlist", platform: "Meta", div: "bev", spend: 3120, clicks: 6840, leads: 1188, status: "active" },
    { id: "a5", name: "Pina Boosta · teaser video", platform: "Meta", div: "bev", spend: 1480, clicks: 3210, leads: 402, status: "active" },
    { id: "a6", name: "Farm café weekend", platform: "Meta", div: "estates", spend: 420, clicks: 760, leads: 31, status: "paused" }
  ];
  const SOCIAL = [
    [1, "IG", "Reel: can design reveal"], [3, "TT", "Taste test with gym crew"], [5, "IG", "Carousel: what is in a can"],
    [8, "FB", "Batch 001 countdown"], [10, "TT", "Behind the scenes, Pontian estate"], [12, "IG", "Story poll: flavour name"],
    [15, "IG", "Reel: 150 ml, one boost"], [17, "TT", "Duet challenge launch"], [19, "FB", "Stockist spotlight"],
    [22, "IG", "Founder Q&A"], [24, "TT", "Pineapple field sunrise"], [27, "IG", "Batch 001 last call"], [30, "FB", "Launch day details"], [33, "IG", "Launch week recap"]
  ].map(([d, ch, text], i) => ({ d, ch, text, status: i < 4 ? "published" : i < 7 ? "scheduled" : "draft" }));

  const r = rng(42);
  const WAITLIST = { total: 2418, goal: 3000, daily: [] };
  let run = 1100;
  for (let i = 29; i >= 0; i--) { const v = Math.round(18 + r() * 40 + (29 - i) * 1.2); run += v; WAITLIST.daily.push({ d: D(-i), v }); }
  WAITLIST.recent = [
    ["Aiman", "Johor", "Instagram"], ["Mei Xuan", "Selangor", "TikTok"], ["Harith", "Kuala Lumpur", "Meta Ads"], ["Shalini", "Penang", "Website"],
    ["Farhan", "Johor", "Referral"], ["Jia Hui", "Melaka", "TikTok"], ["Izzat", "Perak", "Meta Ads"]
  ].map(([n, s, src], i) => ({ name: n, email: n[0].toLowerCase() + "•••@example.com", state: s, src, t: -(i * 17 + 4) }));

  /* websites */
  const SITES = [
    {
      id: "corp", name: "Corporate site", domain: "logs-agri.com", div: "agri", uptime: 99.98, speedM: 92, speedD: 99, lcp: 1.6, pages: 18, forms: 64, formsPrev: 49,
      keywords: [["fruit grading machine malaysia", 4, 9], ["pineapple sorting machine", 2, 3], ["reemoon malaysia", 1, 1], ["agricultural machinery johor", 7, 12], ["huayo agro tractor", 3, 2], ["post harvest line malaysia", 6, 11], ["iot farm sensors malaysia", 14, 22]],
      changes: [[-0.1, "Published “Durian grading lines” page"], [-2, "Added Reemoon case study: Sinar Tropika (sample)"], [-5, "Compressed hero images, LCP 2.4 s → 1.6 s"], [-9, "New enquiry form with WhatsApp handoff"]],
      tasks: [["New page: Pineapple grading line 7 MT/hr", true], ["New page: IoT soil sensors for estates", false], ["Refresh meta titles on 6 product pages", true], ["Internal links from blog to product pages", false]]
    },
    {
      id: "pb", name: "Pina Boosta", domain: "Domain TBC", div: "bev", uptime: 99.95, speedM: 88, speedD: 98, lcp: 1.9, pages: 7, forms: 1590, formsPrev: 940,
      keywords: [["pineapple energy drink", 11, 24], ["pina boosta", 1, 1], ["halal energy drink malaysia", 18, 31], ["natural energy drink", 27, 40], ["batch 001 waitlist", 2, 5]],
      changes: [[-0.4, "Waitlist counter now live on home page"], [-3, "Added “Where to find us” stockist map"], [-7, "Story page with estate photos"]],
      tasks: [["New page: Stockists & where to buy", true], ["New page: Ingredients & nutrition (TBC)", false], ["Open Graph images for launch", false]]
    }
  ];

  /* estates & café */
  const TOURS = [
    { id: "TB-118", group: "Jelajah Desa Travel & Tours", date: D(3), pax: 38, pkg: "Farm tour + café lunch", status: "Confirmed", value: 3306 },
    { id: "TB-119", group: "SK Taman Bunga (school)", date: D(6), pax: 64, pkg: "Educational tour", status: "Confirmed", value: 2560 },
    { id: "TB-120", group: "Walk-in family bookings", date: D(4), pax: 22, pkg: "Weekend tour", status: "Open", value: 990 },
    { id: "TB-121", group: "Kembara Selatan Holidays", date: D(11), pax: 26, pkg: "Farm tour + café lunch", status: "Deposit due", value: 2262 },
    { id: "TB-122", group: "Corporate retreat, Syarikat Contoh", date: D(17), pax: 80, pkg: "Corporate day package", status: "Tentative", value: 9600 }
  ];
  const CAFE = []; const r2 = rng(7);
  for (let i = 13; i >= 0; i--) { const dt = new Date(today.getTime() - i * DAY); const we = dt.getDay() === 0 || dt.getDay() === 6; CAFE.push({ d: dt.toISOString(), v: Math.round((we ? 2400 : 900) + r2() * (we ? 1400 : 700)) }); }
  const SHOP = [
    { sku: "FS-01", name: "Fresh MD2 pineapple (each)", price: 6.5, stock: 340, sold: 412 },
    { sku: "FS-02", name: "Pineapple jam, 250 g", price: 14, stock: 46, sold: 58 },
    { sku: "FS-03", name: "Dried pineapple, 150 g", price: 12.5, stock: 12, sold: 74 },
    { sku: "FS-04", name: "Pineapple honey, 500 g", price: 32, stock: 28, sold: 19 },
    { sku: "FS-05", name: "Estate tote bag", price: 25, stock: 0, sold: 8 },
    { sku: "FS-06", name: "Pineapple tart box (20 pcs)", price: 28, stock: 64, sold: 41 }
  ];

  /* analytics generator: deterministic per range */
  function analytics(days, site) {
    const r3 = rng(days * 13 + (site === "pb" ? 5 : site === "corp" ? 3 : 1));
    const pts = [];
    for (let i = days - 1; i >= 0; i--) {
      const dt = new Date(today.getTime() - i * DAY);
      const trend = 1 + (days - i) / days * 0.35;
      const corp = Math.round((140 + r3() * 70) * trend);
      const pb = Math.round((210 + r3() * 160) * trend * (1 + (days - i) / days * 0.6));
      const conv = Math.round((corp * 0.028 + pb * 0.05) * (0.8 + r3() * 0.4));
      pts.push({ d: dt.toISOString(), corp, pb, conv: site === "corp" ? Math.round(corp * 0.028 * (0.8 + r3() * 0.4)) : site === "pb" ? Math.round(pb * 0.05 * (0.8 + r3() * 0.4)) : conv });
    }
    return pts;
  }

  const USERS = [
    { name: "Rashid Hamzah", email: "rashid@logs-agri.example", role: "Owner" },
    { name: "Nurul Aina Kassim", email: "nurul@logs-agri.example", role: "Admin" },
    { name: "Tan Mei Ling", email: "meiling@logs-agri.example", role: "Finance" },
    { name: "Shafi", email: "shafi@logs-agri.example", role: "Manager" },
    { name: "Azlan", email: "azlan@logs-agri.example", role: "Manager" },
    { name: "K'Mar", email: "kmar@logs-agri.example", role: "Manager" },
    { name: "Zulkifli Ahmad", email: "zul@logs-agri.example", role: "Technician" }
  ];
  const INTEGRATIONS = [
    { id: "wa", name: "WhatsApp Business", desc: "Log chats as activities, send quotes and reminders.", on: true },
    { id: "gw", name: "Google Workspace", desc: "Gmail, Calendar and Drive sync for every user.", on: true },
    { id: "gsc", name: "Google Search Console", desc: "Keyword rankings and clicks for both websites.", on: true },
    { id: "ga4", name: "Google Analytics 4", desc: "Traffic, conversions and funnels.", on: true },
    { id: "meta", name: "Meta (Facebook & Instagram)", desc: "Ad spend, leads and scheduled posts.", on: false },
    { id: "myinv", name: "MyInvois (LHDN e-Invoice)", desc: "Submit and validate e-Invoices. Planned integration.", on: false, planned: true }
  ];

  window.LOGSCO = {
    today: today.toISOString(), DIVS, DIV_ORDER, STAFF, COMPANIES, STAGES, PROB, DEALS, INVOICES, REVENUE, LEAD_SOURCES, KPI_EXTRA,
    TASKS, SCHEDULE, LEAVE, TICKETS, PARTS, PART_STEPS, COMMISSIONING, ACTIVITY, SEQUENCES, ADS, SOCIAL, WAITLIST, SITES,
    TOURS, CAFE, SHOP, USERS, INTEGRATIONS, analytics
  };
})();
