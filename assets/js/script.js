// SportsHub — Week Project Settimana VII
//
// Devi fare 4 cose per la Versione Base:
// 1. Definire le classi Squadra ed Evento (mappano i dati di TheSportsDB)
// 2. Funzione async cercaSquadre(query) che chiama /searchteams.php
// 3. Funzione async caricaDettagli(idTeam) che chiama in parallelo
//    eventsnext.php + eventslast.php usando Promise.all
// 4. Render dinamico: card squadre, lista prossimi eventi, lista risultati
//
// Endpoint base: https://www.thesportsdb.com/api/v1/json/3/
// Il `3` nell'URL è la chiave API pubblica di test di TheSportsDB: gratis, non serve registrarsi.
//
// Per le versioni Intermedia/Avanzata: localStorage preferiti, debounce, Promise.all multi.

// CLASSE SQUADRA
class Squadra {
    constructor(dati) {
        this.idTeam = dati.idTeam;
        this.strTeam = dati.strTeam;
        this.strBadge = dati.strBadge;
        this.strLeague = dati.strLeague;
        this.strCountry = dati.strCountry;
    }
}


// CLASSE SPORThUB
class SportsHub {

    constructor() {

        // ELEMENTI HTML
        this.formRicerca = document.querySelector("#form-ricerca");
        this.ricercaSquadra = document.querySelector("#ricerca-squadra");
        this.listaRisultati = document.querySelector("#lista-risultati");
        this.listaPreferiti = document.querySelector("#lista-preferiti");

        this.dettagliSection = document.querySelector("#dettagli-section");
        this.nomeSquadra = document.querySelector("#nome-squadra");
        this.prossimiEventi = document.querySelector("#prossimi-eventi");
        this.ultimiRisultati = document.querySelector("#ultimi-risultati");

        // VARIABILI
        const preferitiSalvati = JSON.parse(
            localStorage.getItem("squadrePreferite")
        ) || [];

        this.squadrePreferite = preferitiSalvati.map(function (dati) {
            return new Squadra(dati);
        });

        this.idSquadraAperta = null;

        // URL API
        this.url = "https://www.thesportsdb.com/api/v1/json/123/searchteams.php";

        // AVVIO APPLICAZIONE
        this.avvia();
    }


    // AVVIO EVENTI E PREFERITI
    avvia() {

        this.formRicerca.addEventListener("submit", (e) => {

            e.preventDefault();

            const nomeSquadra = this.ricercaSquadra.value.trim();

            if (nomeSquadra === "") {
                return;
            }

            this.recuperaSquadre(nomeSquadra);
        });

        this.visualizzaPreferiti();
    }


    // CREAZIONE CONTENITORE CARD
    creaContenitoreCard() {

        const contenitore = document.createElement("div");

        contenitore.classList.add(
            "card",
            "h-100",
            "p-3",
            "text-center",
            "shadow-sm"
        );

        return contenitore;
    }


    // CREAZIONE MESSAGGIO PREFERITI
    creaMessaggioPreferiti() {

        const messaggio = document.createElement("p");

        messaggio.textContent = "✓ Aggiunta ai preferiti";

        messaggio.classList.add(
            "text-success",
            "small",
            "mb-0"
        );

        return messaggio;
    }


