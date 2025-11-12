# KlimaHeld Blockchain

Die KlimaHeld Blockchain ist eine bewusst schlank gehaltene Demonstration, wie eine
Kryptowährung nachhaltig ausgerichtet werden könnte. Sie kombiniert eine einfache
Blockchain-Implementierung mit einem optionalen Aufruf an einen Baum-pflanz-Service.

## Analyse der aktuellen Währung

* **Konsensmechanismus** – Die Blockchain nutzt ein Proof-of-Work-Miningschema mit
  einstellbarer Schwierigkeit. Für einen echten Einsatz fehlt jedoch ein
  Peer-to-Peer-Netzwerk, das die Blöcke verteilt und verifiziert.
* **Transaktionssicherheit** – Transaktionen werden aktuell nicht digital signiert.
  Dadurch kann jede Instanz Transaktionen im Namen anderer Adressen erzeugen. Für
  einen produktiven Einsatz wären kryptografische Signaturen (z. B. ECDSA) nötig.
* **Token-Ökonomie** – Die Blockbelohnung ist statisch. Eine langfristige Geldpolitik
  (z. B. schrittweise Halbierung oder Gebührenmodelle) ist sinnvoll, um Inflation zu
  steuern.
* **Baumpflanz-Integration** – Der Code unterstützt das Pflanzen eines Baumes pro
  Block. In Produktionsumgebungen muss abgesichert werden, dass der externe Dienst
  zuverlässig erreichbar ist und Fehlerbehandlung sowie Monitoring vorhanden sind.
* **Testbarkeit** – Durch die Trennung in Mainnet- und Testnet-Konfigurationen können
  neue Funktionen zuerst unter reduzierter Schwierigkeit erprobt werden, bevor sie im
  produktiven Netzwerk landen.

### Empfehlungen für den weiteren Ausbau

1. **Signaturen einführen** – Verwende pro Adresse ein Schlüsselpaar und signiere
   Transaktionen. Validierung sollte bereits beim Hinzufügen zur Pending-Liste
   erfolgen.
2. **Netzwerkebene aufbauen** – Erstelle einen Node, der Blöcke und Transaktionen per
   HTTP/WebSocket austauscht. Ein Gossip-Protokoll erhöht die Ausfallsicherheit.
3. **Ökonomische Parameter evaluieren** – Definiere eine klare Tokenomics-Strategie
   (Emission, Gebühren, Nutzung für Klimaprojekte). Binde reale Klimadaten als
   Oracles ein.
4. **Observability** – Ergänze Logging, Metriken und Alarmierung für Mining und
   Baumpflanz-Requests, um Fehlersituationen schnell zu erkennen.

## Verwendung

Der Einstiegspunkt für Anwender ist die CLI in `src/cli.js`. Sie nutzt das
Modul `src/index.js`, welches Blockchain, Blöcke, Transaktionen und die Demo-Funktion
exportiert.

### Installation

```bash
npm install
```

### Demo ausführen

```bash
# Testnet (Standard)
npm run demo

# Mainnet-Demo
npm run demo:mainnet

# Netzwerke anzeigen
npm run demo -- --list-networks

# Alternative Schreibweise
node src/cli.js --network testnet
```

### Tests

```bash
npm test
```

### Schnellstart auf macOS (Projekt auf dem Schreibtisch)

Falls sich dein Projektordner beispielsweise unter
`~/Desktop/KlimaHeld_Full-codex-analyse-currency-and-refine-main-testnet-code`
befindet, kannst du folgende Befehle direkt im Terminal ausführen:

```bash
# In den Projektordner auf dem Schreibtisch wechseln
cd ~/Desktop/KlimaHeld_Full-codex-analyse-currency-and-refine-main-testnet-code

# Abhängigkeiten installieren (nur einmal nötig)
npm install

# Testnet-Demo ohne Baum-API-Aufrufe starten
npm run demo

# Optional: Mainnet-Konfiguration testen (Baum-API bleibt ohne Netz nicht aktiv)
npm run demo:mainnet

# Automatisierte Tests laufen lassen
npm test
```

Damit kannst du auf einem Mac unmittelbar von deinem Schreibtisch-Verzeichnis
aus loslegen, ohne echte Bäume zu pflanzen.

### Netzwerkkonfigurationen

| Netzwerk  | Schwierigkeit | Blockbelohnung | Baum-API |
|-----------|---------------|----------------|----------|
| mainnet   | 4             | 100 KLH        | Aktiv    |
| testnet   | 2             | 25 KLH         | Deaktiv  |

Die Testnet-Konfiguration reduziert den Mining-Aufwand und deaktiviert das
Baumpflanzen, damit lokale Experimente keine realen Kosten verursachen.

## Programmierschnittstelle

Das Modul exportiert folgende Klassen und Hilfsfunktionen:

* `Transaction` – Repräsentiert eine Überweisung.
* `Block` – Bündelt Transaktionen und enthält Proof-of-Work-Funktionalität.
* `Blockchain` – Verwaltung der Kette inklusive Mining, Adressgenerierung und
  Saldenberechnung.
* `NETWORKS` – Vordefinierte Konfigurationsobjekte für Mainnet und Testnet.
* `runDemo(networkName)` – Führt die oben beschriebene Demo programmgesteuert aus.

```javascript
const { Blockchain, NETWORKS } = require('./src/index');

const chain = new Blockchain(NETWORKS.testnet);
const sender = chain.generateAddress();
const receiver = chain.generateAddress();

chain.createTransaction(sender, receiver, 10);
await chain.minePendingTransactions(chain.generateAddress());
console.log(chain.chain);
```

## Synchronisation mit GitHub

1. Lege ein neues Repository auf GitHub an und kopiere dessen URL.
2. Richte das Remote in deinem lokalen Projekt ein:

   ```bash
   git remote add origin <deine-github-url>
   ```

3. Prüfe, welche Dateien übernommen werden sollen:

   ```bash
   git status
   ```

4. Committe die Änderungen und pushe sie nach GitHub:

   ```bash
   git add .
   git commit -m "Deine Nachricht"
   git push -u origin <branch-name>
   ```

5. Erstelle bei Bedarf einen Pull Request direkt auf GitHub, um Code Reviews zu
   ermöglichen.
