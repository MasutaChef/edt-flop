const PROFS = { "AAUP": "Anaïs AUPEIX", "ABAL": "Anthony BALITRAND", "ABO": "Anthony BOUERY", "ACRT": "Accueil RT", "ADES": "Arnaud DESPAX", "ADHO": "Adeline D'Hondt", "AFAR": "Adrien FARGEAS", "AGIL": "Adrien Gilbert", "ALAB": "Amira Labidi", "ALAI": "Aurélien LAIDET", "ARO": "Alain Roux", "AV": "Adrien Van Den Bossche", "BALB": "Benoît ALBERT", "BDEP": "DEPLECHIN Bastien", "BPAT": "Bruno PATIES", "CBAR": "Clément BARREDA", "CBLA": "Christophe BLANCHET", "CFRI": "Clément FRISICARO", "CLAB": "Chantal LABAT", "CMAR": "Christine Marrou", "CPAL": "Curtis PALMA", "CSOU": "Christian SOUTOU", "CVEY": "Cassandre Vey", "DBRU": "Damien BRULIN", "DFLO": "Dominique FLORENTINY", "DLEN": "Didier LENQUETTE", "DTHE": "THERON Dorian", "EA": "Evelyne Armstrong", "EAGU": "Éric AGUILAR", "EFRE": "Elisa Fredieu", "EHUR": "Enzo HURTADO", "EPI": "Éric Piecourt", "FCHA": "Franck Chauvin", "FCR": "Fabienne CROSTA", "FMAG": "Flavien MAGINOT", "GCAU": "Guilhem CAUSSE", "GCHA": "Guesmi CHAOUKI", "GEST": "Geneviève ESTADIEU", "GFAB": "Gilles FABRE", "GMAN": "Gaël MANSALIER", "GRAS": "Grégory RASSEL", "HANN": "Hamed ANNTAR", "HSIM": "Hugo SIMANCAS", "IRAH": "Ibrahim Rahman", "JESI": "Jérôme SIEURAC", "JMAN": "Julien MANTEAU", "JMD": "Jean-marc Domercq", "JMIQ": "Jonathan MIQUEL", "JMTA": "Jean-Marc TARROUX", "JPBO": " BOURGEOIS", "JPBU": "Jean-Pierre Buzzo", "JPFE": "Jean-Pierre FEWOU", "JSCH": "Julien SCHRIVE", "JSEX": "John SEXTON", "JTA": "James Tatler", "JTAT": "James Tatler", "KMAS": "Khalid Massaoudi", "KPAU": "Karlyn PAULET", "LAFO": "Léo AFONSO", "LAND": "Laurent ANDRIEUX", "LD": "Laurent Demay", "LDAM": "Léa DAMAGGIO", "LDEC": "Léa DECOURCELLE", "LGAL": "Laurent GALIBERT", "LM": "Laetitia Marti", "LNAV": "Laurent NAVARRO", "LVAM": "Ludwig VAMBAIRGUE", "MBAU": "Marc Baudoin", "MGUI": "Maxime Guiraud", "MLAS": "Maxime Lastera", "MVAN": "Maxime VAN-SCHENDEL", "NBER": "Nabila BERMAD", "NG": "Nicolas Gonzalez", "NGUT": "Nicolas Gutierrez", "NSE": "Noël SERRES", "OM": "Olivier Martin", "ONEG": "Olivier NEGRO", "PCOU": "Patrick COUFFIGNAL", "PDUM": "Pierre DUMAY", "PLEG": "Patrick LEGLUHERE", "QDUF": "Quentin Dufour", "QGAL": "Quentin GALLAND", "RDAL": "Réjane Dalcé", "RDAS": "Romain Da Silva", "SDUF": "Stephan DUFRECHOU", "SGIR": "Sylvain GIROUX", "SJOS": "Sébastien JOSSET", "SYOU": "Sarah YOUNES", "TGAL": "Tommy GALET", "TJ": "Térence Jung", "TKUI": "Tristan KUIPERS", "TPRO": "Thibaut PROBST", "TSCA": "Tristan SCANDELLA", "TVAL": "Thierry VAL", "TVIL": "Thierry VILLEMUR", "VACRT": "vac RT", "VBAR": "Vincent Barbandière", "YBAU": "Yohann BAUZIL" };