    // CREAZIONE CARD SQUADRA
    creaCard(squadra, preferita = false) {

        const card = document.createElement("article");
        //CLASSI PER RENDERE RESPONSIVE LE CARD
        card.classList.add(
            "col-12",
            "col-md-6",
            "col-lg-4"
        );

        const contenitoreCard = this.creaContenitoreCard();

        // LOGO
        const logo = document.createElement("img");

        logo.src = squadra.strBadge;
        logo.alt = "Logo " + squadra.strTeam;

        logo.classList.add("img-fluid", "mx-auto", "mb-2");
        logo.style.maxWidth = "90px";

        const nome = document.createElement("h3");

        nome.textContent = squadra.strTeam;
        nome.classList.add("card-title", "fs-5");
      
        const campionato = document.createElement("p");

        campionato.textContent = squadra.strLeague;

        campionato.classList.add(
            "card-text",
            "text-body-secondary",
            "mb-1"
        );

        const paese = document.createElement("p");

        paese.textContent = squadra.strCountry;

        paese.classList.add(
            "card-text",
            "text-body-secondary",
            "mb-2"
        );

        // RECUPERO I DETTAGLI DELLE CARD QUANDO CI CLICCO ATTRAVERSO LA FUNZIONE RECUPERADETTAGLI
        card.addEventListener("click", () => {
            this.recuperaDettagliSquadra(squadra);
        });


        // SE LA CARD È TRA I PREFERITI
        if (preferita) {

            const pulsanteRimuovi = document.createElement("button");

            pulsanteRimuovi.textContent = "❌ Rimuovi ";

            pulsanteRimuovi.classList.add(
                "btn",
                "btn-sm",
                "mt-2",
                "fw-bold",
                "coloreBottone",
                "border-danger"
            );
            pulsanteRimuovi.classList.add("btnRimuovi");

            pulsanteRimuovi.addEventListener("click", (event) => {
                //IMPEDISCO CHE IL CLICK SI PROPAGHI AGLI ELEMENTI GENITORI, COSI EVIDO INTERFERENZA TRA I DETTAGLI DELLE CARD E IL TASTO ELIMINA 
                event.stopPropagation();

                this.rimuoviPreferito(squadra);
            });

            contenitoreCard.append(
                logo,
                nome,
                campionato,
                paese,
                pulsanteRimuovi
            );

        } else {

            // CONTROLLO SQUADRA  PREFERITA
            const squadraEsistente = this.squadrePreferite.find(
                (elemento) => elemento.idTeam === squadra.idTeam
            );

            if (squadraEsistente) {

                contenitoreCard.append(
                    logo,
                    nome,
                    campionato,
                    paese,
                    this.creaMessaggioPreferiti()
                );

            } else {

                const pulsantePreferiti = document.createElement("button");

                pulsantePreferiti.textContent = "⭐ Aggiungi ai preferiti";

                pulsantePreferiti.classList.add(
                    "btn",
                    "btn-outline-warning",
                    "btn-sm",
                    "mt-2"
                );

                pulsantePreferiti.addEventListener("click", (event) => {

                    event.stopPropagation();

                    this.aggiungiPreferito(squadra);

                    pulsantePreferiti.replaceWith(
                        this.creaMessaggioPreferiti()
                    );
                });

                contenitoreCard.append(
                    logo,
                    nome,
                    campionato,
                    paese,
                    pulsantePreferiti
                );
            }
        }

        card.append(contenitoreCard);

        return card;
    }


    // RECUPERO SQUADRE
    async recuperaSquadre(nomeSquadra) {

        try {

            const indirizzo = new URL(this.url);

            indirizzo.searchParams.set("t", nomeSquadra);

            const risposta = await fetch(indirizzo);

            if (!risposta.ok) {
                throw new Error("Errore nella richiesta: " + risposta.status);
            }

            const dati = await risposta.json();

            this.listaRisultati.replaceChildren();

            if (dati.teams === null) {

                const messaggio = document.createElement("p");

                messaggio.textContent = "Nessuna squadra trovata.";

                messaggio.classList.add("col-12");

                this.listaRisultati.append(messaggio);

                return;
            }

            dati.teams.forEach((elemento) => {

                const squadra = new Squadra(elemento);

                const card = this.creaCard(squadra);

                this.listaRisultati.append(card);
            });

        } catch (errore) {

            console.error("Si è verificato un errore:", errore);
        }
    }


    // AGGIUNGI PREFERITO
    aggiungiPreferito(squadra) {

        const squadraEsistente = this.squadrePreferite.find(
            (elemento) => elemento.idTeam === squadra.idTeam
        );

        if (squadraEsistente) {
            return;
        }

        this.squadrePreferite.push(squadra);

        localStorage.setItem(
            "squadrePreferite",
            JSON.stringify(this.squadrePreferite)
        );

        this.visualizzaPreferiti();
    }


