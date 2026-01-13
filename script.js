const PROFS = { "AAUP": "Anaïs AUPEIX", "ABAL": "Anthony BALITRAND", "ABO": "Anthony BOUERY", "ACRT": "Accueil RT", "ADES": "Arnaud DESPAX", "ADHO": "Adeline D'Hondt", "AFAR": "Adrien FARGEAS", "AGIL": "Adrien Gilbert", "ALAB": "Amira Labidi", "ALAI": "Aurélien LAIDET", "ARO": "Alain Roux", "AV": "Adrien Van Den Bossche", "BALB": "Benoît ALBERT", "BDEP": "DEPLECHIN Bastien", "BPAT": "Bruno PATIES", "CBAR": "Clément BARREDA", "CBLA": "Christophe BLANCHET", "CFRI": "Clément FRISICARO", "CLAB": "Chantal LABAT", "CMAR": "Christine Marrou", "CPAL": "Curtis PALMA", "CSOU": "Christian SOUTOU", "CVEY": "Cassandre Vey", "DBRU": "Damien BRULIN", "DFLO": "Dominique FLORENTINY", "DLEN": "Didier LENQUETTE", "DTHE": "THERON Dorian", "EA": "Evelyne Armstrong", "EAGU": "Éric AGUILAR", "EFRE": "Elisa Fredieu", "EHUR": "Enzo HURTADO", "EPI": "Éric Piecourt", "FCHA": "Franck Chauvin", "FCR": "Fabienne CROSTA", "FMAG": "Flavien MAGINOT", "GCAU": "Guilhem CAUSSE", "GCHA": "Guesmi CHAOUKI", "GEST": "Geneviève ESTADIEU", "GFAB": "Gilles FABRE", "GMAN": "Gaël MANSALIER", "GRAS": "Grégory RASSEL", "HANN": "Hamed ANNTAR", "HSIM": "Hugo SIMANCAS", "IRAH": "Ibrahim Rahman", "JESI": "Jérôme SIEURAC", "JMAN": "Julien MANTEAU", "JMD": "Jean-marc Domercq", "JMIQ": "Jonathan MIQUEL", "JMTA": "Jean-Marc TARROUX", "JPBO": " BOURGEOIS", "JPBU": "Jean-Pierre Buzzo", "JPFE": "Jean-Pierre FEWOU", "JSCH": "Julien SCHRIVE", "JSEX": "John SEXTON", "JTA": "James Tatler", "JTAT": "James Tatler", "KMAS": "Khalid Massaoudi", "KPAU": "Karlyn PAULET", "LAFO": "Léo AFONSO", "LAND": "Laurent ANDRIEUX", "LD": "Laurent Demay", "LDAM": "Léa DAMAGGIO", "LDEC": "Léa DECOURCELLE", "LGAL": "Laurent GALIBERT", "LM": "Laetitia Marti", "LNAV": "Laurent NAVARRO", "LVAM": "Ludwig VAMBAIRGUE", "MBAU": "Marc Baudoin", "MGUI": "Maxime Guiraud", "MLAS": "Maxime Lastera", "MVAN": "Maxime VAN-SCHENDEL", "NBER": "Nabila BERMAD", "NG": "Nicolas Gonzalez", "NGUT": "Nicolas Gutierrez", "NSE": "Noël SERRES", "OM": "Olivier Martin", "ONEG": "Olivier NEGRO", "PCOU": "Patrick COUFFIGNAL", "PDUM": "Pierre DUMAY", "PLEG": "Patrick LEGLUHERE", "QDUF": "Quentin Dufour", "QGAL": "Quentin GALLAND", "RDAL": "Réjane Dalcé", "RDAS": "Romain Da Silva", "SDUF": "Stephan DUFRECHOU", "SGIR": "Sylvain GIROUX", "SJOS": "Sébastien JOSSET", "SYOU": "Sarah YOUNES", "TGAL": "Tommy GALET", "TJ": "Térence Jung", "TKUI": "Tristan KUIPERS", "TPRO": "Thibaut PROBST", "TSCA": "Tristan SCANDELLA", "TVAL": "Thierry VAL", "TVIL": "Thierry VILLEMUR", "VACRT": "vac RT", "VBAR": "Vincent Barbandière", "YBAU": "Yohann BAUZIL" };

let events = [];
let currDate = new Date();
let currView = 'day';
let currGroup = localStorage.getItem('user_group') || '1C';
let isDark = localStorage.getItem('theme') === 'dark';

window.onload = () => {
    if(isDark) document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon();
    document.getElementById('group-select').value = currGroup;
    loadData(currGroup);
    // Rafraichir l'affichage toutes les 30 sec (pour le "En cours")
    setInterval(render, 30000);
};