let events = [];
let currDate = new Date();
let currView = 'day';
let currGroup = localStorage.getItem('user_group') || '1C';
let isDark = localStorage.getItem('theme') === 'dark';

window.onload = () => {
    // Init Thème
    if(isDark) document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon();

    // Init Données
    document.getElementById('group-select').value = currGroup;
    loadData(currGroup);

    // Rafraichir l'indicateur LIVE chaque minute
    setInterval(render, 60000);
};

// --- GESTION THEME ---
function toggleTheme() {
    isDark = !isDark;
    if(isDark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}
function updateThemeIcon() {
    const btn = document.getElementById('theme-btn');
    btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}

function changeGroup(g) {
    currGroup = g;
    localStorage.setItem('user_group', g);
    loadData(g);
}

async function loadData(group) {
    document.getElementById('loading').style.display = 'flex';
    const url = `./edt_${group}.ics?t=` + Date.now();
    try {
        const res = await fetch(url);
        if(!res.ok) throw new Error();
        const text = await res.text();
        parseData(text);
    } catch(e) {
        document.getElementById('day-container').innerHTML = "<p class='empty'>Erreur chargement. Vérifie que le robot GitHub a tourné !</p>";
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function parseData(ics) {
    const jcal = ICAL.parse(ics);
    const comp = new ICAL.Component(jcal);
    events = comp.getAllSubcomponents("vevent").map(e => {
        const evt = new ICAL.Event(e);
        let title = evt.summary; let prof = ""; let type = "Autre";

        if (title.includes("-")) {
            const parts = title.split("-");
            prof = parts[parts.length-1].trim();
            title = parts.slice(0, -1).join("-").trim();
        }
        const up = title.toUpperCase();
        if (up.includes("TP")) type = "tp";
        else if (up.includes("TD")) type = "td";
        else if (up.includes("CM") || up.includes("AMPHI")) type = "cm";
        else if (up.includes("EXAM")) type = "exam";

        return { title, prof, type, loc: evt.location || "?", start: evt.startDate.toJSDate(), end: evt.endDate.toJSDate() };
    });
    events.sort((a,b) => a.start - b.start);
    render();
}

function setView(v) {
    currView = v;
    document.getElementById('btn-day').className = v === 'day' ? 'switch-opt active' : 'switch-opt';
    document.getElementById('btn-week').className = v === 'week' ? 'switch-opt active' : 'switch-opt';
    document.getElementById('day-container').style.display = v === 'day' ? 'block' : 'none';
    document.getElementById('week-container').style.display = v === 'week' ? 'flex' : 'none';
    render();
}

function navDate(dir) {
    const days = currView === 'day' ? 1 : 7;
    currDate.setDate(currDate.getDate() + (dir * days));
    render();
}

function getMonday(d) {
    d = new Date(d);
    const day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6 : 1);
    const mon = new Date(d.setDate(diff));
    mon.setHours(0,0,0,0);
    return mon;
}

function render() {
    const dateLabel = document.getElementById('date-label');
    const dayCont = document.getElementById('day-container');
    const weekCont = document.getElementById('week-container');
    const now = new Date();

    if (currView === 'day') {
        dateLabel.setAttribute('datetime', currDate.toISOString().split('T')[0]);
        dateLabel.innerText = currDate.toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'});
        
        const start = new Date(currDate); start.setHours(0,0,0,0);
        const end = new Date(currDate); end.setHours(23,59,59,999);
        const dayEvts = events.filter(e => e.start >= start && e.start <= end);

        dayCont.innerHTML = dayEvts.length ? dayEvts.map(e => makeCard(e, now)).join('') : "<p class='empty'>Rien ce jour 💤</p>";

    } else {
        const mon = getMonday(currDate);
        dateLabel.innerText = `Semaine du ${mon.getDate()} ${mon.toLocaleDateString('fr-FR',{month:'short'})}`;
        weekCont.innerHTML = "";

        const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
        for(let i=0; i<5; i++) {
            const d = new Date(mon); d.setDate(mon.getDate()+i);
            const s = new Date(d); s.setHours(0,0,0,0);
            const e = new Date(d); e.setHours(23,59,59,999);
            const evts = events.filter(ev => ev.start >= s && ev.start <= e);

            let html = `<section class="week-column"><header class="col-header">${days[i]} ${d.getDate()}</header><div class="col-content">`;
            html += evts.length ? evts.map(ev => makeCard(ev, now)).join('') : "<p class='empty' style='padding:10px'>Libre</p>";
            html += `</div></section>`;
            weekCont.innerHTML += html;
        }
    }
}

function makeCard(e, now) {
    const h1 = e.start.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
    const h2 = e.end.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
    
    // Logique LIVE (En cours)
    const isLive = (e.start <= now && e.end >= now);
    const liveClass = isLive ? 'is-live' : '';
    const liveBadge = isLive ? '<mark class="live-badge">EN COURS</mark>' : '';

    return `
    <article class="card ${e.type} ${liveClass}">
        ${liveBadge}
        <header class="time-row">
            <time datetime="${e.start.toISOString()}">${h1}</time> - <time datetime="${e.end.toISOString()}">${h2}</time>
        </header>
        
        <h3 class="card-title" onclick="showProf('${e.prof}')">${e.title}</h3>
        
        <footer class="card-footer">
            <button class="pill" onclick="showProf('${e.prof}')" aria-label="Voir le professeur">
                <i class="fa-solid fa-user"></i> ${e.prof}
            </button>
            <button class="pill pill-loc" onclick="showLoc('${e.loc}')" aria-label="Voir la salle">
                <address style="font-style:normal; display:inline"><i class="fa-solid fa-location-dot"></i> ${e.loc}</address>
            </button>
        </footer>
    </article>`;
}

// --- POPUPS ---
const modal = document.getElementById('modal');
const modalCard = document.querySelector('.modal-card');

function showProf(code) {
    const name = PROFS[code] || code;
    
    // Remet la taille normale (au cas où elle était large avant)
    modalCard.classList.remove('large');

    document.getElementById('modal-icon').innerHTML = '<i class="fa-solid fa-user-tie"></i>';
    document.getElementById('modal-subtitle').innerText = "Enseignant";
    document.getElementById('modal-title').innerText = name;
    document.getElementById('modal-content').innerHTML = ""; 
    modal.classList.add('open');
}

function showLoc(loc) {
    // Agrandit la fenêtre pour le plan
    modalCard.classList.add('large');

    document.getElementById('modal-icon').innerHTML = '<i class="fa-solid fa-map-location-dot"></i>';
    document.getElementById('modal-subtitle').innerText = "Localisation";
    document.getElementById('modal-title').innerText = "Salle " + loc;
    
    const content = document.getElementById('modal-content');
    
    // IMPORTANT: Assure-toi que ton image est bien dans le dossier img/ et s'appelle plan.jpg
    content.innerHTML = `
        <figure style="margin:0; width:100%; display:flex; flex-direction:column; align-items:center;">
            <img src="img/plan.jpg" 
                 alt="Plan de l'IUT indiquant la salle ${loc}" 
                 style="width:100%; height:auto; border-radius:8px; border:1px solid var(--border); display:block;">
            
            <figcaption style="margin-top:10px; color:var(--text-sub); font-size:0.85rem;">
                Bâtiment RT <br>
                <a href="https://www.google.com/maps/search/?api=1&query=IUT+Blagnac" target="_blank" style="color:var(--primary); text-decoration:underline; font-weight:bold;">
                    <i class="fa-solid fa-location-arrow"></i> Ouvrir GPS
                </a>
            </figcaption>
        </figure>`;
        
    modal.classList.add('open');
}

function closeModal(e) {
    if(e.target.id === 'modal' || e.currentTarget.classList.contains('modal-close')) {
        modal.classList.remove('open');
        // Petit délai pour reset la taille pour la prochaine ouverture
        setTimeout(() => modalCard.classList.remove('large'), 200);
    }
}
