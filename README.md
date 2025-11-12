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

Der Einstiegspunkt liegt in `src/index.js`. Das Skript stellt eine Demo bereit, die
Transaktionen anlegt, einen Block mined und den resultierenden Zustand ausgibt. Über
Parameter kann zwischen Mainnet- und Testnet-Konfiguration gewechselt werden.

```bash
# Testnet (Standard)
node src/index.js

# Mainnet-Demo
node src/index.js mainnet

# Konkretes Testnet-Label (Groß-/Kleinschreibung egal)
node src/index.js TESTNET
```

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