function toggleTheme() {
    isDark = !isDark;
    if(isDark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}
function updateThemeIcon() {
    const btn = document.getElementById('theme-btn');
    if(btn) btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}

function changeGroup(g) {
    currGroup = g;
    localStorage.setItem('user_group', g);
    loadData(g);
}

async function loadData(group) {
    const loadingEl = document.getElementById('loading');
    if(loadingEl) loadingEl.style.display = 'flex';
    
    // On ajoute un timestamp pour éviter le cache du fichier ICS
    const url = `./edt_${group}.ics?t=` + Date.now();
    
    try {
        const res = await fetch(url);
        if(!res.ok) throw new Error("Erreur HTTP");
        const text = await res.text();
        parseData(text);
    } catch(e) {
        console.error(e);
        const dayCont = document.getElementById('day-container');
        if(dayCont) dayCont.innerHTML = "<p class='empty'>Impossible de charger l'emploi du temps.</p>";
    } finally {
        if(loadingEl) loadingEl.style.display = 'none';
    }
}

function parseData(ics) {
    try {
        const jcal = ICAL.parse(ics);
        const comp = new ICAL.Component(jcal);
        events = comp.getAllSubcomponents("vevent").map(e => {
            const evt = new ICAL.Event(e);
            let title = evt.summary || "Cours";
            let prof = "";
            let type = "Autre";

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

            return { 
                title: title, 
                prof: prof, 
                type: type, 
                loc: evt.location || "?", 
                start: evt.startDate.toJSDate(), 
                end: evt.endDate.toJSDate() 
            };
        });
        
        // Tri chronologique
        events.sort((a,b) => a.start - b.start);
        
        // Premier rendu
        render();
    } catch(e) {
        console.error("Erreur parsing ICS", e);
    }
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

// Fonction utilitaire pour trouver le Lundi de la date donnée
function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay(); // 0 (Dimanche) à 6 (Samedi)
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

// --- CALCUL DES HEURES ---
function updateWeeklyHours(monday) {
    const startWeek = new Date(monday);
    startWeek.setHours(0,0,0,0);
    
    const endWeek = new Date(monday);
    endWeek.setDate(monday.getDate() + 6);
    endWeek.setHours(23,59,59,999);

    const weekEvents = events.filter(e => e.start >= startWeek && e.start <= endWeek);
    
    let totalMs = 0;
    weekEvents.forEach(e => {
        const duration = e.end.getTime() - e.start.getTime();
        // Sécurité : on ignore les durées négatives ou nulles
        if (duration > 0) totalMs += duration;
    });

    const h = Math.floor(totalMs / (1000 * 60 * 60));
    const m = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    
    const counterEl = document.querySelector('#weekly-count span');
    if(counterEl) {
        counterEl.innerText = `${h}h ${m < 10 ? '0'+m : m}`;
    }
}

function render() {
    const dateLabel = document.getElementById('date-label');
    const dayCont = document.getElementById('day-container');
    const weekCont = document.getElementById('week-container');
    const now = new Date();

    // 1. Calculer le Lundi de la semaine affichée
    const mon = getMonday(currDate);
    
    // 2. Mettre à jour le compteur d'heures (même en vue jour)
    updateWeeklyHours(mon);

    if (currView === 'day') {
        // Vue Jour
        dateLabel.setAttribute('datetime', currDate.toISOString().split('T')[0]);
        dateLabel.innerText = currDate.toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'});
        
        const startDay = new Date(currDate); startDay.setHours(0,0,0,0);
        const endDay = new Date(currDate); endDay.setHours(23,59,59,999);
        
        const dayEvts = events.filter(e => e.start >= startDay && e.start <= endDay);
        dayCont.innerHTML = dayEvts.length ? dayEvts.map(e => makeCard(e, now)).join('') : "<p class='empty'>Rien ce jour 💤</p>";

    } else {
        // Vue Semaine
        dateLabel.innerText = `Semaine du ${mon.getDate()} ${mon.toLocaleDateString('fr-FR',{month:'short'})}`;
        weekCont.innerHTML = "";

        const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
        for(let i=0; i<5; i++) {
            const d = new Date(mon); 
            d.setDate(mon.getDate() + i);
            
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

// --- MODAL ---
const modal = document.getElementById('modal');
const modalCard = document.querySelector('.modal-card');

function showProf(code) {
    const name = PROFS[code] || code;
    modalCard.classList.remove('large');
    
    document.getElementById('modal-icon').style.display = 'block';
    document.getElementById('modal-subtitle').style.display = 'block';
    
    document.getElementById('modal-icon').innerHTML = '<i class="fa-solid fa-user-tie"></i>';
    document.getElementById('modal-subtitle').innerText = "Enseignant";
    document.getElementById('modal-title').innerText = name;
    document.getElementById('modal-content').innerHTML = ""; 
    
    modal.classList.add('open');
}

function showLoc(loc) {
    modalCard.classList.add('large');
    
    document.getElementById('modal-icon').style.display = 'none';
    document.getElementById('modal-subtitle').style.display = 'none';
    document.getElementById('modal-title').innerText = "Salle " + loc;
    
    document.getElementById('modal-content').innerHTML = `
        <figure style="margin:0; width:100%; height:100%; display:flex; flex-direction:column;">
            <img src="img/plan.jpg" alt="Plan de l'IUT" style="flex:1; width:100%; object-fit:contain;">
            <figcaption style="margin-top:10px;">
                <a href="https://www.google.com/maps/search/?api=1&query=IUT+Blagnac" target="_blank" class="modal-btn" style="margin-top:0">
                    <i class="fa-solid fa-location-arrow"></i> GPS
                </a>
            </figcaption>
        </figure>`;
        
    modal.classList.add('open');
}

function closeModal(e) {
    if(e.target.id === 'modal' || e.currentTarget.classList.contains('modal-close')) {
        modal.classList.remove('open');
        setTimeout(() => modalCard.classList.remove('large'), 200);
    }
}