    // RIMUOVI PREFERITO
    rimuoviPreferito(squadra) {

        if (this.idSquadraAperta === squadra.idTeam) {

            this.dettagliSection.hidden = true;

            this.idSquadraAperta = null;
        }

        this.squadrePreferite = this.squadrePreferite.filter(
            (elemento) => elemento.idTeam !== squadra.idTeam
        );

        localStorage.setItem(
            "squadrePreferite",
            JSON.stringify(this.squadrePreferite)
        );

        this.visualizzaPreferiti();
    }


    // VISUALIZZA PREFERITI
    visualizzaPreferiti() {

        this.listaPreferiti.replaceChildren();

        if (this.squadrePreferite.length === 0) {

            const messaggio = document.createElement("p");

            messaggio.textContent = "Nessuna squadra tra i preferiti.";

            messaggio.classList.add("col-12");

            this.listaPreferiti.append(messaggio);

            return;
        }

        this.squadrePreferite.forEach((squadra) => {

            const card = this.creaCard(squadra, true);

            this.listaPreferiti.append(card);
        });
    }


    // RECUPERO DETTAGLI SQUADRA
    async recuperaDettagliSquadra(squadra) {

        if (this.idSquadraAperta === squadra.idTeam) {

            this.dettagliSection.hidden = true;
            this.idSquadraAperta = null;

            return;
        }

        this.idSquadraAperta = squadra.idTeam;

        try {

            const urlProssimi = new URL(
                "https://www.thesportsdb.com/api/v1/json/123/eventsnext.php"
            );

            urlProssimi.searchParams.set("id", squadra.idTeam);

            const urlUltimi = new URL(
                "https://www.thesportsdb.com/api/v1/json/123/eventslast.php"
            );

            urlUltimi.searchParams.set("id", squadra.idTeam);

            const [rispostaProssimi, rispostaUltimi] = await Promise.all([
                fetch(urlProssimi),
                fetch(urlUltimi)
            ]);

            if (!rispostaProssimi.ok || !rispostaUltimi.ok) {
                throw new Error("Errore nel recupero degli eventi");
            }

            const [datiProssimi, datiUltimi] = await Promise.all([
                rispostaProssimi.json(),
                rispostaUltimi.json()
            ]);

            this.dettagliSection.hidden = false;

            this.nomeSquadra.textContent = squadra.strTeam;

            this.prossimiEventi.replaceChildren();
            this.ultimiRisultati.replaceChildren();


            // PROSSIMI EVENTI
            if (datiProssimi.events) {

                datiProssimi.events.forEach((evento) => {

                    const partita = document.createElement("p");

                    partita.textContent = evento.strEvent;

                    partita.classList.add(
                        "pb-2",
                        "mb-2"
                    );

                    this.prossimiEventi.append(partita);
                });

            } else {

                const messaggio = document.createElement("p");

                messaggio.textContent = "Nessun prossimo evento disponibile.";

                messaggio.classList.add("text-body-secondary");

                this.prossimiEventi.append(messaggio);
            }


            // ULTIMI RISULTATI
            if (datiUltimi.results) {

                datiUltimi.results.forEach((evento) => {

                    const partita = document.createElement("p");

                    partita.textContent = evento.strEvent + "  ";

                    const risultato = document.createElement("span");

                    risultato.textContent =
                        evento.intHomeScore + " : " + evento.intAwayScore;

                    risultato.classList.add(
                        "bg-success",
                        "text-white",
                        "px-2",
                        "py-1",
                        "rounded"
                    );

                    partita.append(risultato);

                    this.ultimiRisultati.append(partita);
                });

            } else {

                const messaggio = document.createElement("p");

                messaggio.textContent = "Nessun risultato disponibile.";

                messaggio.classList.add("text-body-secondary");

                this.ultimiRisultati.append(messaggio);
            }

        } catch (errore) {

            console.error("Errore nel recupero dei dettagli:", errore);
        }
    }
}


// CREAZIONE APPLICAZIONE
const app = new SportsHub();


























// === Classi ===



// === API ===



// === Stato ===



// === Render ===



// === Eventi ===
